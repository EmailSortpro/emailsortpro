// CategoriesPage.js - Version 9.0 - Gestion complète des catégories et mots-clés

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.eventListenersSetup = false;
        this.lastNotificationTime = 0;
        
        // Gestion de synchronisation renforcée
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        // État des modales
        this.currentModal = null;
        this.editingCategoryId = null;
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 9.0 - Gestion complète des catégories et mots-clés');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal', 'hideExplanationMessage',
            'debugSettings', 'testCategorySelection', 'forceUpdateUI', 'forceSynchronization',
            'showCreateCategoryModal', 'createNewCategory', 'editCustomCategory', 'deleteCustomCategory',
            'saveKeywords', 'addKeyword', 'removeKeyword', 'toggleCategoryActive'
        ];
        
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // ================================================
    // CHARGEMENT ET SAUVEGARDE DES PARAMÈTRES
    // ================================================
    loadSettings() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            const settings = window.categoryManager.getSettings();
            console.log('[CategoriesPage] 📊 Settings chargés depuis CategoryManager:', settings);
            return settings;
        }
        
        try {
            const saved = localStorage.getItem('categorySettings');
            const settings = saved ? JSON.parse(saved) : this.getDefaultSettings();
            console.log('[CategoriesPage] 📊 Settings chargés depuis localStorage:', settings);
            return settings;
        } catch (error) {
            console.error('[CategoriesPage] Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(newSettings) {
        console.log('[CategoriesPage] 💾 === DÉBUT SAUVEGARDE SETTINGS ===');
        console.log('[CategoriesPage] 📥 Nouveaux settings à sauvegarder:', newSettings);
        
        if (window.categoryManager && typeof window.categoryManager.updateSettings === 'function') {
            console.log('[CategoriesPage] 🎯 Sauvegarde via CategoryManager');
            window.categoryManager.updateSettings(newSettings);
        } else {
            console.log('[CategoriesPage] 🔄 Fallback sauvegarde localStorage');
            try {
                localStorage.setItem('categorySettings', JSON.stringify(newSettings));
                
                setTimeout(() => {
                    this.dispatchEvent('categorySettingsChanged', { settings: newSettings });
                }, 10);
            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde paramètres:', error);
            }
        }
        
        setTimeout(() => {
            this.forceSynchronization();
        }, 50);
        
        console.log('[CategoriesPage] ✅ === FIN SAUVEGARDE SETTINGS ===');
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
            categoryExclusions: {
                domains: [],
                emails: []
            },
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            automationSettings: {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            },
            preferences: {
                darkMode: false,
                compactView: false,
                showNotifications: true,
                excludeSpam: true,
                detectCC: true
            }
        };
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    showCreateCategoryModal() {
        this.closeModal();
        
        const modalId = 'create-category-modal';
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>Créer une nouvelle catégorie</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="form-section">
                            <div class="form-group">
                                <label for="category-name">Nom de la catégorie *</label>
                                <input type="text" id="category-name" class="form-input" 
                                       placeholder="ex: Support Client" maxlength="50">
                            </div>
                            
                            <div class="form-group">
                                <label for="category-description">Description</label>
                                <textarea id="category-description" class="form-textarea" 
                                          placeholder="Description de la catégorie..." rows="3"></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="category-icon">Icône</label>
                                    <select id="category-icon" class="form-select">
                                        <option value="📂">📂 Dossier</option>
                                        <option value="💼">💼 Business</option>
                                        <option value="🎯">🎯 Objectif</option>
                                        <option value="⚡">⚡ Urgent</option>
                                        <option value="📧">📧 Email</option>
                                        <option value="🔔">🔔 Notification</option>
                                        <option value="💡">💡 Idée</option>
                                        <option value="🎨">🎨 Créatif</option>
                                        <option value="🔧">🔧 Technique</option>
                                        <option value="📊">📊 Analyse</option>
                                        <option value="🎓">🎓 Formation</option>
                                        <option value="🌟">🌟 Important</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="category-color">Couleur</label>
                                    <div class="color-picker">
                                        <input type="color" id="category-color" value="#6366f1">
                                        <div class="color-presets">
                                            ${this.renderColorPresets()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="category-priority">Priorité</label>
                                <select id="category-priority" class="form-select">
                                    <option value="10">Très basse (10)</option>
                                    <option value="30" selected>Normale (30)</option>
                                    <option value="50">Élevée (50)</option>
                                    <option value="70">Très élevée (70)</option>
                                    <option value="90">Critique (90)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.categoriesPage.closeModal()">
                            Annuler
                        </button>
                        <button class="btn btn-primary" onclick="window.categoriesPage.createNewCategory()">
                            <i class="fas fa-plus"></i>
                            Créer la catégorie
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = modalId;
        
        // Focus sur le champ nom
        setTimeout(() => {
            const nameInput = document.getElementById('category-name');
            if (nameInput) nameInput.focus();
        }, 100);
    }

    createNewCategory() {
        const name = document.getElementById('category-name')?.value?.trim();
        const description = document.getElementById('category-description')?.value?.trim();
        const icon = document.getElementById('category-icon')?.value;
        const color = document.getElementById('category-color')?.value;
        const priority = parseInt(document.getElementById('category-priority')?.value) || 30;
        
        if (!name) {
            this.showToast('Le nom de la catégorie est requis', 'error');
            return;
        }
        
        if (name.length < 2) {
            this.showToast('Le nom doit contenir au moins 2 caractères', 'error');
            return;
        }
        
        try {
            const categoryData = {
                name,
                description,
                icon: icon || '📂',
                color: color || '#6366f1',
                priority,
                keywords: {
                    absolute: [],
                    strong: [],
                    weak: [],
                    exclusions: []
                }
            };
            
            const newCategory = window.categoryManager?.createCustomCategory(categoryData);
            
            if (newCategory) {
                this.closeModal();
                this.showToast(`Catégorie "${name}" créée avec succès`, 'success');
                this.refreshCurrentTab();
                
                // Ouvrir directement la modal de mots-clés
                setTimeout(() => {
                    this.openKeywordsModal(newCategory.id);
                }, 500);
            } else {
                throw new Error('Erreur lors de la création');
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur création catégorie:', error);
            this.showToast('Erreur lors de la création de la catégorie', 'error');
        }
    }

    editCustomCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category || !category.isCustom) {
            this.showToast('Catégorie non trouvée ou non modifiable', 'error');
            return;
        }
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        const modalId = 'edit-category-modal';
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>Modifier la catégorie</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="form-section">
                            <div class="form-group">
                                <label for="edit-category-name">Nom de la catégorie *</label>
                                <input type="text" id="edit-category-name" class="form-input" 
                                       value="${category.name}" maxlength="50">
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-category-description">Description</label>
                                <textarea id="edit-category-description" class="form-textarea" 
                                          rows="3">${category.description || ''}</textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="edit-category-icon">Icône</label>
                                    <select id="edit-category-icon" class="form-select">
                                        <option value="📂" ${category.icon === '📂' ? 'selected' : ''}>📂 Dossier</option>
                                        <option value="💼" ${category.icon === '💼' ? 'selected' : ''}>💼 Business</option>
                                        <option value="🎯" ${category.icon === '🎯' ? 'selected' : ''}>🎯 Objectif</option>
                                        <option value="⚡" ${category.icon === '⚡' ? 'selected' : ''}>⚡ Urgent</option>
                                        <option value="📧" ${category.icon === '📧' ? 'selected' : ''}>📧 Email</option>
                                        <option value="🔔" ${category.icon === '🔔' ? 'selected' : ''}>🔔 Notification</option>
                                        <option value="💡" ${category.icon === '💡' ? 'selected' : ''}>💡 Idée</option>
                                        <option value="🎨" ${category.icon === '🎨' ? 'selected' : ''}>🎨 Créatif</option>
                                        <option value="🔧" ${category.icon === '🔧' ? 'selected' : ''}>🔧 Technique</option>
                                        <option value="📊" ${category.icon === '📊' ? 'selected' : ''}>📊 Analyse</option>
                                        <option value="🎓" ${category.icon === '🎓' ? 'selected' : ''}>🎓 Formation</option>
                                        <option value="🌟" ${category.icon === '🌟' ? 'selected' : ''}>🌟 Important</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="edit-category-color">Couleur</label>
                                    <div class="color-picker">
                                        <input type="color" id="edit-category-color" value="${category.color}">
                                        <div class="color-presets">
                                            ${this.renderColorPresets()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-category-priority">Priorité</label>
                                <select id="edit-category-priority" class="form-select">
                                    <option value="10" ${category.priority === 10 ? 'selected' : ''}>Très basse (10)</option>
                                    <option value="30" ${category.priority === 30 ? 'selected' : ''}>Normale (30)</option>
                                    <option value="50" ${category.priority === 50 ? 'selected' : ''}>Élevée (50)</option>
                                    <option value="70" ${category.priority === 70 ? 'selected' : ''}>Très élevée (70)</option>
                                    <option value="90" ${category.priority === 90 ? 'selected' : ''}>Critique (90)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.categoriesPage.closeModal()">
                            Annuler
                        </button>
                        <button class="btn btn-primary" onclick="window.categoriesPage.saveEditedCategory()">
                            <i class="fas fa-save"></i>
                            Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = modalId;
    }

    saveEditedCategory() {
        if (!this.editingCategoryId) return;
        
        const name = document.getElementById('edit-category-name')?.value?.trim();
        const description = document.getElementById('edit-category-description')?.value?.trim();
        const icon = document.getElementById('edit-category-icon')?.value;
        const color = document.getElementById('edit-category-color')?.value;
        const priority = parseInt(document.getElementById('edit-category-priority')?.value) || 30;
        
        if (!name) {
            this.showToast('Le nom de la catégorie est requis', 'error');
            return;
        }
        
        try {
            const updates = {
                name,
                description,
                icon,
                color,
                priority
            };
            
            window.categoryManager?.updateCustomCategory(this.editingCategoryId, updates);
            
            this.closeModal();
            this.showToast('Catégorie modifiée avec succès', 'success');
            this.refreshCurrentTab();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur modification catégorie:', error);
            this.showToast('Erreur lors de la modification', 'error');
        }
    }

    deleteCustomCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) {
            this.showToast('Catégorie non trouvée', 'error');
            return;
        }
        
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\nCette action est irréversible et supprimera tous les mots-clés associés.`)) {
            return;
        }
        
        try {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.showToast('Catégorie supprimée avec succès', 'success');
            this.refreshCurrentTab();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur suppression catégorie:', error);
            this.showToast('Erreur lors de la suppression', 'error');
        }
    }

    // ================================================
    // GESTION DES MOTS-CLÉS
    // ================================================
    openKeywordsModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) {
            this.showToast('Catégorie non trouvée', 'error');
            return;
        }
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
        
        const modalId = 'keywords-modal';
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container large">
                    <div class="modal-header">
                        <div class="category-header">
                            <div class="category-icon" style="background: ${category.color}20; color: ${category.color};">
                                ${category.icon}
                            </div>
                            <div>
                                <h2>Mots-clés - ${category.name}</h2>
                                <p>Gérez les mots-clés pour la détection automatique</p>
                            </div>
                        </div>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="keywords-explanation">
                            <div class="keyword-type-info">
                                <div class="info-item absolute">
                                    <span class="info-label">🎯 Absolus</span>
                                    <span class="info-desc">Mots-clés qui garantissent la catégorisation</span>
                                </div>
                                <div class="info-item strong">
                                    <span class="info-label">💪 Forts</span>
                                    <span class="info-desc">Mots-clés avec un poids élevé</span>
                                </div>
                                <div class="info-item weak">
                                    <span class="info-label">📝 Faibles</span>
                                    <span class="info-desc">Mots-clés avec un poids modéré</span>
                                </div>
                                <div class="info-item exclusions">
                                    <span class="info-label">🚫 Exclusions</span>
                                    <span class="info-desc">Mots-clés qui empêchent la catégorisation</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="keywords-sections">
                            ${this.renderKeywordSection('absolute', 'Mots-clés absolus', keywords.absolute, '🎯')}
                            ${this.renderKeywordSection('strong', 'Mots-clés forts', keywords.strong, '💪')}
                            ${this.renderKeywordSection('weak', 'Mots-clés faibles', keywords.weak, '📝')}
                            ${this.renderKeywordSection('exclusions', 'Exclusions', keywords.exclusions, '🚫')}
                        </div>
                        
                        <div class="keywords-test-section">
                            <h4><i class="fas fa-vial"></i> Test des mots-clés</h4>
                            <div class="test-input-group">
                                <input type="text" id="test-text" class="form-input" 
                                       placeholder="Tapez un texte pour tester la détection...">
                                <button class="btn btn-secondary" onclick="window.categoriesPage.testKeywords()">
                                    <i class="fas fa-search"></i>
                                    Tester
                                </button>
                            </div>
                            <div id="test-results" class="test-results"></div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.categoriesPage.closeModal()">
                            Fermer
                        </button>
                        <button class="btn btn-primary" onclick="window.categoriesPage.saveKeywords()">
                            <i class="fas fa-save"></i>
                            Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = modalId;
        
        this.setupKeywordEvents();
    }

    renderKeywordSection(type, title, keywords, icon) {
        const typeClass = type === 'exclusions' ? 'exclusions' : type;
        
        return `
            <div class="keyword-section ${typeClass}">
                <div class="section-header">
                    <h4>${icon} ${title}</h4>
                    <span class="keyword-count">${keywords.length} mot${keywords.length > 1 ? 's' : ''}-clé${keywords.length > 1 ? 's' : ''}</span>
                </div>
                
                <div class="add-keyword-form">
                    <input type="text" class="keyword-input" data-type="${type}" 
                           placeholder="Ajouter un mot-clé..." maxlength="100">
                    <button class="add-keyword-btn" onclick="window.categoriesPage.addKeyword('${type}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="keywords-list" data-type="${type}">
                    ${keywords.map(keyword => this.renderKeywordTag(keyword, type)).join('')}
                </div>
            </div>
        `;
    }

    renderKeywordTag(keyword, type) {
        return `
            <div class="keyword-tag ${type}" data-keyword="${keyword}">
                <span class="keyword-text">${keyword}</span>
                <button class="remove-keyword" onclick="window.categoriesPage.removeKeyword('${type}', '${keyword}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    setupKeywordEvents() {
        // Événements pour l'ajout de mots-clés avec Enter
        document.querySelectorAll('.keyword-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const type = input.dataset.type;
                    this.addKeyword(type);
                }
            });
        });
    }

    addKeyword(type) {
        const input = document.querySelector(`.keyword-input[data-type="${type}"]`);
        if (!input) return;
        
        const keyword = input.value.trim().toLowerCase();
        if (!keyword) return;
        
        if (keyword.length < 2) {
            this.showToast('Le mot-clé doit contenir au moins 2 caractères', 'error');
            return;
        }
        
        // Vérifier si le mot-clé existe déjà
        const existingKeywords = document.querySelectorAll(`.keywords-list[data-type="${type}"] .keyword-tag`);
        const exists = Array.from(existingKeywords).some(tag => 
            tag.dataset.keyword.toLowerCase() === keyword
        );
        
        if (exists) {
            this.showToast('Ce mot-clé existe déjà dans cette section', 'warning');
            return;
        }
        
        // Ajouter le mot-clé à l'interface
        const keywordsList = document.querySelector(`.keywords-list[data-type="${type}"]`);
        if (keywordsList) {
            const keywordTag = this.renderKeywordTag(keyword, type);
            keywordsList.insertAdjacentHTML('beforeend', keywordTag);
        }
        
        // Vider l'input
        input.value = '';
        
        // Mettre à jour le compteur
        this.updateKeywordCount(type);
        
        console.log(`[CategoriesPage] Mot-clé ajouté: ${keyword} (${type})`);
    }

    removeKeyword(type, keyword) {
        const keywordTag = document.querySelector(`.keywords-list[data-type="${type}"] .keyword-tag[data-keyword="${keyword}"]`);
        if (keywordTag) {
            keywordTag.remove();
            this.updateKeywordCount(type);
            console.log(`[CategoriesPage] Mot-clé supprimé: ${keyword} (${type})`);
        }
    }

    updateKeywordCount(type) {
        const keywords = document.querySelectorAll(`.keywords-list[data-type="${type}"] .keyword-tag`);
        const countElement = document.querySelector(`.keyword-section.${type} .keyword-count`);
        if (countElement) {
            const count = keywords.length;
            countElement.textContent = `${count} mot${count > 1 ? 's' : ''}-clé${count > 1 ? 's' : ''}`;
        }
    }
// CategoriesPage.js - Remplacer saveKeywords() vers ligne 840

saveKeywords() {
    if (!this.editingCategoryId) {
        this.showToast('Erreur: catégorie non sélectionnée', 'error');
        return;
    }
    
    try {
        const keywords = {
            absolute: this.getKeywordsFromList('absolute'),
            strong: this.getKeywordsFromList('strong'),
            weak: this.getKeywordsFromList('weak'),
            exclusions: this.getKeywordsFromList('exclusions')
        };
        
        console.log('[CategoriesPage] 💾 Sauvegarde mots-clés pour', this.editingCategoryId, ':', keywords);
        
        // Mettre à jour dans CategoryManager
        window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
        
        // IMPORTANT: Si c'est une catégorie personnalisée, sauvegarder aussi dans customCategories
        const category = window.categoryManager?.getCategory(this.editingCategoryId);
        if (category && category.isCustom) {
            const customCategories = window.categoryManager?.getCustomCategories() || {};
            if (customCategories[this.editingCategoryId]) {
                customCategories[this.editingCategoryId].keywords = keywords;
                localStorage.setItem('customCategories', JSON.stringify(customCategories));
                console.log('[CategoriesPage] 💾 Mots-clés sauvegardés dans customCategories');
            }
        }
        
        this.closeModal();
        this.showToast('Mots-clés sauvegardés avec succès', 'success');
        this.refreshCurrentTab();
        
        // Forcer la synchronisation et re-catégorisation
        setTimeout(() => {
            this.forceSynchronization();
            
            // Si des emails existent, forcer la re-catégorisation
            if (window.emailScanner?.emails?.length > 0) {
                console.log('[CategoriesPage] 🔄 Déclenchement re-catégorisation suite aux nouveaux mots-clés');
                window.emailScanner.recategorizeEmails();
            }
        }, 100);
        
    } catch (error) {
        console.error('[CategoriesPage] Erreur sauvegarde mots-clés:', error);
        this.showToast('Erreur lors de la sauvegarde', 'error');
    }
}

    getKeywordsFromList(type) {
        const keywordTags = document.querySelectorAll(`.keywords-list[data-type="${type}"] .keyword-tag`);
        return Array.from(keywordTags).map(tag => tag.dataset.keyword);
    }

    testKeywords() {
        const testText = document.getElementById('test-text')?.value?.trim();
        if (!testText) {
            this.showToast('Veuillez saisir un texte à tester', 'warning');
            return;
        }
        
        const keywords = {
            absolute: this.getKeywordsFromList('absolute'),
            strong: this.getKeywordsFromList('strong'),
            weak: this.getKeywordsFromList('weak'),
            exclusions: this.getKeywordsFromList('exclusions')
        };
        
        const results = this.analyzeTextWithKeywords(testText, keywords);
        this.displayTestResults(results);
    }

    analyzeTextWithKeywords(text, keywords) {
        const normalizedText = text.toLowerCase();
        const matches = [];
        let totalScore = 0;
        
        // Test des mots-clés absolus
        keywords.absolute.forEach(keyword => {
            if (normalizedText.includes(keyword.toLowerCase())) {
                matches.push({ keyword, type: 'absolute', score: 100 });
                totalScore += 100;
            }
        });
        
        // Test des mots-clés forts
        keywords.strong.forEach(keyword => {
            if (normalizedText.includes(keyword.toLowerCase())) {
                matches.push({ keyword, type: 'strong', score: 30 });
                totalScore += 30;
            }
        });
        
        // Test des mots-clés faibles
        keywords.weak.forEach(keyword => {
            if (normalizedText.includes(keyword.toLowerCase())) {
                matches.push({ keyword, type: 'weak', score: 10 });
                totalScore += 10;
            }
        });
        
        // Test des exclusions
        keywords.exclusions.forEach(keyword => {
            if (normalizedText.includes(keyword.toLowerCase())) {
                matches.push({ keyword, type: 'exclusions', score: -50 });
                totalScore -= 50;
            }
        });
        
        return {
            matches,
            totalScore: Math.max(0, totalScore),
            wouldMatch: totalScore >= 30
        };
    }

    displayTestResults(results) {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;
        
        const category = window.categoryManager?.getCategory(this.editingCategoryId);
        
        resultsContainer.innerHTML = `
            <div class="test-result ${results.wouldMatch ? 'match' : 'no-match'}">
                <div class="result-header">
                    <span class="result-status">
                        ${results.wouldMatch ? '✅ DÉTECTÉ' : '❌ NON DÉTECTÉ'}
                    </span>
                    <span class="result-score">Score: ${results.totalScore} points</span>
                </div>
                
                ${results.wouldMatch ? `
                    <div class="result-category">
                        Serait catégorisé comme: 
                        <span class="category-badge" style="background: ${category.color}20; color: ${category.color};">
                            ${category.icon} ${category.name}
                        </span>
                    </div>
                ` : ''}
                
                ${results.matches.length > 0 ? `
                    <div class="result-matches">
                        <h5>Mots-clés détectés:</h5>
                        <div class="matches-list">
                            ${results.matches.map(match => `
                                <span class="match-tag ${match.type}">
                                    ${match.keyword} 
                                    <span class="match-score">${match.score > 0 ? '+' : ''}${match.score}</span>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="no-matches">
                        Aucun mot-clé détecté dans le texte.
                    </div>
                `}
            </div>
        `;
    }

    // ================================================
    // GESTION DES CATÉGORIES ACTIVES
    // ================================================
    toggleCategoryActive(categoryId) {
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories;
        
        if (!activeCategories) {
            // Si null, toutes les catégories sont actives par défaut
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
        
        this.showToast(
            isActive ? 'Catégorie désactivée' : 'Catégorie activée', 
            'success'
        );
        
        this.refreshCurrentTab();
    }

    // ================================================
    // SYNCHRONISATION FORCÉE
    // ================================================
    forceSynchronization() {
        if (this.syncInProgress) {
            console.log('[CategoriesPage] 🔄 Synchronisation déjà en cours, ajout à la queue');
            this.pendingSync = true;
            return;
        }
        
        this.syncInProgress = true;
        console.log('[CategoriesPage] 🚀 === DÉBUT SYNCHRONISATION FORCÉE ===');
        
        try {
            const currentSettings = this.loadSettings();
            console.log('[CategoriesPage] 📊 Settings actuels:', currentSettings);
            
            this.syncAllModules(currentSettings);
            
            setTimeout(() => {
                this.dispatchEvent('forceSynchronization', {
                    settings: currentSettings,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                });
            }, 10);
            
            console.log('[CategoriesPage] ✅ Synchronisation forcée terminée');
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur synchronisation forcée:', error);
        } finally {
            this.syncInProgress = false;
            
            if (this.pendingSync) {
                this.pendingSync = false;
                setTimeout(() => {
                    this.forceSynchronization();
                }, 100);
            }
        }
    }

    syncAllModules(settings) {
        console.log('[CategoriesPage] 🔄 Synchronisation de tous les modules...');
        
        if (window.emailScanner) {
            console.log('[CategoriesPage] 📧 Synchronisation EmailScanner');
            
            if (typeof window.emailScanner.updateSettings === 'function') {
                window.emailScanner.updateSettings(settings);
            }
            
            if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                window.emailScanner.updateTaskPreselectedCategories(settings.taskPreselectedCategories || []);
            }
            
            if (typeof window.emailScanner.forceSettingsReload === 'function') {
                window.emailScanner.forceSettingsReload();
            }
        }
        
        if (window.aiTaskAnalyzer) {
            console.log('[CategoriesPage] 🤖 Synchronisation AITaskAnalyzer');
            
            if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                window.aiTaskAnalyzer.updatePreselectedCategories(settings.taskPreselectedCategories || []);
            }
            
            if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                window.aiTaskAnalyzer.updateAutomationSettings(settings.automationSettings || {});
            }
        }
        
        console.log('[CategoriesPage] ✅ Synchronisation modules terminée');
    }

notifySettingsChange(settingType, value) {
        const now = Date.now();
        
        // Créer une clé unique pour ce changement
        const notificationKey = `${settingType}_${JSON.stringify(value)}`;
        
        // Vérifier si on a déjà notifié récemment (anti-boucle)
        if (this.lastNotification === notificationKey && (now - this.lastNotificationTime) < 2000) {
            console.log(`[CategoriesPage] 🔄 Notification ignorée (trop récente): ${settingType}`);
            return;
        }
        
        this.lastNotification = notificationKey;
        this.lastNotificationTime = now;
        
        console.log(`[CategoriesPage] 📢 === NOTIFICATION CHANGEMENT ===`);
        console.log(`[CategoriesPage] 🎯 Type: ${settingType}`);
        console.log(`[CategoriesPage] 📊 Valeur:`, value);
        
        // Délai plus long pour éviter les cascades
        setTimeout(() => {
            this.dispatchEvent('settingsChanged', {
                type: settingType, 
                value: value,
                source: 'CategoriesPage',
                timestamp: now
            });
        }, 100);
        
        this.notifySpecificModules(settingType, value);
        
        // Délai encore plus long pour la synchronisation forcée
        setTimeout(() => {
            this.forceSynchronization();
        }, 500);
    }

    notifySpecificModules(settingType, value) {
        console.log(`[CategoriesPage] 🎯 Notification spécialisée pour: ${settingType}`);
        
        if (window.emailScanner) {
            switch (settingType) {
                case 'taskPreselectedCategories':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - catégories pré-sélectionnées');
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    break;
                case 'scanSettings':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - scan settings');
                    if (typeof window.emailScanner.applyScanSettings === 'function') {
                        window.emailScanner.applyScanSettings(value);
                    }
                    break;
                case 'preferences':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - préférences');
                    if (typeof window.emailScanner.updatePreferences === 'function') {
                        window.emailScanner.updatePreferences(value);
                    }
                    break;
            }
        }
        
        if (window.aiTaskAnalyzer) {
            if (settingType === 'taskPreselectedCategories') {
                console.log('[CategoriesPage] 🤖 Mise à jour AITaskAnalyzer - catégories pré-sélectionnées');
                if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
            }
            
            if (settingType === 'automationSettings') {
                console.log('[CategoriesPage] 🤖 Mise à jour AITaskAnalyzer - automation settings');
                if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                    window.aiTaskAnalyzer.updateAutomationSettings(value);
                }
            }
        }
        
        console.log('[CategoriesPage] ✅ Notifications spécialisées envoyées');
    }

    // ================================================
    // MISE À JOUR DES CATÉGORIES PRÉ-SÉLECTIONNÉES
    // ================================================
    updateTaskPreselectedCategories() {
        try {
            console.log('[CategoriesPage] 🎯 === DÉBUT updateTaskPreselectedCategories ===');
            
            const settings = this.loadSettings();
            const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
            
            console.log(`[CategoriesPage] 🔍 Trouvé ${checkboxes.length} checkboxes avec classe .category-preselect-checkbox`);
            
            const selectedCategories = [];
            const selectionDetails = [];
            
            checkboxes.forEach((checkbox, index) => {
                const details = {
                    index: index,
                    value: checkbox.value,
                    checked: checkbox.checked,
                    name: checkbox.dataset.categoryName,
                    element: checkbox
                };
                
                selectionDetails.push(details);
                
                console.log(`[CategoriesPage] 📋 Checkbox ${index}:`);
                console.log(`  - Value: "${checkbox.value}"`);
                console.log(`  - Checked: ${checkbox.checked}`);
                console.log(`  - Data name: "${checkbox.dataset.categoryName}"`);
                
                if (checkbox.checked && checkbox.value) {
                    selectedCategories.push(checkbox.value);
                    console.log(`  - ✅ AJOUTÉ à la sélection: ${checkbox.value}`);
                } else {
                    console.log(`  - ❌ PAS sélectionné`);
                }
            });
            
            console.log('[CategoriesPage] 🎯 Nouvelles catégories sélectionnées:', selectedCategories);
            console.log('[CategoriesPage] 📊 Anciennes catégories:', settings.taskPreselectedCategories);
            
            const oldCategories = settings.taskPreselectedCategories || [];
            const hasChanged = JSON.stringify([...selectedCategories].sort()) !== JSON.stringify([...oldCategories].sort());
            
            if (!hasChanged) {
                console.log('[CategoriesPage] 🔄 Aucun changement détecté, skip mise à jour');
                return;
            }
            
            console.log('[CategoriesPage] 📝 Changement détecté, mise à jour en cours...');
            
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            
            console.log('[CategoriesPage] 💾 Paramètres sauvegardés avec nouvelles catégories');
            
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            
            this.updateSelectionIndicators(selectedCategories);
            
            const categoryNames = selectedCategories.map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? category.name : catId;
            });
            
            this.showToast(`✅ ${selectedCategories.length} catégorie(s) pré-sélectionnée(s): ${categoryNames.join(', ')}`, 'success', 4000);
            this.updateAutomationStats();
            
            console.log('[CategoriesPage] 🎯 === FIN updateTaskPreselectedCategories ===');
            
            setTimeout(() => {
                this.verifySynchronization(selectedCategories);
            }, 1000);
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur updateTaskPreselectedCategories:', error);
            this.showToast('Erreur de mise à jour des catégories', 'error');
        }
    }

    // ================================================
    // VÉRIFICATION DE SYNCHRONISATION
    // ================================================
    verifySynchronization(expectedCategories) {
        console.log('[CategoriesPage] 🔍 Vérification de synchronisation...');
        
        try {
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            const emailScannerSync = JSON.stringify([...emailScannerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
            const categoryManagerSync = JSON.stringify([...categoryManagerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            console.log('[CategoriesPage] 📊 État de synchronisation:');
            console.log('  - Attendu:', expectedCategories);
            console.log('  - EmailScanner:', emailScannerCategories, emailScannerSync ? '✅' : '❌');
            console.log('  - CategoryManager:', categoryManagerCategories, categoryManagerSync ? '✅' : '❌');
            
            if (!emailScannerSync || !categoryManagerSync) {
                console.log('[CategoriesPage] ⚠️ Désynchronisation détectée, re-synchronisation...');
                this.forceSynchronization();
                
                this.showSyncStatus(false);
                
                setTimeout(() => {
                    this.verifySynchronization(expectedCategories);
                }, 2000);
            } else {
                console.log('[CategoriesPage] ✅ Synchronisation confirmée');
                this.showSyncStatus(true);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur vérification synchronisation:', error);
        }
    }

    // ================================================
    // INDICATEURS VISUELS DE SYNCHRONISATION
    // ================================================
    updateSelectionIndicators(selectedCategories) {
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        
        checkboxes.forEach(checkbox => {
            const container = checkbox.closest('.category-checkbox-item-enhanced');
            const existingIndicator = container?.querySelector('.selected-indicator');
            
            if (checkbox.checked && selectedCategories.includes(checkbox.value)) {
                if (!existingIndicator) {
                    const indicator = document.createElement('span');
                    indicator.className = 'selected-indicator';
                    indicator.textContent = '✓ Sélectionné';
                    
                    const content = container.querySelector('.category-checkbox-content-enhanced');
                    if (content) {
                        content.appendChild(indicator);
                    }
                }
            } else {
                if (existingIndicator) {
                    existingIndicator.remove();
                }
            }
        });
        
        console.log('[CategoriesPage] ✅ Indicateurs de sélection mis à jour');
    }

    showSyncStatus(isSync) {
        let indicator = document.getElementById('sync-status-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'sync-status-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                z-index: 10000;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(indicator);
        }
        
        if (isSync) {
            indicator.style.background = '#d1fae5';
            indicator.style.color = '#065f46';
            indicator.style.border = '1px solid #10b981';
            indicator.innerHTML = '<i class="fas fa-check-circle"></i> Synchronisé';
            
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
            }, 3000);
        } else {
            indicator.style.background = '#fef3c7';
            indicator.style.color = '#92400e';
            indicator.style.border = '1px solid #f59e0b';
            indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i> Synchronisation...';
        }
    }

    // ================================================
    // MÉTHODES DE SAUVEGARDE
    // ================================================
    savePreferences() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE PRÉFÉRENCES ===');
            
            const settings = this.loadSettings();
            
            const preferences = {
                darkMode: document.getElementById('darkMode')?.checked || false,
                compactView: document.getElementById('compactView')?.checked || false,
                showNotifications: document.getElementById('showNotifications')?.checked !== false,
                excludeSpam: document.getElementById('excludeSpam')?.checked !== false,
                detectCC: document.getElementById('detectCC')?.checked !== false
            };
            
            console.log('[CategoriesPage] 📊 Nouvelles préférences:', preferences);
            
            settings.preferences = preferences;
            this.saveSettings(settings);
            
            this.notifySettingsChange('preferences', preferences);
            this.showToast('Préférences sauvegardées', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur savePreferences:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveScanSettings() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE SCAN SETTINGS ===');
            
            const settings = this.loadSettings();
            
            const scanSettings = {
                defaultPeriod: parseInt(document.getElementById('defaultScanPeriod')?.value || 7),
                defaultFolder: document.getElementById('defaultFolder')?.value || 'inbox',
                autoAnalyze: document.getElementById('autoAnalyze')?.checked !== false,
                autoCategrize: document.getElementById('autoCategrize')?.checked !== false
            };
            
            console.log('[CategoriesPage] 📊 Nouveaux scan settings:', scanSettings);
            
            settings.scanSettings = scanSettings;
            this.saveSettings(settings);
            
            this.notifySettingsChange('scanSettings', scanSettings);
            this.showToast('Paramètres de scan sauvegardés', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveScanSettings:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveAutomationSettings() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE AUTOMATION SETTINGS ===');
            
            const settings = this.loadSettings();
            
            const automationSettings = {
                autoCreateTasks: document.getElementById('autoCreateTasks')?.checked || false,
                groupTasksByDomain: document.getElementById('groupTasksByDomain')?.checked || false,
                skipDuplicates: document.getElementById('skipDuplicates')?.checked !== false,
                autoAssignPriority: document.getElementById('autoAssignPriority')?.checked || false
            };
            
            console.log('[CategoriesPage] 📊 Nouveaux automation settings:', automationSettings);
            
            settings.automationSettings = automationSettings;
            this.saveSettings(settings);
            
            this.notifySettingsChange('automationSettings', automationSettings);
            this.showToast('Paramètres d\'automatisation sauvegardés', 'success');
            this.updateAutomationStats();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveAutomationSettings:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    // ================================================
    // RENDU PRINCIPAL DE LA PAGE PARAMÈTRES
    // ================================================
    renderSettings(container) {
        if (!container) {
            console.error('[CategoriesPage] Container manquant');
            return;
        }

        try {
            const moduleStatus = this.checkModuleAvailability();
            const settings = this.loadSettings();
            
            const syncStatus = this.checkSyncStatus(settings);
            
            container.innerHTML = `
                <div class="settings-page-compact">
                    <div class="page-header-compact">
                        <h1>Paramètres</h1>
                        ${this.renderModuleStatusBar(moduleStatus)}
                        ${this.renderSyncStatusBar(syncStatus)}
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.debugSettings()" title="Debug">
                                <i class="fas fa-bug"></i> Debug
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.testCategorySelection()" title="Test">
                                <i class="fas fa-vial"></i> Test
                            </button>
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.forceSynchronization()" title="Forcer Sync">
                                <i class="fas fa-sync"></i> Synchroniser
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.forceUpdateUI()" title="Refresh">
                                <i class="fas fa-redo"></i> Refresh
                            </button>
                        </div>
                    </div>

                    <!-- Onglets -->
                    <div class="settings-tabs-compact">
                        <button class="tab-button-compact ${this.currentTab === 'general' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('general')">
                            <i class="fas fa-cog"></i> Général
                        </button>
                        <button class="tab-button-compact ${this.currentTab === 'automation' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('automation')">
                            <i class="fas fa-magic"></i> Automatisation
                        </button>
                        <button class="tab-button-compact ${this.currentTab === 'keywords' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('keywords')">
                            <i class="fas fa-key"></i> Catégories
                        </button>
                    </div>

                    <!-- Contenu des onglets -->
                    <div class="tab-content-compact" id="tabContent">
                        ${this.renderTabContent(settings, moduleStatus)}
                    </div>
                </div>
            `;
            
            this.addStyles();
            
            setTimeout(() => {
                this.initializeEventListeners();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = this.renderErrorState(error);
        }
    }

    // ================================================
    // RENDU DU CONTENU DES ONGLETS
    // ================================================
    renderTabContent(settings, moduleStatus) {
        switch (this.currentTab) {
            case 'general':
                return this.renderGeneralTab(settings, moduleStatus);
            case 'automation':
                return this.renderAutomationTab(settings, moduleStatus);
            case 'keywords':
                return this.renderKeywordsTab(settings, moduleStatus);
            default:
                return this.renderGeneralTab(settings, moduleStatus);
        }
    }

    // ================================================
    // ONGLET GÉNÉRAL
    // ================================================
    renderGeneralTab(settings, moduleStatus) {
        return `
            <div class="settings-grid-compact">
                <!-- Carte Préférences -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-cog"></i>
                        <h3>Préférences générales</h3>
                    </div>
                    
                    <div class="settings-form-compact">
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="darkMode" ${settings.preferences?.darkMode ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Mode sombre</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="compactView" ${settings.preferences?.compactView ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Vue compacte</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="showNotifications" ${settings.preferences?.showNotifications !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Notifications</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="excludeSpam" ${settings.preferences?.excludeSpam !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Exclure les spams</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="detectCC" ${settings.preferences?.detectCC !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Détecter les emails en CC</span>
                        </label>
                    </div>
                </div>

                <!-- Carte Paramètres de scan -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-search"></i>
                        <h3>Paramètres de scan</h3>
                    </div>
                    
                    <div class="settings-form-compact">
                        <div class="form-group-compact">
                            <label>Période par défaut (jours)</label>
                            <select id="defaultScanPeriod" class="form-select-compact">
                                <option value="1" ${settings.scanSettings?.defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                <option value="3" ${settings.scanSettings?.defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                <option value="7" ${settings.scanSettings?.defaultPeriod === 7 ? 'selected' : ''}>7 jours</option>
                                <option value="15" ${settings.scanSettings?.defaultPeriod === 15 ? 'selected' : ''}>15 jours</option>
                                <option value="30" ${settings.scanSettings?.defaultPeriod === 30 ? 'selected' : ''}>30 jours</option>
                            </select>
                        </div>
                        
                        <div class="form-group-compact">
                            <label>Dossier par défaut</label>
                            <select id="defaultFolder" class="form-select-compact">
                                <option value="inbox" ${settings.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                <option value="all" ${settings.scanSettings?.defaultFolder === 'all' ? 'selected' : ''}>Tous les dossiers</option>
                            </select>
                        </div>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="autoAnalyze" ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Analyse IA automatique</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="autoCategrize" ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Catégorisation automatique</span>
                        </label>
                    </div>
                </div>

                <!-- Carte Import/Export -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-file-import"></i>
                        <h3>Import/Export</h3>
                    </div>
                    
                    <div class="import-export-section">
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.exportSettings()">
                            <i class="fas fa-download"></i> Exporter paramètres
                        </button>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.importSettings()">
                            <i class="fas fa-upload"></i> Importer paramètres
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // ONGLET AUTOMATISATION
    // ================================================
    renderAutomationTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            console.log('[CategoriesPage] 🎯 Rendu automatisation:');
            console.log('  - Catégories disponibles:', Object.keys(categories));
            console.log('  - Catégories pré-sélectionnées:', preselectedCategories);
            
            return `
                <div class="automation-focused-layout">
                    <div class="settings-card-compact full-width">
                        <div class="card-header-compact">
                            <i class="fas fa-check-square"></i>
                            <h3>Conversion automatique en tâches</h3>
                            ${moduleStatus.aiTaskAnalyzer ? 
                                '<span class="status-badge status-ok">✓ IA Disponible</span>' : 
                                '<span class="status-badge status-warning">⚠ IA Limitée</span>'
                            }
                        </div>
                        <p>Sélectionnez les catégories d'emails qui seront automatiquement proposées pour la création de tâches et configurez le comportement de l'automatisation.</p>
                        
                        <!-- Indicateur de synchronisation temps réel -->
                        <div id="automation-sync-indicator" class="automation-sync-indicator">
                            ${this.renderAutomationSyncIndicator(preselectedCategories)}
                        </div>
                        
                        <!-- Sélection des catégories -->
                        <div class="task-automation-section">
                            <h4><i class="fas fa-tags"></i> Catégories pré-sélectionnées</h4>
                            <div class="categories-selection-grid-automation" id="categoriesSelectionGrid">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = preselectedCategories.includes(id);
                                    console.log(`[CategoriesPage] 📋 Catégorie ${id} (${category.name}): ${isPreselected ? 'SÉLECTIONNÉE' : 'non sélectionnée'}`);
                                    return `
                                        <label class="category-checkbox-item-enhanced" data-category-id="${id}">
                                            <input type="checkbox" 
                                                   class="category-preselect-checkbox"
                                                   value="${id}"
                                                   data-category-name="${category.name}"
                                                   ${isPreselected ? 'checked' : ''}
                                                   onchange="window.categoriesPage.updateTaskPreselectedCategories()">
                                            <div class="category-checkbox-content-enhanced">
                                                <span class="cat-icon-automation" style="background: ${category.color}20; color: ${category.color}">
                                                    ${category.icon}
                                                </span>
                                                <span class="cat-name-automation">${category.name}</span>
                                                ${category.isCustom ? '<span class="custom-badge">Personnalisée</span>' : ''}
                                                ${isPreselected ? '<span class="selected-indicator">✓ Sélectionné</span>' : ''}
                                            </div>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- Options d'automatisation -->
                        <div class="automation-options-enhanced">
                            <h4><i class="fas fa-cog"></i> Options d'automatisation</h4>
                            <div class="automation-options-grid">
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoCreateTasks" 
                                           ${settings.automationSettings?.autoCreateTasks ? 'checked' : ''}
                                           ${moduleStatus.aiTaskAnalyzer ? '' : 'disabled'}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Création automatique</span>
                                        <span class="checkbox-description">Créer automatiquement les tâches sans confirmation</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="groupTasksByDomain" 
                                           ${settings.automationSettings?.groupTasksByDomain ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Regroupement par domaine</span>
                                        <span class="checkbox-description">Regrouper les tâches par domaine d'expéditeur</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="skipDuplicates" 
                                           ${settings.automationSettings?.skipDuplicates !== false ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Ignorer les doublons</span>
                                        <span class="checkbox-description">Éviter de créer des tâches en double</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoAssignPriority" 
                                           ${settings.automationSettings?.autoAssignPriority ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Priorité automatique</span>
                                        <span class="checkbox-description">Assigner automatiquement la priorité selon l'expéditeur</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Statistiques avec état synchronisation -->
                        <div class="automation-stats">
                            <h4><i class="fas fa-chart-bar"></i> Statistiques</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-categories">${preselectedCategories.length}</span>
                                    <span class="stat-label">Catégories actives</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-exclusions">${(settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0)}</span>
                                    <span class="stat-label">Règles d'exclusion</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-automation">${Object.values(settings.automationSettings || {}).filter(Boolean).length}</span>
                                    <span class="stat-label">Options activées</span>
                                </div>
                                <div class="stat-item sync-stat">
                                    <span class="stat-number" id="stat-sync">${this.checkSyncStatus(settings).isSync ? '✅' : '⚠️'}</span>
                                    <span class="stat-label">Synchronisation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderAutomationTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet automatisation</div>';
        }
    }

openCategoryFiltersModal(categoryId) {
    const category = window.categoryManager?.getCategory(categoryId);
    if (!category) {
        this.showToast('Catégorie non trouvée', 'error');
        return;
    }
    
    this.closeModal();
    this.editingCategoryId = categoryId;
    
    const filters = window.categoryManager?.getCategoryFilters(categoryId) || {
        includeDomains: [],
        excludeDomains: [],
        includeEmails: [],
        excludeEmails: []
    };
    
    const modalId = 'category-filters-modal';
    const modalHTML = `
        <div id="${modalId}" class="modal-overlay">
            <div class="modal-container medium">
                <div class="modal-header">
                    <div class="category-header">
                        <div class="category-icon" style="background: ${category.color}20; color: ${category.color};">
                            ${category.icon}
                        </div>
                        <div>
                            <h2>Filtres - ${category.name}</h2>
                            <p>Gérez les domaines et emails à inclure ou exclure pour cette catégorie</p>
                        </div>
                    </div>
                    <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-content">
                    <div class="filters-sections">
                        <!-- Inclure des domaines -->
                        <div class="filter-section include-section">
                            <h4><i class="fas fa-plus-circle"></i> Domaines à inclure</h4>
                            <p class="filter-description">Les emails de ces domaines seront prioritairement classés dans cette catégorie</p>
                            <div class="filter-input-group">
                                <input type="text" id="include-domain-input" class="filter-input" 
                                       placeholder="Ajouter un domaine (ex: company.com)" 
                                       onkeypress="if(event.key==='Enter') window.categoriesPage.addCategoryFilter('${categoryId}', 'includeDomains')">
                                <button class="btn-add-filter" onclick="window.categoriesPage.addCategoryFilter('${categoryId}', 'includeDomains')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="filter-list" id="include-domains-list">
                                ${filters.includeDomains.map(domain => `
                                    <span class="filter-tag include">
                                        <i class="fas fa-globe"></i> ${domain}
                                        <button onclick="window.categoriesPage.removeCategoryFilter('${categoryId}', 'includeDomains', '${domain}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Inclure des emails -->
                        <div class="filter-section include-section">
                            <h4><i class="fas fa-plus-circle"></i> Emails à inclure</h4>
                            <p class="filter-description">Les emails de ces expéditeurs seront prioritairement classés dans cette catégorie</p>
                            <div class="filter-input-group">
                                <input type="text" id="include-email-input" class="filter-input" 
                                       placeholder="Ajouter un email (ex: contact@example.com)" 
                                       onkeypress="if(event.key==='Enter') window.categoriesPage.addCategoryFilter('${categoryId}', 'includeEmails')">
                                <button class="btn-add-filter" onclick="window.categoriesPage.addCategoryFilter('${categoryId}', 'includeEmails')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="filter-list" id="include-emails-list">
                                ${filters.includeEmails.map(email => `
                                    <span class="filter-tag include">
                                        <i class="fas fa-envelope"></i> ${email}
                                        <button onclick="window.categoriesPage.removeCategoryFilter('${categoryId}', 'includeEmails', '${email}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Exclure des domaines -->
                        <div class="filter-section exclude-section">
                            <h4><i class="fas fa-minus-circle"></i> Domaines à exclure</h4>
                            <p class="filter-description">Les emails de ces domaines ne seront jamais classés dans cette catégorie</p>
                            <div class="filter-input-group">
                                <input type="text" id="exclude-domain-input" class="filter-input" 
                                       placeholder="Ajouter un domaine à exclure" 
                                       onkeypress="if(event.key==='Enter') window.categoriesPage.addCategoryFilter('${categoryId}', 'excludeDomains')">
                                <button class="btn-add-filter" onclick="window.categoriesPage.addCategoryFilter('${categoryId}', 'excludeDomains')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="filter-list" id="exclude-domains-list">
                                ${filters.excludeDomains.map(domain => `
                                    <span class="filter-tag exclude">
                                        <i class="fas fa-globe"></i> ${domain}
                                        <button onclick="window.categoriesPage.removeCategoryFilter('${categoryId}', 'excludeDomains', '${domain}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Exclure des emails -->
                        <div class="filter-section exclude-section">
                            <h4><i class="fas fa-minus-circle"></i> Emails à exclure</h4>
                            <p class="filter-description">Les emails de ces expéditeurs ne seront jamais classés dans cette catégorie</p>
                            <div class="filter-input-group">
                                <input type="text" id="exclude-email-input" class="filter-input" 
                                       placeholder="Ajouter un email à exclure" 
                                       onkeypress="if(event.key==='Enter') window.categoriesPage.addCategoryFilter('${categoryId}', 'excludeEmails')">
                                <button class="btn-add-filter" onclick="window.categoriesPage.addCategoryFilter('${categoryId}', 'excludeEmails')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="filter-list" id="exclude-emails-list">
                                ${filters.excludeEmails.map(email => `
                                    <span class="filter-tag exclude">
                                        <i class="fas fa-envelope"></i> ${email}
                                        <button onclick="window.categoriesPage.removeCategoryFilter('${categoryId}', 'excludeEmails', '${email}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.categoriesPage.closeModal()">
                        Fermer
                    </button>
                    <button class="btn btn-primary" onclick="window.categoriesPage.saveCategoryFilters()">
                        <i class="fas fa-save"></i> Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    this.currentModal = modalId;
}

addCategoryFilter(categoryId, filterType) {
    const inputMap = {
        'includeDomains': 'include-domain-input',
        'includeEmails': 'include-email-input',
        'excludeDomains': 'exclude-domain-input',
        'excludeEmails': 'exclude-email-input'
    };
    
    const input = document.getElementById(inputMap[filterType]);
    if (!input) return;
    
    const value = input.value.trim().toLowerCase();
    if (!value) return;
    
    // Validation basique
    if (filterType.includes('Emails') && !value.includes('@')) {
        this.showToast('Format d\'email invalide', 'error');
        return;
    }
    
    if (filterType.includes('Domains') && value.includes('@')) {
        this.showToast('Entrez uniquement le domaine (sans @)', 'error');
        return;
    }
    
    // Ajouter à la liste temporaire
    const listId = filterType.replace(/([A-Z])/g, '-$1').toLowerCase() + '-list';
    const list = document.getElementById(listId);
    
    if (list) {
        // Vérifier si déjà présent
        const existing = list.querySelector(`[data-value="${value}"]`);
        if (existing) {
            this.showToast('Déjà dans la liste', 'warning');
            return;
        }
        
        const icon = filterType.includes('Emails') ? 'envelope' : 'globe';
        const tagClass = filterType.includes('include') ? 'include' : 'exclude';
        
        const tagHTML = `
            <span class="filter-tag ${tagClass}" data-value="${value}">
                <i class="fas fa-${icon}"></i> ${value}
                <button onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `;
        
        list.insertAdjacentHTML('beforeend', tagHTML);
    }
    
    input.value = '';
    console.log(`[CategoriesPage] Filtre ajouté: ${filterType} - ${value}`);
}

removeCategoryFilter(categoryId, filterType, value) {
    // Cette fonction sera appelée depuis la modal, donc on peut directement
    // supprimer l'élément du DOM et sauvegarder ensuite
    const element = event.target.closest('.filter-tag');
    if (element) {
        element.remove();
    }
}

saveCategoryFilters() {
    if (!this.editingCategoryId) return;
    
    try {
        const filters = {
            includeDomains: [],
            excludeDomains: [],
            includeEmails: [],
            excludeEmails: []
        };
        
        // Collecter tous les filtres depuis le DOM
        const filterTypes = ['include-domains', 'include-emails', 'exclude-domains', 'exclude-emails'];
        
        filterTypes.forEach(type => {
            const list = document.getElementById(`${type}-list`);
            if (list) {
                const tags = list.querySelectorAll('.filter-tag');
                const filterKey = type.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                
                tags.forEach(tag => {
                    const value = tag.dataset.value || tag.textContent.trim().replace(/^[^\s]+\s/, '').replace(/\s*×$/, '');
                    if (value) {
                        filters[filterKey].push(value);
                    }
                });
            }
        });
        
        console.log('[CategoriesPage] 💾 Sauvegarde filtres pour', this.editingCategoryId, ':', filters);
        
        // Sauvegarder dans CategoryManager
        window.categoryManager?.updateCategoryFilters(this.editingCategoryId, filters);
        
        this.closeModal();
        this.showToast('Filtres sauvegardés avec succès', 'success');
        
        // Forcer la re-catégorisation si des emails existent
        setTimeout(() => {
            if (window.emailScanner?.emails?.length > 0) {
                console.log('[CategoriesPage] 🔄 Déclenchement re-catégorisation suite aux nouveaux filtres');
                window.emailScanner.recategorizeEmails();
            }
        }, 100);
        
    } catch (error) {
        console.error('[CategoriesPage] Erreur sauvegarde filtres:', error);
        this.showToast('Erreur lors de la sauvegarde', 'error');
    }
}

    // ================================================
    // INDICATEURS DE STATUT
    // ================================================
    checkSyncStatus(settings) {
        try {
            const expectedCategories = settings.taskPreselectedCategories || [];
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
            
            const emailScannerSync = JSON.stringify([...emailScannerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            const categoryManagerSync = JSON.stringify([...categoryManagerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            return {
                isSync: emailScannerSync && categoryManagerSync,
                emailScannerSync,
                categoryManagerSync,
                expectedCategories,
                emailScannerCategories,
                categoryManagerCategories
            };
        } catch (error) {
            console.error('[CategoriesPage] Erreur check sync status:', error);
            return {
                isSync: false,
                emailScannerSync: false,
                categoryManagerSync: false,
                expectedCategories: [],
                emailScannerCategories: [],
                categoryManagerCategories: []
            };
        }
    }

    renderSyncStatusBar(syncStatus) {
        const statusColor = syncStatus.isSync ? '#10b981' : '#f59e0b';
        const statusIcon = syncStatus.isSync ? 'fa-check-circle' : 'fa-exclamation-triangle';
        const statusText = syncStatus.isSync ? 
            `Synchronisé - ${syncStatus.expectedCategories.length} catégorie(s) pré-sélectionnée(s)` :
            'Désynchronisation détectée';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas ${statusIcon}"></i> 
                État synchronisation: ${statusText}
                ${!syncStatus.isSync ? `
                    <button onclick="window.categoriesPage.forceSynchronization()" 
                            style="margin-left: 12px; padding: 2px 8px; background: ${statusColor}; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">
                        Corriger
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderAutomationSyncIndicator(preselectedCategories) {
        const syncStatus = this.checkSyncStatus({ taskPreselectedCategories: preselectedCategories });
        
        if (syncStatus.isSync) {
            return `
                <div class="sync-indicator sync-ok">
                    <i class="fas fa-check-circle"></i>
                    <span>Synchronisation OK - ${preselectedCategories.length} catégorie(s) active(s)</span>
                </div>
            `;
        } else {
            return `
                <div class="sync-indicator sync-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Désynchronisation détectée - Correction automatique en cours</span>
                    <button class="btn-fix-sync-small" onclick="window.categoriesPage.forceSynchronization()">
                        <i class="fas fa-sync"></i> Corriger
                    </button>
                </div>
            `;
        }
    }

    // ================================================
    // INITIALISATION DES ÉVÉNEMENTS
    // ================================================
    initializeEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        try {
            // Préférences générales
            const preferences = ['darkMode', 'compactView', 'showNotifications', 'excludeSpam', 'detectCC'];
            preferences.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.savePreferences);
                    element.addEventListener('change', this.savePreferences);
                }
            });

            // Paramètres de scan
            const scanSettings = ['defaultScanPeriod', 'defaultFolder', 'autoAnalyze', 'autoCategrize'];
            scanSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.saveScanSettings);
                    element.addEventListener('change', this.saveScanSettings);
                }
            });

            // Paramètres d'automatisation
            const automationSettings = ['autoCreateTasks', 'groupTasksByDomain', 'skipDuplicates', 'autoAssignPriority'];
            automationSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.saveAutomationSettings);
                    element.addEventListener('change', this.saveAutomationSettings);
                }
            });

            // Catégories pré-sélectionnées pour les tâches
            const categoryCheckboxes = document.querySelectorAll('.category-preselect-checkbox');
            console.log(`[CategoriesPage] 🎯 Initialisation de ${categoryCheckboxes.length} checkboxes`);
            
            categoryCheckboxes.forEach((checkbox, index) => {
                console.log(`[CategoriesPage] 📋 Setup checkbox ${index}: value=${checkbox.value}, checked=${checkbox.checked}, name=${checkbox.dataset.categoryName}`);
                
                checkbox.removeEventListener('change', this.updateTaskPreselectedCategories);
                checkbox.removeEventListener('click', this.updateTaskPreselectedCategories);
                checkbox.removeEventListener('input', this.updateTaskPreselectedCategories);
                
                const handlerChange = (event) => {
                    console.log(`[CategoriesPage] 🔔 CHANGE détecté sur checkbox: ${event.target.value}, checked: ${event.target.checked}`);
                    this.updateTaskPreselectedCategories();
                };
                
                const handlerClick = (event) => {
                    console.log(`[CategoriesPage] 🔔 CLICK détecté sur checkbox: ${event.target.value}, checked: ${event.target.checked}`);
                    setTimeout(() => {
                        this.updateTaskPreselectedCategories();
                    }, 10);
                };
                
                checkbox.addEventListener('change', handlerChange);
                checkbox.addEventListener('click', handlerClick);
                
                checkbox._changeHandler = handlerChange;
                checkbox._clickHandler = handlerClick;
            });

            // Ajout rapide d'exclusions
            const quickInput = document.getElementById('quick-exclusion-input');
            if (quickInput) {
                quickInput.removeEventListener('keypress', this.handleQuickExclusionKeypress);
                quickInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addQuickExclusion();
                    }
                });
            }

            this.eventListenersSetup = true;
            console.log('[CategoriesPage] ✅ Événements initialisés');
            
            setTimeout(() => {
                this.verifyCheckboxState();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur initialisation événements:', error);
        }
    }

    // ================================================
    // VÉRIFICATION DE L'ÉTAT DES CHECKBOXES
    // ================================================
    verifyCheckboxState() {
        console.log('[CategoriesPage] 🔍 Vérification état des checkboxes...');
        
        const settings = this.loadSettings();
        const expectedSelected = settings.taskPreselectedCategories || [];
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        
        let mismatches = 0;
        
        checkboxes.forEach((checkbox, index) => {
            const shouldBeChecked = expectedSelected.includes(checkbox.value);
            const isChecked = checkbox.checked;
            
            if (shouldBeChecked !== isChecked) {
                console.log(`[CategoriesPage] ⚠️ Mismatch checkbox ${index}: value=${checkbox.value}, shouldBe=${shouldBeChecked}, is=${isChecked}`);
                checkbox.checked = shouldBeChecked;
                mismatches++;
            }
        });
        
        if (mismatches > 0) {
            console.log(`[CategoriesPage] 🔧 ${mismatches} checkboxes corrigées`);
            this.updateSelectionIndicators(expectedSelected);
        } else {
            console.log('[CategoriesPage] ✅ Tous les checkboxes sont dans le bon état');
        }
    }

    // ================================================
    // NAVIGATION ENTRE ONGLETS
    // ================================================
    switchTab(tab) {
        try {
            console.log(`[CategoriesPage] 🔄 Changement onglet vers: ${tab}`);
            
            this.currentTab = tab;
            const tabContent = document.getElementById('tabContent');
            
            if (!tabContent) {
                console.error('[CategoriesPage] Element tabContent non trouvé');
                return;
            }

            const moduleStatus = this.checkModuleAvailability();
            const settings = this.loadSettings();
            
            document.querySelectorAll('.tab-button-compact').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeButton = document.querySelector(`.tab-button-compact[onclick*="${tab}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            tabContent.innerHTML = this.renderTabContent(settings, moduleStatus);
            
            setTimeout(() => {
                this.initializeEventListeners();
                
                if (tab === 'automation') {
                    setTimeout(() => {
                        const currentCategories = settings.taskPreselectedCategories || [];
                        this.verifySynchronization(currentCategories);
                    }, 200);
                }
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur changement onglet:', error);
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    updateAutomationStats() {
        try {
            const settings = this.loadSettings();
            const statCategories = document.getElementById('stat-categories');
            const statExclusions = document.getElementById('stat-exclusions');
            const statAutomation = document.getElementById('stat-automation');
            const statSync = document.getElementById('stat-sync');
            
            if (statCategories) {
                statCategories.textContent = settings.taskPreselectedCategories?.length || 0;
            }
            if (statExclusions) {
                statExclusions.textContent = (settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0);
            }
            if (statAutomation) {
                statAutomation.textContent = Object.values(settings.automationSettings || {}).filter(Boolean).length;
            }
            if (statSync) {
                const syncStatus = this.checkSyncStatus(settings);
                statSync.textContent = syncStatus.isSync ? '✅' : '⚠️';
            }
            
            const syncIndicator = document.getElementById('automation-sync-indicator');
            if (syncIndicator) {
                syncIndicator.innerHTML = this.renderAutomationSyncIndicator(settings.taskPreselectedCategories || []);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateAutomationStats:', error);
        }
    }

    refreshCurrentTab() {
        try {
            const tabContent = document.getElementById('tabContent');
            const settings = this.loadSettings();
            const moduleStatus = this.checkModuleAvailability();
            
            if (tabContent) {
                tabContent.innerHTML = this.renderTabContent(settings, moduleStatus);
                
                this.eventListenersSetup = false;
                setTimeout(() => {
                    this.initializeEventListeners();
                }, 100);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur refreshCurrentTab:', error);
        }
    }

    // ================================================
    // MÉTHODES DE GESTION DES EXCLUSIONS
    // ================================================
    addQuickExclusion() {
        const input = document.getElementById('quick-exclusion-input');
        if (!input || !input.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const settings = this.loadSettings();
        
        if (!settings.categoryExclusions) {
            settings.categoryExclusions = { domains: [], emails: [] };
        }
        
        if (value.includes('@')) {
            if (!settings.categoryExclusions.emails.includes(value)) {
                settings.categoryExclusions.emails.push(value);
            }
        } else {
            if (!settings.categoryExclusions.domains.includes(value)) {
                settings.categoryExclusions.domains.push(value);
            }
        }
        
        this.saveSettings(settings);
        input.value = '';
        
        this.refreshCurrentTab();
        this.showToast('Exclusion ajoutée', 'success');
    }

    removeExclusion(type, value) {
        const settings = this.loadSettings();
        
        if (type === 'domain') {
            settings.categoryExclusions.domains = settings.categoryExclusions.domains.filter(d => d !== value);
        } else {
            settings.categoryExclusions.emails = settings.categoryExclusions.emails.filter(e => e !== value);
        }
        
        this.saveSettings(settings);
        this.refreshCurrentTab();
        this.showToast('Exclusion supprimée', 'success');
    }

    openAllKeywordsModal() {
        this.closeModal();
        
        const categories = window.categoryManager?.getCategories() || {};
        const modalId = 'all-keywords-modal';
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container large">
                    <div class="modal-header">
                        <h2><i class="fas fa-list"></i> Tous les mots-clés</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="all-keywords-content">
                            ${Object.entries(categories).map(([id, category]) => {
                                const keywords = window.categoryManager?.getCategoryKeywords(id) || { absolute: [], strong: [], weak: [], exclusions: [] };
                                const totalKeywords = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
                                
                                if (totalKeywords === 0) return '';
                                
                                return `
                                    <div class="category-keywords-summary">
                                        <div class="category-summary-header">
                                            <div class="category-icon" style="background: ${category.color}20; color: ${category.color};">
                                                ${category.icon}
                                            </div>
                                            <h4>${category.name}</h4>
                                            <span class="keywords-count">${totalKeywords} mots-clés</span>
                                        </div>
                                        
                                        ${keywords.absolute?.length > 0 ? `
                                            <div class="keywords-type-list">
                                                <h5>🎯 Absolus (${keywords.absolute.length})</h5>
                                                <div class="keywords-tags">
                                                    ${keywords.absolute.map(kw => `<span class="keyword-tag absolute">${kw}</span>`).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${keywords.strong?.length > 0 ? `
                                            <div class="keywords-type-list">
                                                <h5>💪 Forts (${keywords.strong.length})</h5>
                                                <div class="keywords-tags">
                                                    ${keywords.strong.map(kw => `<span class="keyword-tag strong">${kw}</span>`).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${keywords.weak?.length > 0 ? `
                                            <div class="keywords-type-list">
                                                <h5>📝 Faibles (${keywords.weak.length})</h5>
                                                <div class="keywords-tags">
                                                    ${keywords.weak.map(kw => `<span class="keyword-tag weak">${kw}</span>`).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${keywords.exclusions?.length > 0 ? `
                                            <div class="keywords-type-list">
                                                <h5>🚫 Exclusions (${keywords.exclusions.length})</h5>
                                                <div class="keywords-tags">
                                                    ${keywords.exclusions.map(kw => `<span class="keyword-tag exclusions">${kw}</span>`).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.categoriesPage.closeModal()">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = modalId;
    }

    openExclusionsModal() {
        this.closeModal();
        
        const settings = this.loadSettings();
        const modalId = 'exclusions-modal';
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-ban"></i> Gestion des exclusions</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="exclusions-management">
                            <p>Gérez les domaines et emails qui ne doivent jamais être catégorisés automatiquement.</p>
                            
                            <div class="exclusion-form">
                                <h4>Ajouter une exclusion</h4>
                                <div class="form-group">
                                    <input type="text" id="new-exclusion-input" class="form-input" 
                                           placeholder="Domaine (ex: newsletter.com) ou email (ex: spam@example.com)">
                                    <button class="btn btn-primary" onclick="window.categoriesPage.addExclusionFromModal()">
                                        <i class="fas fa-plus"></i> Ajouter
                                    </button>
                                </div>
                            </div>
                            
                            <div class="current-exclusions">
                                <h4>Exclusions actuelles</h4>
                                
                                ${settings.categoryExclusions?.domains?.length > 0 ? `
                                    <div class="exclusion-group">
                                        <h5><i class="fas fa-globe"></i> Domaines</h5>
                                        <div class="exclusions-grid">
                                            ${settings.categoryExclusions.domains.map(domain => `
                                                <div class="exclusion-item">
                                                    <span>${domain}</span>
                                                    <button class="btn-remove" onclick="window.categoriesPage.removeExclusionFromModal('domain', '${domain}')">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${settings.categoryExclusions?.emails?.length > 0 ? `
                                    <div class="exclusion-group">
                                        <h5><i class="fas fa-envelope"></i> Emails</h5>
                                        <div class="exclusions-grid">
                                            ${settings.categoryExclusions.emails.map(email => `
                                                <div class="exclusion-item">
                                                    <span>${email}</span>
                                                    <button class="btn-remove" onclick="window.categoriesPage.removeExclusionFromModal('email', '${email}')">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${(!settings.categoryExclusions?.domains?.length && !settings.categoryExclusions?.emails?.length) ? `
                                    <div class="no-exclusions">
                                        <i class="fas fa-info-circle"></i>
                                        <span>Aucune exclusion configurée</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.categoriesPage.closeModal()">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = modalId;
        
        // Focus sur l'input
        setTimeout(() => {
            const input = document.getElementById('new-exclusion-input');
            if (input) {
                input.focus();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addExclusionFromModal();
                    }
                });
            }
        }, 100);
    }

    addExclusionFromModal() {
        const input = document.getElementById('new-exclusion-input');
        if (!input || !input.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const settings = this.loadSettings();
        
        if (!settings.categoryExclusions) {
            settings.categoryExclusions = { domains: [], emails: [] };
        }
        
        let added = false;
        
        if (value.includes('@')) {
            if (!settings.categoryExclusions.emails.includes(value)) {
                settings.categoryExclusions.emails.push(value);
                added = true;
            }
        } else {
            if (!settings.categoryExclusions.domains.includes(value)) {
                settings.categoryExclusions.domains.push(value);
                added = true;
            }
        }
        
        if (added) {
            this.saveSettings(settings);
            input.value = '';
            this.closeModal();
            this.showToast('Exclusion ajoutée', 'success');
            
            // Rouvrir la modal avec les nouvelles données
            setTimeout(() => {
                this.openExclusionsModal();
            }, 100);
        } else {
            this.showToast('Cette exclusion existe déjà', 'warning');
        }
    }

    removeExclusionFromModal(type, value) {
        const settings = this.loadSettings();
        
        if (type === 'domain') {
            settings.categoryExclusions.domains = settings.categoryExclusions.domains.filter(d => d !== value);
        } else {
            settings.categoryExclusions.emails = settings.categoryExclusions.emails.filter(e => e !== value);
        }
        
        this.saveSettings(settings);
        this.closeModal();
        this.showToast('Exclusion supprimée', 'success');
        
        // Rouvrir la modal avec les nouvelles données
        setTimeout(() => {
            this.openExclusionsModal();
        }, 100);
    }

    exportSettings() {
        try {
            const settings = this.loadSettings();
            const data = JSON.stringify(settings, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `email-manager-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showToast('Paramètres exportés', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur export:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const settings = JSON.parse(text);
                
                if (confirm('Voulez-vous remplacer tous vos paramètres actuels ?')) {
                    this.saveSettings(settings);
                    this.refreshCurrentTab();
                    this.showToast('Paramètres importés avec succès', 'success');
                }
            } catch (error) {
                console.error('[CategoriesPage] Erreur import:', error);
                this.showToast('Erreur lors de l\'import', 'error');
            }
        };
        
        input.click();
    }

    // ================================================
    // GESTION DES MODALES
    // ================================================
    closeModal() {
        if (this.currentModal) {
            const modal = document.getElementById(this.currentModal);
            if (modal) {
                modal.remove();
            }
            this.currentModal = null;
            this.editingCategoryId = null;
        }
        
        // Fermer toutes les modales
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.remove();
        });
        
        document.body.style.overflow = 'auto';
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    debugSettings() {
        const settings = this.loadSettings();
        const moduleStatus = this.checkModuleAvailability();
        const syncStatus = this.checkSyncStatus(settings);
        
        console.log('\n=== DEBUG SETTINGS COMPLET ===');
        console.log('Settings complets:', settings);
        console.log('Status des modules:', moduleStatus);
        console.log('Status synchronisation:', syncStatus);
        console.log('CategoryManager settings:', window.categoryManager?.getSettings());
        console.log('EmailScanner settings:', window.emailScanner?.settings);
        console.log('EmailScanner taskPreselectedCategories:', window.emailScanner?.getTaskPreselectedCategories());
        console.log('Task preselected categories (CategoriesPage):', settings.taskPreselectedCategories);
        console.log('Checkboxes actuelles:');
        
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        checkboxes.forEach((cb, i) => {
            console.log(`  ${i}: value=${cb.value}, checked=${cb.checked}, name=${cb.dataset.categoryName}`);
        });
        
        console.log('État de synchronisation détaillé:');
        console.log('  - isSync:', syncStatus.isSync);
        console.log('  - emailScannerSync:', syncStatus.emailScannerSync);
        console.log('  - categoryManagerSync:', syncStatus.categoryManagerSync);
        console.log('  - expectedCategories:', syncStatus.expectedCategories);
        console.log('  - emailScannerCategories:', syncStatus.emailScannerCategories);
        console.log('  - categoryManagerCategories:', syncStatus.categoryManagerCategories);
        
        console.log('========================\n');
        
        this.showToast('Voir la console pour les détails de debug', 'info');
        return { settings, moduleStatus, syncStatus };
    }
    
    testCategorySelection() {
        console.log('\n=== TEST CATEGORY SELECTION COMPLET ===');
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        console.log(`Trouvé ${checkboxes.length} checkboxes avec classe .category-preselect-checkbox`);
        
        checkboxes.forEach((checkbox, index) => {
            console.log(`Checkbox ${index}:`);
            console.log(`  - Value: ${checkbox.value}`);
            console.log(`  - Checked: ${checkbox.checked}`);
            console.log(`  - Data name: ${checkbox.dataset.categoryName}`);
            console.log(`  - Has change handler: ${!!checkbox._changeHandler}`);
            console.log(`  - Has click handler: ${!!checkbox._clickHandler}`);
        });
        
        const categories = window.categoryManager?.getCategories() || {};
        console.log('Catégories disponibles:', Object.keys(categories));
        
        const settings = this.loadSettings();
        console.log('Catégories pré-sélectionnées dans les settings:', settings.taskPreselectedCategories);
        
        const syncStatus = this.checkSyncStatus(settings);
        console.log('État de synchronisation:', syncStatus);
        console.log('================================\n');
        
        this.showToast('Test terminé - voir console', 'info');
        return { checkboxes: checkboxes.length, categories: Object.keys(categories), syncStatus };
    }
    
    forceUpdateUI() {
        console.log('[CategoriesPage] 🔄 Force update UI avec synchronisation...');
        
        this.forceSynchronization();
        
        this.eventListenersSetup = false;
        setTimeout(() => {
            this.refreshCurrentTab();
        }, 200);
    }

    hideExplanationMessage() {
        // Méthode pour masquer les messages d'explication
        this.showToast('Message masqué', 'info');
    }

    // ================================================
    // MÉTHODES PUBLIQUES POUR INTÉGRATION
    // ================================================
    getScanSettings() {
        return this.loadSettings().scanSettings || this.getDefaultSettings().scanSettings;
    }
    
    getAutomationSettings() {
        return this.loadSettings().automationSettings || this.getDefaultSettings().automationSettings;
    }
    
    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        const categories = settings.taskPreselectedCategories || [];
        console.log('[CategoriesPage] 📊 getTaskPreselectedCategories appelé:', categories);
        return categories;
    }
    
    shouldExcludeSpam() {
        return this.loadSettings().preferences?.excludeSpam !== false;
    }
    
    shouldDetectCC() {
        return this.loadSettings().preferences?.detectCC !== false;
    }

    // ================================================
    // UTILITAIRES POUR LES COULEURS
    // ================================================
    renderColorPresets() {
        const presets = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308',
            '#84cc16', '#22c55e', '#10b981', '#06b6d4',
            '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
            '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
        ];
        
        return presets.map(color => `
            <button class="color-preset" 
                    style="background: ${color}" 
                    onclick="document.getElementById('category-color').value='${color}'; document.getElementById('edit-category-color').value='${color}'"></button>
        `).join('');
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Styles de base */
            .settings-page-compact {
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .page-header-compact {
                margin-bottom: 25px;
            }
            
            .page-header-compact h1 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 10px;
            }
            
            /* Boutons compacts */
            .btn-compact {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                border: 1px solid transparent;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            
            .btn-compact.btn-primary {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
            }
            
            .btn-compact.btn-primary:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
            }
            
            .btn-compact.btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
            }
            
            .btn-compact.btn-secondary:hover {
                background: #e5e7eb;
                border-color: #d1d5db;
            }
            
            .btn-compact.btn-danger {
                background: #fee2e2;
                color: #dc2626;
                border: 1px solid #fca5a5;
            }
            
            .btn-compact.btn-danger:hover {
                background: #fca5a5;
                color: #991b1b;
            }
            
            .btn-compact.btn-sm {
                padding: 4px 8px;
                font-size: 11px;
            }
            
            /* Onglets */
            .settings-tabs-compact {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 0;
            }
            
            .tab-button-compact {
                padding: 12px 20px;
                background: transparent;
                border: none;
                color: #6b7280;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                position: relative;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tab-button-compact:hover {
                color: #374151;
            }
            
            .tab-button-compact.active {
                color: #3b82f6;
            }
            
            .tab-button-compact.active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 2px;
                background: #3b82f6;
            }
            
            /* Contenu des onglets */
            .tab-content-compact {
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Grilles et cartes */
            .settings-grid-compact {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
            }
            
            .settings-card-compact {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .settings-card-compact.full-width {
                grid-column: 1 / -1;
            }
            
            .card-header-compact {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 16px;
            }
            
            .card-header-compact i {
                font-size: 20px;
                color: #3b82f6;
            }
            
            .card-header-compact h3 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
                flex: 1;
            }
            
            /* Formulaires */
            .settings-form-compact {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .form-group-compact {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-group-compact label {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
            }
            
            .form-input-compact,
            .form-select-compact {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                transition: all 0.2s ease;
            }
            
            .form-input-compact:focus,
            .form-select-compact:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            /* Toggle switches */
            .toggle-setting-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                user-select: none;
            }
            
            .toggle-setting-compact input[type="checkbox"] {
                position: absolute;
                opacity: 0;
            }
            
            .toggle-slider-compact {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
                background: #e5e7eb;
                border-radius: 12px;
                transition: all 0.3s ease;
            }
            
            .toggle-slider-compact::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .toggle-setting-compact input:checked + .toggle-slider-compact {
                background: #3b82f6;
            }
            
            .toggle-setting-compact input:checked + .toggle-slider-compact::after {
                transform: translateX(20px);
            }
            
            .toggle-label-compact {
                font-size: 14px;
                color: #374151;
                font-weight: 500;
            }
            
            /* Toggle switches mini pour catégories */
            .toggle-switch-mini {
                position: relative;
                display: inline-block;
                width: 36px;
                height: 20px;
                margin-left: auto;
            }
            
            .toggle-switch-mini input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider-mini {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: 0.4s;
                border-radius: 20px;
            }
            
            .toggle-slider-mini:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 2px;
                bottom: 2px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }
            
            .toggle-switch-mini input:checked + .toggle-slider-mini {
                background-color: #3b82f6;
            }
            
            .toggle-switch-mini input:checked + .toggle-slider-mini:before {
                transform: translateX(16px);
            }
            
            /* Indicateurs de statut */
            .status-badge {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
                margin-left: 8px;
            }

            .status-badge.status-ok {
                background: #dcfce7;
                color: #166534;
            }

            .status-badge.status-warning {
                background: #fef3c7;
                color: #92400e;
            }

            .status-badge.status-error {
                background: #fee2e2;
                color: #991b1b;
            }
            
            /* Indicateurs de synchronisation */
            .automation-sync-indicator {
                margin: 16px 0;
                padding: 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .sync-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
            }
            
            .sync-indicator.sync-ok {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #10b981;
            }
            
            .sync-indicator.sync-warning {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #f59e0b;
            }
            
            .btn-fix-sync-small {
                background: rgba(0, 0, 0, 0.1);
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: auto;
                transition: all 0.2s ease;
            }
            
            .btn-fix-sync-small:hover {
                background: rgba(0, 0, 0, 0.2);
                transform: translateY(-1px);
            }
            
            /* Stat de synchronisation */
            .stat-item.sync-stat {
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            
            .stat-item.sync-stat:hover {
                border-color: #3b82f6;
            }
            
            /* Animation pour les indicateurs sélectionnés */
            .selected-indicator {
                background: #667eea !important;
                color: white !important;
                border-color: #e9d5ff !important;
                animation: pulseSelection 2s infinite;
                font-size: 10px !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                margin-left: 8px !important;
                font-weight: 600 !important;
            }
            
            @keyframes pulseSelection {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
            }
            
            /* Amélioration des checkboxes */
            .category-checkbox-item-enhanced {
                position: relative;
                transition: all 0.3s ease;
                cursor: pointer;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                background: white;
            }
            
            .category-checkbox-item-enhanced:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-color: #3b82f6;
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"] {
                position: absolute;
                opacity: 0;
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"]:checked + .category-checkbox-content-enhanced {
                background: #eff6ff;
                border-color: #3b82f6;
            }
            
            .category-checkbox-content-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s ease;
            }
            
            .cat-icon-automation {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .cat-name-automation {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                flex: 1;
            }
            
            .custom-badge {
                background: #f3e8ff;
                color: #7c3aed;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            .inactive-badge {
                background: #f3f4f6;
                color: #6b7280;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            /* Grille de sélection des catégories */
            .categories-selection-grid-automation {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
                margin-top: 16px;
            }
            
            /* Options d'automatisation */
            .automation-options-enhanced {
                margin-top: 32px;
            }
            
            .automation-options-enhanced h4 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .automation-options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 16px;
            }
            
            .checkbox-enhanced {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .checkbox-enhanced:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
            }
            
            .checkbox-enhanced input[type="checkbox"] {
                margin-top: 2px;
                cursor: pointer;
            }
            
            .checkbox-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .checkbox-title {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .checkbox-description {
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            /* Statistiques */
            .automation-stats {
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
            }
            
            .automation-stats h4 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 16px;
            }
            
            .stat-item {
                text-align: center;
                padding: 16px;
                background: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .stat-number {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #3b82f6;
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            /* Onglet Catégories */
            .keywords-tab-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .keywords-actions-bar {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .categories-grid-enhanced {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .category-card-enhanced {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .category-card-enhanced:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            }
            
            .category-card-enhanced.inactive {
                opacity: 0.6;
                background: #f9fafb;
            }
            
            .category-card-enhanced.inactive:hover {
                opacity: 0.8;
            }
            
            .category-card-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 16px;
            }
            
            .category-icon-large {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .category-info {
                flex: 1;
            }
            
            .category-title-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 4px;
            }
            
            .category-info h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }
            
            .category-toggle {
                margin-left: auto;
            }
            
            .category-description {
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 16px;
                line-height: 1.5;
            }
            
            .keywords-summary {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            
            .keyword-count {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #374151;
                font-weight: 500;
            }
            
            .keyword-badge {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            .keyword-badge.absolute {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .keyword-badge.strong {
                background: #fef3c7;
                color: #d97706;
            }
            
            .keyword-badge.weak {
                background: #e0e7ff;
                color: #4338ca;
            }
            
            .keyword-badge.exclusions {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .category-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            /* Exclusions */
            .quick-exclusion-section {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .quick-exclusion-section input {
                flex: 1;
            }
            
            .exclusions-list {
                margin-top: 16px;
            }
            
            .exclusions-list h4 {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .exclusion-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                margin: 4px;
            }
            
            .exclusion-badge button {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                padding: 0;
                font-size: 10px;
            }
            
            .exclusion-badge button:hover {
                color: #991b1b;
            }
            
            /* Import/Export */
            .import-export-section {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            /* MODALES */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
                padding: 20px;
            }
            
            .modal-container {
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }
            
            .modal-container.large {
                max-width: 900px;
            }
            
            .modal-header {
                padding: 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
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
            
            .category-header {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .category-header .category-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .category-header h2 {
                margin: 0 0 4px 0;
            }
            
            .category-header p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }
            
            /* Formulaires dans les modales */
            .form-section {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-group label {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }
            
            .form-input,
            .form-textarea,
            .form-select {
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                transition: all 0.2s ease;
            }
            
            .form-input:focus,
            .form-textarea:focus,
            .form-select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
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
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 4px;
            }
            
            .color-preset {
                width: 24px;
                height: 24px;
                border: 2px solid white;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .color-preset:hover {
                transform: scale(1.1);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            }
            
            /* Gestion des mots-clés */
            .keywords-explanation {
                margin-bottom: 24px;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            
            .keyword-type-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .info-label {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
            }
            
            .info-desc {
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            .keywords-sections {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 24px;
                margin-bottom: 24px;
            }
            
            .keyword-section {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                background: white;
            }
            
            .keyword-section.absolute {
                border-color: #fca5a5;
                background: #fef2f2;
            }
            
            .keyword-section.strong {
                border-color: #fde68a;
                background: #fffbeb;
            }
            
            .keyword-section.weak {
                border-color: #c7d2fe;
                background: #f0f9ff;
            }
            
            .keyword-section.exclusions {
                border-color: #d1d5db;
                background: #f9fafb;
            }
            
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .section-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .keyword-count {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .add-keyword-form {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
            }
            
            .keyword-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 13px;
            }
            
            .keyword-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }
            
            .add-keyword-btn {
                padding: 8px 12px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }
            
            .add-keyword-btn:hover {
                background: #2563eb;
            }
            
            .keywords-list {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                min-height: 40px;
            }
            
            .keyword-tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s ease;
            }
            
            .keyword-tag.absolute {
                background: #fee2e2;
                color: #dc2626;
                border: 1px solid #fca5a5;
            }
            
            .keyword-tag.strong {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .keyword-tag.weak {
                background: #e0e7ff;
                color: #4338ca;
                border: 1px solid #c7d2fe;
            }
            
            .keyword-tag.exclusions {
                background: #f3f4f6;
                color: #6b7280;
                border: 1px solid #d1d5db;
            }
            
            .keyword-text {
                flex: 1;
            }
            
            .remove-keyword {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                font-size: 10px;
                padding: 2px;
                border-radius: 50%;
                transition: all 0.2s ease;
                opacity: 0.7;
            }
            
            .remove-keyword:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.1);
            }
            
            /* Test des mots-clés */
            .keywords-test-section {
                margin-top: 24px;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            
            .keywords-test-section h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .test-input-group {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .test-input-group input {
                flex: 1;
            }
            
            .test-results {
                min-height: 40px;
            }
            
            .test-result {
                padding: 16px;
                border-radius: 8px;
                border: 1px solid;
            }
            
            .test-result.match {
                background: #f0fdf4;
                border-color: #bbf7d0;
                color: #166534;
            }
            
            .test-result.no-match {
                background: #fef2f2;
                border-color: #fca5a5;
                color: #991b1b;
            }
            
            .result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-weight: 600;
            }
            
            .result-category {
                margin-bottom: 12px;
                font-size: 14px;
            }
            
            .category-badge {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                margin-left: 8px;
            }
            
            .result-matches h5 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
            }
            
            .matches-list {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            
            .match-tag {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
            }
            
            .match-score {
                font-weight: 700;
            }
            
            .no-matches {
                font-style: italic;
                color: #6b7280;
            }
            
            /* Modal d'aperçu de tous les mots-clés */
            .all-keywords-content {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .category-keywords-summary {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                background: white;
            }
            
            .category-summary-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .category-summary-header .category-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }
            
            .category-summary-header h4 {
                margin: 0;
                flex: 1;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .keywords-count {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 6px;
            }
            
            .keywords-type-list {
                margin-bottom: 16px;
            }
            
            .keywords-type-list:last-child {
                margin-bottom: 0;
            }
            
            .keywords-type-list h5 {
                margin: 0 0 8px 0;
                font-size: 13px;
                font-weight: 600;
                color: #374151;
            }
            
            .keywords-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }
            
            /* Modal d'exclusions */
            .exclusions-management {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .exclusion-form {
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            
            .exclusion-form h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .exclusion-form .form-group {
                display: flex;
                gap: 12px;
                align-items: flex-end;
            }
            
            .exclusion-form input {
                flex: 1;
            }
            
            .current-exclusions {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .current-exclusions h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .exclusion-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .exclusion-group h5 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .exclusions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 8px;
            }
            
            .exclusion-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 13px;
            }
            
            .exclusion-item span {
                flex: 1;
                font-weight: 500;
            }
            
            .btn-remove {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .btn-remove:hover {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .no-exclusions {
                text-align: center;
                padding: 24px;
                color: #6b7280;
                font-style: italic;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .settings-grid-compact {
                    grid-template-columns: 1fr;
                }
                
                .categories-selection-grid-automation {
                    grid-template-columns: 1fr;
                }
                
                .automation-options-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .categories-grid-enhanced {
                    grid-template-columns: 1fr;
                }
                
                .keywords-sections {
                    grid-template-columns: 1fr;
                }
                
                .keyword-type-info {
                    grid-template-columns: 1fr;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .color-presets {
                    grid-template-columns: repeat(4, 1fr);
                }
                
                .modal-container {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }
                
                .modal-header,
                .modal-content,
                .modal-footer {
                    padding: 16px;
                }

            }// Ajouter dans la fonction addStyles() après les styles existants

/* Catégories condensées */
.categories-grid-condensed {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.category-card-condensed {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    position: relative;
}

.category-card-condensed:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.category-card-condensed.inactive {
    opacity: 0.6;
    background: #f9fafb;
}

.category-card-header-condensed {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.category-icon-condensed {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}

.category-info-condensed {
    flex: 1;
    min-width: 0;
}

.category-info-condensed h3 {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.category-badges {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.category-stats-condensed {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.stat-item-condensed {
    display: flex;
    align-items: baseline;
    gap: 4px;
    padding: 4px 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
}

.stat-item-condensed.highlight-absolute {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #dc2626;
    font-weight: 600;
}

.stat-item-condensed.highlight-filters {
    background: #e0e7ff;
    border-color: #c7d2fe;
    color: #4338ca;
    font-weight: 600;
}

.stat-number {
    font-weight: 700;
    font-size: 14px;
}

.stat-label {
    color: #6b7280;
    font-size: 11px;
}

.category-actions-condensed {
    display: flex;
    gap: 6px;
}

.btn-action-condensed {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #6b7280;
    transition: all 0.2s ease;
}

.btn-action-condensed:hover {
    background: #f8fafc;
    border-color: #3b82f6;
    color: #3b82f6;
    transform: translateY(-1px);
}

.btn-action-condensed.danger:hover {
    border-color: #dc2626;
    color: #dc2626;
    background: #fef2f2;
}

/* Modal des filtres */
.modal-container.medium {
    max-width: 700px;
}

.filters-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.filter-section {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    background: white;
}

.filter-section.include-section {
    border-color: #bbf7d0;
    background: #f0fdf4;
}

.filter-section.exclude-section {
    border-color: #fca5a5;
    background: #fef2f2;
}

.filter-section h4 {
    margin: 0 0 8px 0;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 6px;
}

.filter-section.include-section h4 {
    color: #16a34a;
}

.filter-section.exclude-section h4 {
    color: #dc2626;
}

.filter-description {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 12px;
    line-height: 1.4;
}

.filter-input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.filter-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
}

.filter-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-add-filter {
    padding: 8px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
}

.btn-add-filter:hover {
    background: #2563eb;
}

.filter-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 32px;
}

.filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}

.filter-tag.include {
    background: #dcfce7;
    color: #16a34a;
    border: 1px solid #bbf7d0;
}

.filter-tag.exclude {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.filter-tag button {
    background: none;
    border: none;
    color: currentColor;
    cursor: pointer;
    font-size: 10px;
    padding: 0 2px;
    opacity: 0.7;
}

.filter-tag button:hover {
    opacity: 1;
}

/* Responsive pour la vue condensée */
@media (max-width: 768px) {
    .categories-grid-condensed {
        grid-template-columns: 1fr;
    }
    
    .filters-sections {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .category-stats-condensed {
        font-size: 11px;
    }
    
    .stat-item-condensed {
        padding: 2px 6px;
    }
    
    .btn-action-condensed {
        width: 28px;
        height: 28px;
        font-size: 11px;
    }
}

// Ajouter dans la fonction addStyles() après les styles existants

/* Catégories condensées */
.categories-grid-condensed {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.category-card-condensed {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    position: relative;
}

.category-card-condensed:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.category-card-condensed.inactive {
    opacity: 0.6;
    background: #f9fafb;
}

.category-card-header-condensed {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.category-icon-condensed {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}

.category-info-condensed {
    flex: 1;
    min-width: 0;
}

.category-info-condensed h3 {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.category-badges {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.category-stats-condensed {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.stat-item-condensed {
    display: flex;
    align-items: baseline;
    gap: 4px;
    padding: 4px 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
}

.stat-item-condensed.highlight-absolute {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #dc2626;
    font-weight: 600;
}

.stat-item-condensed.highlight-filters {
    background: #e0e7ff;
    border-color: #c7d2fe;
    color: #4338ca;
    font-weight: 600;
}

.stat-number {
    font-weight: 700;
    font-size: 14px;
}

.stat-label {
    color: #6b7280;
    font-size: 11px;
}

.category-actions-condensed {
    display: flex;
    gap: 6px;
}

.btn-action-condensed {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #6b7280;
    transition: all 0.2s ease;
}

.btn-action-condensed:hover {
    background: #f8fafc;
    border-color: #3b82f6;
    color: #3b82f6;
    transform: translateY(-1px);
}

.btn-action-condensed.danger:hover {
    border-color: #dc2626;
    color: #dc2626;
    background: #fef2f2;
}

/* Modal des filtres */
.modal-container.medium {
    max-width: 700px;
}

.filters-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.filter-section {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    background: white;
}

.filter-section.include-section {
    border-color: #bbf7d0;
    background: #f0fdf4;
}

.filter-section.exclude-section {
    border-color: #fca5a5;
    background: #fef2f2;
}

.filter-section h4 {
    margin: 0 0 8px 0;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 6px;
}

.filter-section.include-section h4 {
    color: #16a34a;
}

.filter-section.exclude-section h4 {
    color: #dc2626;
}

.filter-description {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 12px;
    line-height: 1.4;
}

.filter-input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.filter-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
}

.filter-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-add-filter {
    padding: 8px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
}

.btn-add-filter:hover {
    background: #2563eb;
}

.filter-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 32px;
}

.filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}

.filter-tag.include {
    background: #dcfce7;
    color: #16a34a;
    border: 1px solid #bbf7d0;
}

.filter-tag.exclude {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.filter-tag button {
    background: none;
    border: none;
    color: currentColor;
    cursor: pointer;
    font-size: 10px;
    padding: 0 2px;
    opacity: 0.7;
}

.filter-tag button:hover {
    opacity: 1;
}

/* Responsive pour la vue condensée */
@media (max-width: 768px) {
    .categories-grid-condensed {
        grid-template-columns: 1fr;
    }
    
    .filters-sections {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .category-stats-condensed {
        font-size: 11px;
    }
    
    .stat-item-condensed {
        padding: 2px 6px;
    }
    
    .btn-action-condensed {
        width: 28px;
        height: 28px;
        font-size: 11px;
    }
}
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[CategoriesPage] Erreur dispatch ${eventName}:`, error);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        if (window.uiManager && typeof window.uiManager.showToast === 'function') {
            window.uiManager.showToast(message, type, duration);
        } else {
            console.log(`[Toast ${type.toUpperCase()}] ${message}`);
        }
    }

    checkModuleAvailability() {
        return {
            categoryManager: !!window.categoryManager,
            emailScanner: !!window.emailScanner,
            aiTaskAnalyzer: !!window.aiTaskAnalyzer,
            mailService: !!window.mailService,
            uiManager: !!window.uiManager
        };
    }

    renderModuleStatusBar(status) {
        const totalModules = Object.keys(status).length;
        const availableModules = Object.values(status).filter(Boolean).length;
        const statusColor = availableModules === totalModules ? '#10b981' : 
                           availableModules > totalModules / 2 ? '#f59e0b' : '#ef4444';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas fa-plug"></i> 
                Modules disponibles: ${availableModules}/${totalModules}
                ${availableModules < totalModules ? ' - Certaines fonctionnalités peuvent être limitées' : ' - Tous les modules chargés'}
            </div>
        `;
    }

    renderErrorState(error) {
        return `
            <div class="error-display" style="padding: 20px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                <h2>Erreur de chargement des paramètres</h2>
                <p>Une erreur est survenue: ${error.message}</p>
                <button onclick="window.categoriesPage.forceUpdateUI()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Réessayer
                </button>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recharger la page
                </button>
            </div>
        `;
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        checkboxes.forEach(checkbox => {
            if (checkbox._changeHandler) {
                checkbox.removeEventListener('change', checkbox._changeHandler);
            }
            if (checkbox._clickHandler) {
                checkbox.removeEventListener('click', checkbox._clickHandler);
            }
        });
        
        this.eventListenersSetup = false;
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        this.closeModal();
        
        console.log('[CategoriesPage] Nettoyage effectué');
    }

    destroy() {
        this.cleanup();
        console.log('[CategoriesPage] Instance détruite');
    }
}

// Créer l'instance globale avec nettoyage préalable
try {
    if (window.categoriesPage) {
        window.categoriesPage.destroy?.();
    }

    window.categoriesPage = new CategoriesPage();

    // Export pour PageManager
    if (window.pageManager && window.pageManager.pages) {
        delete window.pageManager.pages.categories;
        delete window.pageManager.pages.keywords;
        
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur rendu paramètres:', error);
                container.innerHTML = window.categoriesPage.renderErrorState(error);
            }
        };
        
        console.log('✅ CategoriesPage v9.0 intégrée au PageManager');
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique initialisation:', error);
}

console.log('✅ CategoriesPage v9.0 loaded - Gestion complète des catégories et mots-clés');
