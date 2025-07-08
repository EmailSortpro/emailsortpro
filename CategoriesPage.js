// CategoriesPage.js - Version 24.0 - Export/Import fonctionnel + Gestion individuelle des mots-clés
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v24.0 - Full functional export/import...');

// Nettoyer toute instance précédente
if (window.categoriesPage) {
    console.log('[CategoriesPage] 🧹 Nettoyage instance précédente...');
    delete window.categoriesPage;
}

class CategoriesPageAdvanced {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.viewMode = 'grid';
        this.activeTab = 'categories'; // 'categories' ou 'backup'
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8'
        ];
        
        // Données de backup pour fonctionner sans dépendances
        this.backupCategories = {
            newsletters: { name: 'Newsletters & Marketing', icon: '📰', color: '#8b5cf6', priority: 100 },
            security: { name: 'Sécurité', icon: '🔒', color: '#dc2626', priority: 90 },
            tasks: { name: 'Actions Requises', icon: '✅', color: '#ef4444', priority: 85 },
            finance: { name: 'Finance', icon: '💰', color: '#059669', priority: 80 },
            meetings: { name: 'Réunions', icon: '📅', color: '#f59e0b', priority: 75 }
        };
        
        this.backupEmails = this.generateBackupEmails();
        
        // État temporaire pour la modal
        this.tempKeywords = null;
        this.tempFilters = null;
        
        console.log('[CategoriesPage] 🎨 Interface avancée v24.0 initialisée');
    }

    // ================================================
    // INTEGRATION AVEC CATEGORYMANAGER
    // ================================================
    // ================================================
    // CHARGEMENT DES CATÉGORIES AVEC SUPPORT CUSTOM
    // ================================================
    getCategories() {
        let categories = {};
        
        // D'abord charger les catégories depuis CategoryManager
        if (window.categoryManager && typeof window.categoryManager.getCategories === 'function') {
            categories = window.categoryManager.getCategories();
            console.log('[CategoriesPage] 📦 Catégories récupérées depuis CategoryManager:', Object.keys(categories));
        } else {
            console.log('[CategoriesPage] ⚠️ CategoryManager non disponible, utilisation backup');
            categories = { ...this.backupCategories };
        }
        
        // Ajouter les catégories custom locales
        const customCategories = this.loadCustomCategories();
        Object.entries(customCategories).forEach(([id, category]) => {
            // S'assurer que la catégorie custom a bien le flag isCustom
            categories[id] = {
                ...category,
                isCustom: true
            };
        });
        
        return categories;
    }
    
    getCategoryKeywords(categoryId) {
        // D'abord vérifier dans le localStorage pour TOUTES les catégories
        const savedKeywords = this.loadCategoryKeywords(categoryId);
        if (savedKeywords) {
            return savedKeywords;
        }
        
        // Ensuite vérifier CategoryManager
        if (window.categoryManager && typeof window.categoryManager.weightedKeywords === 'object') {
            const keywords = window.categoryManager.weightedKeywords[categoryId];
            if (keywords) {
                console.log(`[CategoriesPage] 🔑 Mots-clés récupérés pour ${categoryId}:`, keywords);
                // Sauvegarder dans localStorage pour permettre les modifications
                this.saveCategoryKeywords(categoryId, keywords);
                return keywords;
            }
        }
        
        console.log(`[CategoriesPage] ⚠️ Mots-clés non trouvés pour ${categoryId}`);
        return { absolute: [], strong: [], weak: [], exclusions: [] };
    }
    
    getCategoryFilters(categoryId) {
        // D'abord vérifier dans le localStorage
        const savedFilters = this.loadCategoryFilters(categoryId);
        if (savedFilters) {
            return savedFilters;
        }
        
        // Ensuite vérifier CategoryManager
        if (window.categoryManager && typeof window.categoryManager.getCategoryFilters === 'function') {
            const filters = window.categoryManager.getCategoryFilters(categoryId);
            if (filters) {
                console.log(`[CategoriesPage] 🔧 Filtres récupérés pour ${categoryId}:`, filters);
                return filters;
            }
        }
        
        console.log(`[CategoriesPage] ⚠️ Filtres non trouvés pour ${categoryId}, utilisation par défaut`);
        return {
            includeDomains: [], includeEmails: [], excludeDomains: [], excludeEmails: []
        };
    }

    getAllEmails() {
        if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
            const emails = window.emailScanner.getAllEmails();
            console.log('[CategoriesPage] 📧 Emails récupérés depuis EmailScanner:', emails.length);
            return emails;
        }
        console.log('[CategoriesPage] ⚠️ EmailScanner non disponible, utilisation backup');
        return this.backupEmails;
    }
    
    getAllTasks() {
        if (window.taskManager && typeof window.taskManager.getAllTasks === 'function') {
            const tasks = window.taskManager.getAllTasks();
            console.log('[CategoriesPage] 📋 Tâches récupérées depuis TaskManager:', tasks.length);
            return tasks;
        }
        console.log('[CategoriesPage] ⚠️ TaskManager non disponible');
        return [];
    }

    // ================================================
    // DONNÉES DE BACKUP
    // ================================================
    generateBackupEmails() {
        const categories = ['newsletters', 'security', 'tasks', 'finance', 'meetings', 'other'];
        const emails = [];
        
        for (let i = 0; i < 50; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            emails.push({
                id: `email_${i}`,
                subject: this.getRandomSubject(category),
                from: {
                    emailAddress: {
                        name: this.getRandomSender(category),
                        address: this.getRandomEmail(category)
                    }
                },
                receivedDateTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                category: category === 'other' ? null : category
            });
        }
        
        return emails;
    }
    
    getRandomSubject(category) {
        const subjects = {
            newsletters: ['Newsletter hebdo', 'Offre spéciale -50%', 'Nouvelles collections', 'Se désinscrire'],
            security: ['Code de vérification', 'Connexion détectée', 'Alerte sécurité'],
            tasks: ['Action requise', 'Tâche assignée', 'Urgent: deadline'],
            finance: ['Facture #12345', 'Commande confirmée', 'Paiement reçu'],
            meetings: ['Réunion équipe', 'Invitation Teams', 'RDV client'],
            other: ['Sans objet', 'Divers', 'Information']
        };
        const categorySubjects = subjects[category] || subjects.other;
        return categorySubjects[Math.floor(Math.random() * categorySubjects.length)];
    }
    
    getRandomSender(category) {
        const senders = {
            newsletters: ['Marketing Team', 'Newsletter', 'Promo Store'],
            security: ['Security Alert', 'Microsoft', 'Sécurité'],
            tasks: ['Project Manager', 'Task System', 'Workflow'],
            finance: ['Comptabilité', 'Billing', 'Facturation'],
            meetings: ['Calendar', 'Teams', 'Agenda'],
            other: ['System', 'Auto', 'Service']
        };
        const categorySenders = senders[category] || senders.other;
        return categorySenders[Math.floor(Math.random() * categorySenders.length)];
    }
    
    getRandomEmail(category) {
        const domains = {
            newsletters: ['newsletter.com', 'marketing.fr', 'promo.com'],
            security: ['security.microsoft.com', 'alerts.com'],
            tasks: ['tasks.company.com', 'workflow.fr'],
            finance: ['billing.com', 'factures.fr'],
            meetings: ['calendar.com', 'teams.microsoft.com'],
            other: ['system.com', 'noreply.fr']
        };
        const categoryDomains = domains[category] || domains.other;
        const domain = categoryDomains[Math.floor(Math.random() * categoryDomains.length)];
        return `contact@${domain}`;
    }

    // ================================================
    // RENDU PRINCIPAL AVEC ONGLETS
    // ================================================
    render(container) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant');
            return;
        }

        try {
            const categories = this.getCategories();
            const settings = this.loadSettings();
            
            console.log('[CategoriesPage] 📊 Rendu avec:', {
                categoriesCount: Object.keys(categories).length,
                hasEmailScanner: !!window.emailScanner,
                hasCategoryManager: !!window.categoryManager,
                hasTaskManager: !!window.taskManager,
                activeTab: this.activeTab
            });
            
            container.innerHTML = `
                <div class="categories-modern">
                    <!-- Header avec navigation par onglets -->
                    <div class="header-modern">
                        <div class="header-content">
                            <h1>Paramètres <span class="emoji">⚙️</span></h1>
                            <p class="subtitle">Gestion des catégories et backup</p>
                        </div>
                        <div class="main-tabs">
                            <button class="main-tab ${this.activeTab === 'categories' ? 'active' : ''}" 
                                    onclick="window.categoriesPage.switchMainTab('categories')">
                                <i class="fas fa-tags"></i>
                                Catégories
                            </button>
                            <button class="main-tab ${this.activeTab === 'backup' ? 'active' : ''}" 
                                    onclick="window.categoriesPage.switchMainTab('backup')">
                                <i class="fas fa-database"></i>
                                Backup & Import
                            </button>
                        </div>
                    </div>
                    
                    <!-- Contenu selon l'onglet actif -->
                    <div class="tab-content">
                        ${this.activeTab === 'categories' ? this.renderCategoriesTab(categories, settings) : this.renderBackupTab()}
                    </div>
                </div>
            `;
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = this.renderError();
        }
    }

    renderCategoriesTab(categories, settings) {
        return `
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
                ${this.renderCreateCategoryCard()}
                ${this.renderCategories(categories, settings.activeCategories)}
            </div>
        `;
    }

    renderBackupTab() {
        return `
            <div class="backup-container">
                <div class="backup-section">
                    <div class="backup-header">
                        <h2><i class="fas fa-download"></i> Export des données</h2>
                        <p>Sauvegardez vos catégories, paramètres, tâches et données d'emails</p>
                    </div>
                    
                    <div class="backup-grid">
                        <div class="backup-card">
                            <div class="backup-icon">📦</div>
                            <h3>Export complet</h3>
                            <p>Toutes les données: catégories, emails, tâches, paramètres</p>
                            <button class="btn-backup primary" onclick="window.categoriesPage.exportFullBackup()">
                                <i class="fas fa-download"></i>
                                Export complet
                            </button>
                        </div>
                        
                        <div class="backup-card">
                            <div class="backup-icon">🏷️</div>
                            <h3>Catégories uniquement</h3>
                            <p>Export des catégories, mots-clés et filtres</p>
                            <button class="btn-backup secondary" onclick="window.categoriesPage.exportCategories()">
                                <i class="fas fa-tags"></i>
                                Export catégories
                            </button>
                        </div>
                        
                        <div class="backup-card">
                            <div class="backup-icon">📋</div>
                            <h3>Tâches uniquement</h3>
                            <p>Export de toutes les tâches</p>
                            <button class="btn-backup secondary" onclick="window.categoriesPage.exportTasks()">
                                <i class="fas fa-tasks"></i>
                                Export tâches
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="backup-section">
                    <div class="backup-header">
                        <h2><i class="fas fa-upload"></i> Import des données</h2>
                        <p>Restaurez vos données depuis un fichier de sauvegarde</p>
                    </div>
                    
                    <div class="import-zone" id="import-zone">
                        <div class="import-area" onclick="document.getElementById('fileInput').click()"
                             ondrop="window.categoriesPage.handleDrop(event)" 
                             ondragover="window.categoriesPage.handleDragOver(event)">
                            <div class="import-icon">📁</div>
                            <h3>Glissez votre fichier ici</h3>
                            <p>ou cliquez pour sélectionner</p>
                            <p class="import-info">Formats supportés: .json, .backup</p>
                        </div>
                        <input type="file" id="fileInput" accept=".json,.backup" style="display: none" onchange="window.categoriesPage.handleFileImport(this)">
                    </div>
                    
                    <div class="import-options">
                        <label class="import-option">
                            <input type="checkbox" id="mergeData" checked>
                            <span>Fusionner avec les données existantes</span>
                        </label>
                        <label class="import-option">
                            <input type="checkbox" id="overwriteSettings">
                            <span>Remplacer les paramètres existants</span>
                        </label>
                        <label class="import-option">
                            <input type="checkbox" id="validateData" checked>
                            <span>Valider les données avant import</span>
                        </label>
                    </div>
                </div>
                
                <div class="backup-section">
                    <div class="backup-header">
                        <h2><i class="fas fa-history"></i> Historique des sauvegardes</h2>
                        <p>Gestion des sauvegardes automatiques</p>
                    </div>
                    
                    <div class="backup-history" id="backup-history">
                        ${this.renderBackupHistory()}
                    </div>
                    
                    <div class="backup-actions">
                        <button class="btn-backup secondary" onclick="window.categoriesPage.createAutoBackup()">
                            <i class="fas fa-clock"></i>
                            Sauvegarde automatique
                        </button>
                        <button class="btn-backup danger" onclick="window.categoriesPage.clearBackupHistory()">
                            <i class="fas fa-trash"></i>
                            Vider l'historique
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderBackupHistory() {
        const history = this.getBackupHistory();
        
        if (history.length === 0) {
            return `
                <div class="backup-empty">
                    <div class="backup-empty-icon">📄</div>
                    <p>Aucune sauvegarde trouvée</p>
                    <p class="backup-empty-sub">Créez votre première sauvegarde</p>
                </div>
            `;
        }
        
        return history.map(backup => `
            <div class="backup-item">
                <div class="backup-item-info">
                    <div class="backup-item-name">${backup.name}</div>
                    <div class="backup-item-meta">
                        <span class="backup-date">${new Date(backup.date).toLocaleString('fr-FR')}</span>
                        <span class="backup-size">${backup.size}</span>
                        <span class="backup-type">${backup.type}</span>
                    </div>
                </div>
                <div class="backup-item-actions">
                    <button class="btn-backup-small primary" onclick="window.categoriesPage.restoreBackup('${backup.id}')">
                        <i class="fas fa-undo"></i>
                        Restaurer
                    </button>
                    <button class="btn-backup-small secondary" onclick="window.categoriesPage.downloadBackup('${backup.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-backup-small danger" onclick="window.categoriesPage.deleteBackup('${backup.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ================================================
    // GESTION DES ONGLETS PRINCIPAUX
    // ================================================
    switchMainTab(tabName) {
        this.activeTab = tabName;
        console.log('[CategoriesPage] 🔄 Changement onglet:', tabName);
        
        // Re-render le contenu
        const container = document.querySelector('.categories-modern').parentElement;
        if (container) {
            this.render(container);
        }
    }

    renderCreateCategoryCard() {
        return `
            <div class="category-card create-card" 
                 style="--cat-color: #94a3b8"
                 onclick="window.categoriesPage.showCreateCategoryModal()">
                
                <div class="card-header">
                    <div class="cat-emoji">➕</div>
                    <div class="cat-info">
                        <div class="cat-name" style="color: #dc2626;">Nouvelle catégorie</div>
                        <div class="cat-meta">
                            <span class="meta-description">Créer une catégorie</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="btn-minimal" style="background: #f3f4f6; color: #6b7280; border-color: #e5e7eb;">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn-minimal task" style="opacity: 0.3; pointer-events: none;">
                        <i class="fas fa-square"></i>
                    </button>
                    <button class="btn-minimal config" style="opacity: 0.3; pointer-events: none;">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        `;
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
                    ${this.searchTerm ? `
                        <button class="btn-modern secondary" onclick="window.categoriesPage.handleSearch('')">
                            Effacer la recherche
                        </button>
                    ` : ''}
                </div>
            `;
        }
        
        const emailStats = this.calculateEmailStats();
        
        const categoryCards = Object.entries(filtered)
            .map(([id, category]) => this.renderCategoryCard(id, category, activeCategories, emailStats[id] || 0))
            .join('');
        
        // Ajouter la catégorie "Autre" si nécessaire
        const otherCount = emailStats.other || 0;
        let otherCard = '';
        
        if (otherCount > 0 && !filtered.other) {
            const isActive = activeCategories === null || activeCategories.includes('other');
            const settings = this.loadSettings();
            const isPreselected = settings.taskPreselectedCategories?.includes('other') || false;
            
            otherCard = `
                <div class="category-card ${!isActive ? 'inactive' : ''}" 
                     data-id="other"
                     style="--cat-color: #64748b"
                     onclick="window.categoriesPage.showOtherCategoryInfo()">
                    
                    <div class="card-header">
                        <div class="cat-emoji">📌</div>
                        <div class="cat-info">
                            <div class="cat-name">Autre</div>
                            <div class="cat-meta">
                                <span class="meta-count">${otherCount}</span>
                                <span class="meta-description">Non catégorisé</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="btn-minimal ${isActive ? 'on' : 'off'}" 
                                onclick="window.categoriesPage.toggleOtherCategory()"
                                title="Les emails 'Autre' sont toujours visibles">
                            ${isActive ? 'ON' : 'OFF'}
                        </button>
                        <button class="btn-minimal task ${isPreselected ? 'selected' : ''}" 
                                onclick="window.categoriesPage.togglePreselection('other')"
                                title="${isPreselected ? 'Tâches pré-cochées' : 'Tâches non cochées'}">
                            <i class="fas fa-${isPreselected ? 'check-square' : 'square'}"></i>
                        </button>
                        <button class="btn-minimal config" 
                                onclick="window.categoriesPage.showOtherCategoryInfo()"
                                title="Informations sur la catégorie Autre">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        return categoryCards + otherCard;
    }

    renderCategoryCard(id, category, activeCategories, emailCount = 0) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const stats = this.getCategoryStats(id);
        const settings = this.loadSettings();
        const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
        
        return `
            <div class="category-card ${!isActive ? 'inactive' : ''}" 
                 data-id="${id}"
                 style="--cat-color: ${category.color}"
                 onclick="window.categoriesPage.openModal('${id}')">
                
                <div class="card-header">
                    <div class="cat-emoji">${category.icon}</div>
                    <div class="cat-info">
                        <div class="cat-name">${category.name}</div>
                        <div class="cat-meta">
                            <span class="meta-count">${emailCount} emails</span>
                            ${stats.totalKeywords > 0 ? `<span class="meta-star">🔑 ${stats.totalKeywords}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="btn-minimal ${isActive ? 'on' : 'off'}" 
                            onclick="window.categoriesPage.toggleCategory('${id}')">
                        ${isActive ? 'ON' : 'OFF'}
                    </button>
                    <button class="btn-minimal task ${isPreselected ? 'selected' : ''}" 
                            onclick="window.categoriesPage.togglePreselection('${id}')"
                            title="${isPreselected ? 'Tâches pré-cochées' : 'Tâches non cochées'}">
                        <i class="fas fa-${isPreselected ? 'check-square' : 'square'}"></i>
                    </button>
                    <button class="btn-minimal config" 
                            onclick="window.categoriesPage.openModal('${id}')">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // MODAL AVEC MOTS-CLÉS DYNAMIQUES
    // ================================================
    openModal(categoryId) {
        const categories = this.getCategories();
        const category = categories[categoryId];
        if (!category) {
            console.warn('[CategoriesPage] Catégorie non trouvée:', categoryId);
            return;
        }
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        // Charger les mots-clés et filtres
        const keywords = this.getCategoryKeywords(categoryId);
        const filters = this.getCategoryFilters(categoryId);
        
        // Stocker temporairement pour la modal
        this.tempKeywords = JSON.parse(JSON.stringify(keywords));
        this.tempFilters = JSON.parse(JSON.stringify(filters));
        
        console.log('[CategoriesPage] 🔑 Modal ouverte pour', categoryId, ':', { keywords, filters });
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-modern">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">${category.icon}</span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
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
                    
                    <div class="modal-content">
                        <div class="tab-panel active" id="tab-keywords">
                            ${this.renderKeywordsTab(this.tempKeywords, categoryId)}
                        </div>
                        
                        <div class="tab-panel" id="tab-filters">
                            ${this.renderFiltersTab(this.tempFilters)}
                        </div>
                        
                        ${category.isCustom ? `
                            <div class="tab-panel" id="tab-settings">
                                <div class="settings-content">
                                    <div class="category-settings-form">
                                        <h4><i class="fas fa-edit"></i> Modifier la catégorie</h4>
                                        
                                        <div class="form-group">
                                            <label>Nom</label>
                                            <input type="text" id="edit-name" value="${category.name}" maxlength="50">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Description</label>
                                            <textarea id="edit-description" rows="2">${category.description || ''}</textarea>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Icône</label>
                                                <input type="text" id="edit-icon" value="${category.icon}" readonly>
                                                <div class="icon-picker-inline">
                                                    ${['📁', '📂', '🗂️', '📋', '📝', '🎯', '🚀', '💡', '🔧', '📊', '🎨', '🏠', '🌟', '💼', '🔖'].map(icon => 
                                                        `<span class="icon-option ${category.icon === icon ? 'selected' : ''}" 
                                                                onclick="document.getElementById('edit-icon').value='${icon}'">${icon}</span>`
                                                    ).join('')}
                                                </div>
                                            </div>
                                            
                                            <div class="form-group">
                                                <label>Couleur</label>
                                                <input type="text" id="edit-color" value="${category.color}" readonly 
                                                       style="background: ${category.color}; color: ${this.getContrastColor(category.color)};">
                                                <div class="color-picker-inline">
                                                    ${this.colors.map(color => 
                                                        `<span class="color-option ${category.color === color ? 'selected' : ''}" 
                                                                style="background: ${color}"
                                                                onclick="window.categoriesPage.updateColorInput('${color}')"></span>`
                                                    ).join('')}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Priorité: <span id="edit-priority-value">${category.priority || 50}</span></label>
                                            <input type="range" id="edit-priority" min="1" max="100" value="${category.priority || 50}"
                                                   oninput="document.getElementById('edit-priority-value').textContent = this.value">
                                        </div>
                                        
                                        <button class="btn-update-category" onclick="window.categoriesPage.updateCategoryInfo('${categoryId}')">
                                            <i class="fas fa-save"></i> Mettre à jour les informations
                                        </button>
                                    </div>
                                    
                                    <div class="danger-zone">
                                        <h4><i class="fas fa-exclamation-triangle"></i> Zone dangereuse</h4>
                                        <p>Cette action est irréversible. Tous les mots-clés et filtres associés seront supprimés.</p>
                                        <button class="btn-danger" onclick="window.categoriesPage.deleteCategory('${categoryId}')">
                                            <i class="fas fa-trash"></i> Supprimer définitivement la catégorie
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPage.closeModal()">
                            Fermer
                        </button>
                        <button class="btn-modern primary" onclick="window.categoriesPage.saveModal()">
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

    renderKeywordsTab(keywords, categoryId) {
        // MODIFICATION: Toutes les catégories peuvent maintenant être modifiées
        const isReadOnly = false; // Toujours permettre la modification
        
        return `
            <div class="keywords-layout">
                <div class="keywords-info">
                    <i class="fas fa-info-circle"></i>
                    <p>Ajoutez ou supprimez des mots-clés pour améliorer la détection. Les modifications sont sauvegardées localement.</p>
                </div>
                
                <div class="keywords-grid">
                    ${this.renderKeywordBox('absolute', 'Mots-clés absolus', keywords.absolute || [], '#FF6B6B', 'fa-star', 'Déclenchent toujours la catégorie', isReadOnly)}
                    ${this.renderKeywordBox('strong', 'Mots-clés forts', keywords.strong || [], '#FECA57', 'fa-bolt', 'Poids élevé dans la détection', isReadOnly)}
                    ${this.renderKeywordBox('weak', 'Mots-clés faibles', keywords.weak || [], '#54A0FF', 'fa-feather', 'Poids modéré dans la détection', isReadOnly)}
                    ${this.renderKeywordBox('exclusions', 'Exclusions', keywords.exclusions || [], '#A29BFE', 'fa-ban', 'Empêchent la détection', isReadOnly)}
                </div>
            </div>
        `;
    }

    renderKeywordBox(type, title, keywords, color, icon, description, isReadOnly = false) {
        return `
            <div class="keyword-box ${isReadOnly ? 'readonly' : ''}">
                <div class="box-header">
                    <h4><i class="fas ${icon}"></i> ${title}</h4>
                    <span class="box-count" style="background: ${color}20; color: ${color}">${keywords.length}</span>
                </div>
                <p class="box-description">${description}</p>
                
                ${!isReadOnly ? `
                    <div class="input-modern">
                        <input type="text" id="${type}-input" placeholder="Ajouter un mot-clé..." 
                               onkeypress="if(event.key === 'Enter') window.categoriesPage.addKeyword('${type}')">
                        <button style="background: ${color}" onclick="window.categoriesPage.addKeyword('${type}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                ` : ''}
                
                <div class="tags ${isReadOnly ? 'readonly' : ''}" id="${type}-items">
                    ${keywords.map(k => `
                        <span class="tag" style="background: ${color}15; color: ${color}">
                            ${k}
                            ${!isReadOnly ? `
                                <button onclick="window.categoriesPage.removeKeyword('${type}', '${k}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFiltersTab(filters) {
        return `
            <div class="filters-layout">
                <div class="filter-section">
                    <h3><i class="fas fa-check-circle"></i> Filtres d'inclusion</h3>
                    <p class="section-description">Ces filtres permettent d'inclure spécifiquement certains emails dans cette catégorie</p>
                    
                    <div class="filter-box">
                        <h4><i class="fas fa-globe"></i> Domaines autorisés</h4>
                        <p class="filter-hint">Emails provenant uniquement de ces domaines seront inclus dans cette catégorie</p>
                        <div class="input-modern">
                            <input type="text" id="include-domain" placeholder="exemple.com" 
                                   onkeypress="if(event.key === 'Enter') window.categoriesPage.addFilter('includeDomains')">
                            <button onclick="window.categoriesPage.addFilter('includeDomains')" style="background: #10B981;">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="includeDomains-items">
                            ${(filters.includeDomains || []).map(d => `
                                <span class="tag filter-tag">
                                    <i class="fas fa-globe"></i>
                                    ${d}
                                    <button onclick="window.categoriesPage.removeFilter('includeDomains', '${d}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h3><i class="fas fa-ban"></i> Filtres d'exclusion</h3>
                    <p class="section-description">Ces filtres empêchent certains emails d'être classés dans cette catégorie</p>
                    
                    <div class="filter-box">
                        <h4><i class="fas fa-shield-alt"></i> Domaines exclus</h4>
                        <p class="filter-hint">Emails de ces domaines ne seront jamais classés dans cette catégorie</p>
                        <div class="input-modern">
                            <input type="text" id="exclude-domain" placeholder="spam.com" 
                                   onkeypress="if(event.key === 'Enter') window.categoriesPage.addFilter('excludeDomains')">
                            <button onclick="window.categoriesPage.addFilter('excludeDomains')" style="background: #EF4444;">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="excludeDomains-items">
                            ${(filters.excludeDomains || []).map(d => `
                                <span class="tag exclude-tag">
                                    <i class="fas fa-shield-alt"></i>
                                    ${d}
                                    <button onclick="window.categoriesPage.removeFilter('excludeDomains', '${d}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="filter-box">
                        <h4><i class="fas fa-user-slash"></i> Emails exclus</h4>
                        <p class="filter-hint">Ces adresses email spécifiques seront toujours exclues</p>
                        <div class="input-modern">
                            <input type="text" id="exclude-email" placeholder="noreply@exemple.com" 
                                   onkeypress="if(event.key === 'Enter') window.categoriesPage.addFilter('excludeEmails')">
                            <button onclick="window.categoriesPage.addFilter('excludeEmails')" style="background: #EF4444;">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="excludeEmails-items">
                            ${(filters.excludeEmails || []).map(e => `
                                <span class="tag exclude-tag">
                                    <i class="fas fa-user-slash"></i>
                                    ${e}
                                    <button onclick="window.categoriesPage.removeFilter('excludeEmails', '${e}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DES MOTS-CLÉS
    // ================================================
    addKeyword(type) {
        const input = document.getElementById(`${type}-input`);
        if (!input || !input.value.trim()) {
            this.showToast('⚠️ Veuillez saisir un mot-clé', 'warning');
            return;
        }
        
        const keyword = input.value.trim().toLowerCase();
        
        // Vérifier si déjà présent
        if (this.tempKeywords[type].includes(keyword)) {
            this.showToast('⚠️ Mot-clé déjà présent', 'warning');
            return;
        }
        
        // Ajouter le mot-clé
        this.tempKeywords[type].push(keyword);
        
        // Rafraîchir l'affichage
        this.refreshKeywordsDisplay();
        
        // Vider l'input
        input.value = '';
        input.focus();
        
        this.showToast(`✅ Mot-clé "${keyword}" ajouté`);
    }
    
    removeKeyword(type, keyword) {
        const index = this.tempKeywords[type].indexOf(keyword);
        if (index > -1) {
            this.tempKeywords[type].splice(index, 1);
            this.refreshKeywordsDisplay();
            this.showToast(`🗑️ Mot-clé "${keyword}" supprimé`);
        }
    }
    
    refreshKeywordsDisplay() {
        const keywordsTab = document.getElementById('tab-keywords');
        if (keywordsTab && this.editingCategoryId) {
            keywordsTab.innerHTML = this.renderKeywordsTab(this.tempKeywords, this.editingCategoryId);
        }
    }

    // ================================================
    // GESTION DES FILTRES
    // ================================================
    addFilter(type) {
        const inputMap = {
            'includeDomains': 'include-domain',
            'excludeDomains': 'exclude-domain',
            'excludeEmails': 'exclude-email'
        };
        
        const input = document.getElementById(inputMap[type]);
        if (!input?.value.trim()) {
            this.showToast('⚠️ Veuillez saisir une valeur', 'warning');
            return;
        }
        
        const value = input.value.trim().toLowerCase();
        
        // Validation selon le type
        if (type.includes('Domain') && !this.isValidDomain(value)) {
            this.showToast('⚠️ Format de domaine invalide', 'warning');
            return;
        }
        
        if (type.includes('Email') && !this.isValidEmail(value)) {
            this.showToast('⚠️ Format d\'email invalide', 'warning');
            return;
        }
        
        // Vérifier si déjà ajouté
        if (this.tempFilters[type].includes(value)) {
            this.showToast('⚠️ Filtre déjà ajouté', 'warning');
            return;
        }
        
        // Ajouter le filtre
        this.tempFilters[type].push(value);
        
        // Rafraîchir l'affichage
        this.refreshFiltersDisplay();
        
        // Vider l'input
        input.value = '';
        input.focus();
        
        this.showToast(`✅ Filtre "${value}" ajouté`);
    }
    
    removeFilter(type, value) {
        const index = this.tempFilters[type].indexOf(value);
        if (index > -1) {
            this.tempFilters[type].splice(index, 1);
            this.refreshFiltersDisplay();
            this.showToast(`🗑️ Filtre "${value}" supprimé`);
        }
    }
    
    refreshFiltersDisplay() {
        const filtersTab = document.getElementById('tab-filters');
        if (filtersTab) {
            filtersTab.innerHTML = this.renderFiltersTab(this.tempFilters);
        }
    }
    
    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain) && domain.length <= 253;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ================================================
    // SAUVEGARDE MODAL
    // ================================================
    saveModal() {
        if (!this.editingCategoryId) return;
        
        // Sauvegarder les mots-clés pour TOUTES les catégories (custom et prédéfinies)
        this.saveCategoryKeywords(this.editingCategoryId, this.tempKeywords);
        
        // Sauvegarder les filtres
        this.saveCategoryFilters(this.editingCategoryId, this.tempFilters);
        
        // Notifier CategoryManager si disponible
        if (window.categoryManager) {
            if (typeof window.categoryManager.updateCategoryKeywords === 'function') {
                window.categoryManager.updateCategoryKeywords(this.editingCategoryId, this.tempKeywords);
            }
            if (typeof window.categoryManager.updateCategoryFilters === 'function') {
                window.categoryManager.updateCategoryFilters(this.editingCategoryId, this.tempFilters);
            }
        }
        
        this.showToast('✅ Modifications enregistrées');
        this.closeModal();
        this.updateCategoriesDisplay();
    }

    // ================================================
    // FONCTIONS DE BACKUP ET IMPORT/EXPORT
    // ================================================
    exportFullBackup() {
        console.log('[CategoriesPage] 📦 Export complet...');
        
        const data = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            type: 'full_backup',
            categories: this.exportAllCategories(),
            emails: this.getAllEmails(),
            tasks: this.getAllTasks(),
            settings: this.loadSettings(),
            categoryKeywords: this.exportAllCategoryKeywords(),
            categoryFilters: this.exportAllCategoryFilters(),
            userInfo: {
                exportDate: new Date().toISOString(),
                source: 'CategoriesPage v24.0'
            }
        };
        
        this.downloadAsFile(data, `email-manager-backup-${this.formatDateForFilename()}.json`);
        this.addToBackupHistory('Export complet', 'full', data);
        this.showToast('✅ Export complet terminé!');
    }

    exportCategories() {
        console.log('[CategoriesPage] 🏷️ Export catégories...');
        
        const data = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            type: 'categories_only',
            categories: this.exportAllCategories(),
            categoryKeywords: this.exportAllCategoryKeywords(),
            categoryFilters: this.exportAllCategoryFilters(),
            settings: this.loadSettings(),
            userInfo: {
                exportDate: new Date().toISOString(),
                source: 'CategoriesPage v24.0'
            }
        };
        
        this.downloadAsFile(data, `categories-backup-${this.formatDateForFilename()}.json`);
        this.addToBackupHistory('Export catégories', 'categories', data);
        this.showToast('✅ Export catégories terminé!');
    }

    exportTasks() {
        console.log('[CategoriesPage] 📋 Export tâches...');
        
        const tasks = this.getAllTasks();
        
        const data = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            type: 'tasks_only',
            tasks: tasks,
            taskCount: tasks.length,
            userInfo: {
                exportDate: new Date().toISOString(),
                source: 'CategoriesPage v24.0'
            }
        };
        
        this.downloadAsFile(data, `tasks-backup-${this.formatDateForFilename()}.json`);
        this.addToBackupHistory('Export tâches', 'tasks', data);
        this.showToast(`✅ ${tasks.length} tâches exportées!`);
    }

    exportAllCategories() {
        const categories = this.getCategories();
        const exported = {};
        
        Object.entries(categories).forEach(([id, category]) => {
            exported[id] = {
                ...category,
                keywords: this.getCategoryKeywords(id),
                filters: this.getCategoryFilters(id)
            };
        });
        
        return exported;
    }

    exportAllCategoryKeywords() {
        const categories = this.getCategories();
        const keywords = {};
        
        Object.keys(categories).forEach(categoryId => {
            keywords[categoryId] = this.getCategoryKeywords(categoryId);
        });
        
        // Ajouter aussi ceux du localStorage non présents dans categories
        const allSaved = this.loadAllCategoryKeywords();
        Object.entries(allSaved).forEach(([id, kw]) => {
            if (!keywords[id]) {
                keywords[id] = kw;
            }
        });
        
        return keywords;
    }

    exportAllCategoryFilters() {
        const categories = this.getCategories();
        const filters = {};
        
        Object.keys(categories).forEach(categoryId => {
            filters[categoryId] = this.getCategoryFilters(categoryId);
        });
        
        // Ajouter aussi ceux du localStorage non présents dans categories
        const allSaved = this.loadAllCategoryFilters();
        Object.entries(allSaved).forEach(([id, filter]) => {
            if (!filters[id]) {
                filters[id] = filter;
            }
        });
        
        return filters;
    }

    // ================================================
    // IMPORT DE DONNÉES
    // ================================================
    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleFileImport(input) {
        const file = input.files[0];
        if (!file) return;
        this.processFile(file);
    }
    
    processFile(file) {
        console.log('[CategoriesPage] 📁 Import fichier:', file.name);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.processImportData(data);
            } catch (error) {
                console.error('[CategoriesPage] Erreur lecture fichier:', error);
                this.showToast('❌ Erreur: Fichier invalide', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    processImportData(data) {
        console.log('[CategoriesPage] 🔄 Traitement import:', data.type);
        
        // Validation des données
        if (document.getElementById('validateData')?.checked && !this.validateImportData(data)) {
            this.showToast('❌ Données invalides', 'error');
            return;
        }
        
        const mergeData = document.getElementById('mergeData')?.checked;
        const overwriteSettings = document.getElementById('overwriteSettings')?.checked;
        
        try {
            let importResult = { categories: 0, keywords: 0, filters: 0, tasks: 0, settings: 0 };
            
            // Import selon le type
            switch (data.type) {
                case 'full_backup':
                    importResult = this.importFullBackup(data, mergeData, overwriteSettings);
                    break;
                case 'categories_only':
                    importResult = this.importCategories(data, mergeData);
                    break;
                case 'tasks_only':
                    importResult = this.importTasks(data, mergeData);
                    break;
                case 'settings_only':
                    importResult = this.importSettings(data, overwriteSettings);
                    break;
                default:
                    // Tenter de détecter le type automatiquement
                    if (data.categories || data.categoryKeywords) {
                        importResult = this.importCategories(data, mergeData);
                    } else if (data.tasks) {
                        importResult = this.importTasks(data, mergeData);
                    } else {
                        this.showToast('⚠️ Type de sauvegarde non reconnu', 'warning');
                        return;
                    }
            }
            
            // Message de succès avec détails
            const messages = [];
            if (importResult.categories > 0) messages.push(`${importResult.categories} catégories`);
            if (importResult.keywords > 0) messages.push(`${importResult.keywords} mots-clés`);
            if (importResult.filters > 0) messages.push(`${importResult.filters} filtres`);
            if (importResult.tasks > 0) messages.push(`${importResult.tasks} tâches`);
            if (importResult.settings > 0) messages.push('paramètres');
            
            const message = messages.length > 0 ? 
                `✅ Import réussi: ${messages.join(', ')}` : 
                '✅ Import terminé';
                
            this.showToast(message);
            this.refreshPage();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur import:', error);
            this.showToast('❌ Erreur lors de l\'import', 'error');
        }
    }

    validateImportData(data) {
        if (!data.version || !data.timestamp) {
            console.error('[CategoriesPage] Données manquantes');
            return false;
        }
        
        // Version check
        const majorVersion = parseInt(data.version.split('.')[0]);
        if (majorVersion > 2) {
            console.warn('[CategoriesPage] Version plus récente détectée');
        }
        
        return true;
    }

    importFullBackup(data, merge, overwriteSettings) {
        console.log('[CategoriesPage] 📦 Import backup complet');
        
        let result = { categories: 0, keywords: 0, filters: 0, tasks: 0, settings: 0 };
        
        // Import des paramètres
        if (overwriteSettings && data.settings) {
            this.saveSettings(data.settings);
            result.settings = 1;
        }
        
        // Import des catégories et mots-clés
        if (data.categories || data.categoryKeywords || data.categoryFilters) {
            const catResult = this.importCategories(data, merge);
            result.categories = catResult.categories;
            result.keywords = catResult.keywords;
            result.filters = catResult.filters;
        }
        
        // Import des tâches
        if (data.tasks) {
            const taskResult = this.importTasks(data, merge);
            result.tasks = taskResult.tasks;
        }
        
        this.addToBackupHistory('Import complet', 'import', data);
        return result;
    }

    importCategories(data, merge) {
        console.log('[CategoriesPage] 🏷️ Import catégories');
        
        let result = { categories: 0, keywords: 0, filters: 0 };
        
        // Import des mots-clés
        if (data.categoryKeywords) {
            if (!merge) {
                // Effacer toutes les données existantes
                localStorage.removeItem('categoryKeywords');
            }
            
            Object.entries(data.categoryKeywords).forEach(([categoryId, keywords]) => {
                this.saveCategoryKeywords(categoryId, keywords);
                result.keywords += Object.values(keywords).flat().length;
            });
            
            console.log(`[CategoriesPage] ${result.keywords} mots-clés importés`);
        }
        
        // Import des filtres
        if (data.categoryFilters) {
            if (!merge) {
                // Effacer toutes les données existantes
                localStorage.removeItem('categoryFilters');
            }
            
            Object.entries(data.categoryFilters).forEach(([categoryId, filters]) => {
                this.saveCategoryFilters(categoryId, filters);
                result.filters += Object.values(filters).flat().length;
            });
            
            console.log(`[CategoriesPage] ${result.filters} filtres importés`);
        }
        
        // Import des catégories (si format ancien avec keywords/filters intégrés)
        if (data.categories) {
            Object.entries(data.categories).forEach(([categoryId, category]) => {
                if (category.keywords) {
                    this.saveCategoryKeywords(categoryId, category.keywords);
                    result.keywords += Object.values(category.keywords).flat().length;
                }
                if (category.filters) {
                    this.saveCategoryFilters(categoryId, category.filters);
                    result.filters += Object.values(category.filters).flat().length;
                }
                result.categories++;
            });
        }
        
        this.addToBackupHistory('Import catégories', 'import', data);
        return result;
    }

    importTasks(data, merge) {
        console.log('[CategoriesPage] 📋 Import tâches');
        
        let result = { tasks: 0 };
        
        if (!data.tasks || !Array.isArray(data.tasks)) {
            console.error('[CategoriesPage] Aucune tâche trouvée dans l\'import');
            return result;
        }
        
        if (window.taskManager) {
            if (!merge) {
                // Supprimer toutes les tâches existantes
                const existingTasks = window.taskManager.getAllTasks();
                existingTasks.forEach(task => {
                    window.taskManager.deleteTask(task.id);
                });
            }
            
            // Importer les nouvelles tâches
            data.tasks.forEach(task => {
                try {
                    // Générer un nouvel ID pour éviter les conflits
                    const newTask = { ...task };
                    delete newTask.id;
                    
                    if (task.hasEmail && task.emailContent) {
                        window.taskManager.createTaskFromEmail(newTask);
                    } else {
                        window.taskManager.createTask(newTask);
                    }
                    result.tasks++;
                } catch (error) {
                    console.error('[CategoriesPage] Erreur import tâche:', error);
                }
            });
            
            console.log(`[CategoriesPage] ${result.tasks} tâches importées`);
        } else {
            console.warn('[CategoriesPage] TaskManager non disponible pour l\'import des tâches');
        }
        
        this.addToBackupHistory('Import tâches', 'import', data);
        return result;
    }

    importSettings(data, overwrite) {
        console.log('[CategoriesPage] ⚙️ Import paramètres');
        
        let result = { settings: 0 };
        
        if (overwrite && data.settings) {
            this.saveSettings(data.settings);
            result.settings = 1;
        }
        
        this.addToBackupHistory('Import paramètres', 'import', data);
        return result;
    }

    // ================================================
    // GESTION HISTORIQUE BACKUP
    // ================================================
    getBackupHistory() {
        try {
            const history = localStorage.getItem('backupHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            return [];
        }
    }

    addToBackupHistory(name, type, data) {
        const history = this.getBackupHistory();
        const backup = {
            id: 'backup_' + Date.now(),
            name: name,
            type: type,
            date: new Date().toISOString(),
            size: this.formatFileSize(JSON.stringify(data).length),
            data: data
        };
        
        history.unshift(backup);
        
        // Garder seulement les 10 dernières sauvegardes
        if (history.length > 10) {
            history.splice(10);
        }
        
        try {
            localStorage.setItem('backupHistory', JSON.stringify(history));
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde historique:', error);
        }
    }

    createAutoBackup() {
        console.log('[CategoriesPage] 🕐 Création sauvegarde automatique');
        this.exportFullBackup();
    }

    clearBackupHistory() {
        if (confirm('Êtes-vous sûr de vouloir vider l\'historique des sauvegardes ?')) {
            localStorage.removeItem('backupHistory');
            this.showToast('🗑️ Historique vidé');
            
            // Rafraîchir l'affichage
            const historyContainer = document.getElementById('backup-history');
            if (historyContainer) {
                historyContainer.innerHTML = this.renderBackupHistory();
            }
        }
    }

    restoreBackup(backupId) {
        const history = this.getBackupHistory();
        const backup = history.find(b => b.id === backupId);
        
        if (!backup) {
            this.showToast('❌ Sauvegarde non trouvée', 'error');
            return;
        }
        
        if (confirm(`Restaurer la sauvegarde "${backup.name}" ?`)) {
            this.processImportData(backup.data);
        }
    }

    downloadBackup(backupId) {
        const history = this.getBackupHistory();
        const backup = history.find(b => b.id === backupId);
        
        if (!backup) {
            this.showToast('❌ Sauvegarde non trouvée', 'error');
            return;
        }
        
        this.downloadAsFile(backup.data, `${backup.name.toLowerCase().replace(/\s+/g, '-')}-${this.formatDateForFilename()}.json`);
    }

    deleteBackup(backupId) {
        if (confirm('Supprimer cette sauvegarde ?')) {
            const history = this.getBackupHistory();
            const filteredHistory = history.filter(b => b.id !== backupId);
            
            try {
                localStorage.setItem('backupHistory', JSON.stringify(filteredHistory));
                this.showToast('🗑️ Sauvegarde supprimée');
                
                // Rafraîchir l'affichage
                const historyContainer = document.getElementById('backup-history');
                if (historyContainer) {
                    historyContainer.innerHTML = this.renderBackupHistory();
                }
            } catch (error) {
                this.showToast('❌ Erreur suppression', 'error');
            }
        }
    }

    // ================================================
    // SAUVEGARDE/CHARGEMENT LOCAL
    // ================================================
    saveCategoryKeywords(categoryId, keywords) {
        try {
            const allKeywords = this.loadAllCategoryKeywords();
            allKeywords[categoryId] = keywords;
            localStorage.setItem('categoryKeywords', JSON.stringify(allKeywords));
            
            // Notifier CategoryManager si disponible
            if (window.categoryManager && typeof window.categoryManager.updateCategoryKeywords === 'function') {
                window.categoryManager.updateCategoryKeywords(categoryId, keywords);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde mots-clés:', error);
        }
    }
    
    loadCategoryKeywords(categoryId) {
        try {
            const allKeywords = this.loadAllCategoryKeywords();
            return allKeywords[categoryId] || null;
        } catch (error) {
            console.error('[CategoriesPage] Erreur chargement mots-clés:', error);
            return null;
        }
    }
    
    loadAllCategoryKeywords() {
        try {
            const saved = localStorage.getItem('categoryKeywords');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }
    
    saveCategoryFilters(categoryId, filters) {
        try {
            const allFilters = this.loadAllCategoryFilters();
            allFilters[categoryId] = filters;
            localStorage.setItem('categoryFilters', JSON.stringify(allFilters));
            
            // Notifier CategoryManager si disponible
            if (window.categoryManager && typeof window.categoryManager.updateCategoryFilters === 'function') {
                window.categoryManager.updateCategoryFilters(categoryId, filters);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde filtres:', error);
        }
    }
    
    loadCategoryFilters(categoryId) {
        try {
            const allFilters = this.loadAllCategoryFilters();
            return allFilters[categoryId] || null;
        } catch (error) {
            console.error('[CategoriesPage] Erreur chargement filtres:', error);
            return null;
        }
    }
    
    loadAllCategoryFilters() {
        try {
            const saved = localStorage.getItem('categoryFilters');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    formatDateForFilename() {
        const now = new Date();
        return now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadAsFile(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getCategoryStats(categoryId) {
        if (categoryId === 'other') {
            return { totalKeywords: 0, emailCount: this.getCategoryEmailCount('other') };
        }
        
        const keywords = this.getCategoryKeywords(categoryId);
        const totalKeywords = (keywords.absolute?.length || 0) + 
                             (keywords.strong?.length || 0) + 
                             (keywords.weak?.length || 0) + 
                             (keywords.exclusions?.length || 0);
        
        return {
            totalKeywords: totalKeywords,
            emailCount: this.getCategoryEmailCount(categoryId)
        };
    }

    calculateEmailStats() {
        const emails = this.getAllEmails();
        const stats = {};
        
        emails.forEach(email => {
            const cat = email.category;
            if (cat === null || cat === undefined || cat === '') {
                stats.other = (stats.other || 0) + 1;
            } else {
                stats[cat] = (stats[cat] || 0) + 1;
            }
        });
        
        return stats;
    }

    getCategoryEmailCount(categoryId) {
        const emails = this.getAllEmails();
        
        if (categoryId === 'other') {
            return emails.filter(email => {
                const cat = email.category;
                return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
            }).length;
        }
        
        return emails.filter(email => email.category === categoryId).length;
    }

    getActiveCount(categories, activeCategories) {
        if (!activeCategories) {
            const allCategoriesCount = Object.keys(categories).length;
            const hasOtherEmails = this.getCategoryEmailCount('other') > 0;
            return allCategoriesCount + (hasOtherEmails ? 1 : 0);
        }
        
        const activeCategoriesCount = activeCategories.filter(id => categories[id]).length;
        const otherIsActive = activeCategories.includes('other');
        const hasOtherEmails = this.getCategoryEmailCount('other') > 0;
        
        return activeCategoriesCount + (otherIsActive && hasOtherEmails ? 1 : 0);
    }

    getTotalKeywords(categories) {
        let total = 0;
        Object.keys(categories).forEach(id => {
            if (id !== 'other') {
                const stats = this.getCategoryStats(id);
                total += stats.totalKeywords;
            }
        });
        return total;
    }

    // ================================================
    // ACTIONS UTILISATEUR
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
        if (this.activeTab !== 'categories') return;
        
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        const categories = this.getCategories();
        const settings = this.loadSettings();
        
        container.innerHTML = this.renderCategories(categories, settings.activeCategories);
    }

    toggleCategory(categoryId) {
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories || null;
        
        if (activeCategories === null) {
            const allCategories = Object.keys(this.getCategories());
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
        
        // Notifier CategoryManager si disponible
        if (window.categoryManager && typeof window.categoryManager.updateActiveCategories === 'function') {
            window.categoryManager.updateActiveCategories(activeCategories);
        }
        
        this.updateCategoriesDisplay();
        this.showToast('État de la catégorie mis à jour');
    }

    togglePreselection(categoryId) {
        const settings = this.loadSettings();
        let taskPreselectedCategories = settings.taskPreselectedCategories || [];
        
        const isPreselected = taskPreselectedCategories.includes(categoryId);
        
        if (isPreselected) {
            taskPreselectedCategories = taskPreselectedCategories.filter(id => id !== categoryId);
        } else {
            taskPreselectedCategories.push(categoryId);
        }
        
        settings.taskPreselectedCategories = taskPreselectedCategories;
        this.saveSettings(settings);
        
        // Synchronisation avec CategoryManager
        if (window.categoryManager && typeof window.categoryManager.updateTaskPreselectedCategories === 'function') {
            window.categoryManager.updateTaskPreselectedCategories(taskPreselectedCategories);
        }
        
        this.updateCategoriesDisplay();
        
        const categories = this.getCategories();
        const category = categories[categoryId];
        const message = isPreselected ? 
            `☐ ${category?.name || categoryId} - Pré-sélection désactivée` : 
            `☑️ ${category?.name || categoryId} - Pré-sélection activée`;
        this.showToast(message);
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        this.editingCategoryId = null;
        this.tempKeywords = null;
        this.tempFilters = null;
    }

    refreshPage() {
        const container = document.querySelector('.categories-modern')?.parentElement;
        if (container) {
            this.render(container);
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
            console.error('[CategoriesPage] Erreur sauvegarde settings:', error);
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
                <p>Mode démonstration avec données d'exemple</p>
                <button class="btn-modern primary" onclick="window.categoriesPage.refreshPage()">
                    <i class="fas fa-redo"></i> Recharger
                </button>
            </div>
        `;
    }

    // ================================================
    // CRÉATION DE CATÉGORIE PERSONNALISÉE
    // ================================================
    showCreateCategoryModal() {
        const modalContent = `
            <div class="create-category-form">
                <h3><i class="fas fa-folder-plus"></i> Créer une nouvelle catégorie</h3>
                
                <div class="form-group">
                    <label for="cat-name">Nom de la catégorie *</label>
                    <input type="text" id="cat-name" placeholder="Ex: Projets personnels" maxlength="50">
                </div>
                
                <div class="form-group">
                    <label for="cat-description">Description</label>
                    <textarea id="cat-description" rows="2" placeholder="Description de la catégorie (optionnel)"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="cat-icon">Icône</label>
                        <div class="icon-picker">
                            <input type="text" id="cat-icon" value="📁" readonly>
                            <div class="icon-options">
                                ${['📁', '📂', '🗂️', '📋', '📝', '🎯', '🚀', '💡', '🔧', '📊', '🎨', '🏠', '🌟', '💼', '🔖'].map(icon => 
                                    `<span class="icon-option" onclick="window.categoriesPage.selectIcon('${icon}')">${icon}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="cat-color">Couleur</label>
                        <div class="color-picker">
                            <input type="text" id="cat-color" value="#6366f1" readonly style="background: #6366f1; color: white;">
                            <div class="color-options">
                                ${this.colors.map(color => 
                                    `<span class="color-option" style="background: ${color}" onclick="window.categoriesPage.selectColor('${color}')"></span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="cat-priority">Priorité</label>
                    <input type="range" id="cat-priority" min="1" max="100" value="50">
                    <span id="priority-value">50</span>
                    <div class="priority-hint">50 = même priorité que Finance, Tâches, Réunions, etc.</div>
                </div>
                
                <div class="form-info">
                    <i class="fas fa-info-circle"></i>
                    <p>Après création, vous pourrez ajouter des mots-clés et des filtres pour personnaliser la détection.</p>
                </div>
            </div>
        `;
        
        this.showModal('Nouvelle catégorie', modalContent, () => {
            return this.createCategory();
        }, {
            footer: `
                <button class="btn-modern secondary" onclick="window.categoriesPage.closeModal()">Annuler</button>
                <button class="btn-modern primary" onclick="window.categoriesPage.createCategory()">
                    <i class="fas fa-plus"></i> Créer la catégorie
                </button>
            `
        });
        
        // Ajouter l'événement pour le slider de priorité
        setTimeout(() => {
            const slider = document.getElementById('cat-priority');
            const valueDisplay = document.getElementById('priority-value');
            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    valueDisplay.textContent = e.target.value;
                });
            }
        }, 100);
    }
    
    selectIcon(icon) {
        const input = document.getElementById('cat-icon');
        if (input) {
            input.value = icon;
            // Fermer le picker
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
            event.target.classList.add('selected');
        }
    }
    
    selectColor(color) {
        const input = document.getElementById('cat-color');
        if (input) {
            input.value = color;
            input.style.background = color;
            input.style.color = this.getContrastColor(color);
            // Fermer le picker
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            event.target.classList.add('selected');
        }
    }
    
    getContrastColor(hexColor) {
        // Convertir hex en RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Calculer la luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    
    createCategory() {
        const name = document.getElementById('cat-name')?.value.trim();
        const description = document.getElementById('cat-description')?.value.trim();
        const icon = document.getElementById('cat-icon')?.value || '📁';
        const color = document.getElementById('cat-color')?.value || '#6366f1';
        const priority = parseInt(document.getElementById('cat-priority')?.value || '50');
        
        if (!name) {
            this.showToast('⚠️ Le nom est requis', 'warning');
            return false;
        }
        
        // Créer la catégorie
        const categoryData = {
            name,
            description,
            icon,
            color,
            priority,
            keywords: {
                absolute: [],
                strong: [],
                weak: [],
                exclusions: []
            }
        };
        
        // Si CategoryManager est disponible, l'utiliser
        if (window.categoryManager && typeof window.categoryManager.createCustomCategory === 'function') {
            try {
                const newCategory = window.categoryManager.createCustomCategory(categoryData);
                this.showToast(`✅ Catégorie "${name}" créée avec succès!`);
                this.closeModal();
                
                // Ouvrir directement la modal de configuration
                setTimeout(() => {
                    this.openModal(newCategory.id);
                }, 300);
                
                // Rafraîchir l'affichage
                this.refreshPage();
                return true;
            } catch (error) {
                console.error('[CategoriesPage] Erreur création catégorie:', error);
                this.showToast('❌ Erreur lors de la création', 'error');
                return false;
            }
        } else {
            // Fallback: créer localement
            const categoryId = this.generateCategoryId(name);
            const customCategories = this.loadCustomCategories();
            
            customCategories[categoryId] = {
                ...categoryData,
                id: categoryId,
                isCustom: true,
                createdAt: new Date().toISOString()
            };
            
            this.saveCustomCategories(customCategories);
            this.saveCategoryKeywords(categoryId, categoryData.keywords);
            
            this.showToast(`✅ Catégorie "${name}" créée avec succès!`);
            this.closeModal();
            
            // Ouvrir directement la modal de configuration
            setTimeout(() => {
                this.openModal(categoryId);
            }, 300);
            
            this.refreshPage();
            return true;
        }
    }
    
    generateCategoryId(name) {
        const base = name.toLowerCase()
            .replace(/[àâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        return 'custom_' + base + '_' + Date.now();
    }
    
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }
    
    saveCustomCategories(categories) {
        try {
            localStorage.setItem('customCategories', JSON.stringify(categories));
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde catégories custom:', error);
        }
    }

    // ================================================
    // MÉTHODES POUR LA CATÉGORIE "AUTRE"
    // ================================================
    showOtherCategoryInfo() {
        const content = `
            <div class="other-info-content">
                <h3><i class="fas fa-info-circle"></i> Catégorie "Autre"</h3>
                <p>La catégorie "Autre" est une catégorie spéciale qui contient tous les emails non catégorisés.</p>
                
                <div class="info-section">
                    <h4>Caractéristiques :</h4>
                    <ul>
                        <li>Ne peut pas être supprimée</li>
                        <li>Ne peut pas avoir de mots-clés</li>
                        <li>Toujours visible dans la liste des emails</li>
                        <li>Peut être pré-sélectionnée pour les tâches</li>
                    </ul>
                </div>
                
                <div class="info-section">
                    <h4>Utilisation :</h4>
                    <p>Les emails apparaissent dans "Autre" quand :</p>
                    <ul>
                        <li>Aucune catégorie ne correspond</li>
                        <li>L'email n'a pas été analysé</li>
                        <li>La catégorisation a échoué</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal('Information', content, null, {
            footer: `<button class="btn-modern secondary" onclick="window.categoriesPage.closeModal()">Fermer</button>`
        });
    }

    toggleOtherCategory() {
        this.showToast('ℹ️ La catégorie "Autre" est toujours visible', 'info');
    }

    updateColorInput(color) {
        const input = document.getElementById('edit-color');
        if (input) {
            input.value = color;
            input.style.background = color;
            input.style.color = this.getContrastColor(color);
        }
    }
    
    updateCategoryInfo(categoryId) {
        const name = document.getElementById('edit-name')?.value.trim();
        const description = document.getElementById('edit-description')?.value.trim();
        const icon = document.getElementById('edit-icon')?.value;
        const color = document.getElementById('edit-color')?.value;
        const priority = parseInt(document.getElementById('edit-priority')?.value || '50');
        
        if (!name) {
            this.showToast('⚠️ Le nom est requis', 'warning');
            return;
        }
        
        const updates = {
            name,
            description,
            icon,
            color,
            priority
        };
        
        // Si CategoryManager est disponible, l'utiliser
        if (window.categoryManager && typeof window.categoryManager.updateCustomCategory === 'function') {
            try {
                window.categoryManager.updateCustomCategory(categoryId, updates);
                this.showToast('✅ Catégorie mise à jour');
                this.refreshPage();
            } catch (error) {
                console.error('[CategoriesPage] Erreur mise à jour:', error);
                this.showToast('❌ Erreur lors de la mise à jour', 'error');
            }
        } else {
            // Fallback: mettre à jour localement
            const customCategories = this.loadCustomCategories();
            if (customCategories[categoryId]) {
                customCategories[categoryId] = {
                    ...customCategories[categoryId],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveCustomCategories(customCategories);
                this.showToast('✅ Catégorie mise à jour');
                this.refreshPage();
            }
        }
    }
    
    deleteCategory(categoryId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?\n\nTous les mots-clés et filtres associés seront perdus.')) {
            return;
        }
        
        // Si CategoryManager est disponible, l'utiliser
        if (window.categoryManager && typeof window.categoryManager.deleteCustomCategory === 'function') {
            try {
                window.categoryManager.deleteCustomCategory(categoryId);
                this.showToast('🗑️ Catégorie supprimée');
                this.closeModal();
                this.refreshPage();
            } catch (error) {
                console.error('[CategoriesPage] Erreur suppression:', error);
                this.showToast('❌ Erreur lors de la suppression', 'error');
            }
        } else {
            // Fallback: supprimer localement
            const customCategories = this.loadCustomCategories();
            if (customCategories[categoryId]) {
                delete customCategories[categoryId];
                this.saveCustomCategories(customCategories);
                
                // Supprimer aussi les mots-clés et filtres
                const allKeywords = this.loadAllCategoryKeywords();
                delete allKeywords[categoryId];
                localStorage.setItem('categoryKeywords', JSON.stringify(allKeywords));
                
                const allFilters = this.loadAllCategoryFilters();
                delete allFilters[categoryId];
                localStorage.setItem('categoryFilters', JSON.stringify(allFilters));
                
                this.showToast('🗑️ Catégorie supprimée');
                this.closeModal();
                this.refreshPage();
            }
        }
    }

    // ================================================
    // MODAL GÉNÉRIQUE
    // ================================================
    showModal(title, content, onSave, options = {}) {
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-modern">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="btn-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        ${content}
                    </div>
                    
                    ${options.footer ? `
                        <div class="modal-footer">
                            ${options.footer}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    // ================================================
    // STYLES
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesAdvancedStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesAdvancedStyles';
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
            
            /* Header avec onglets principaux */
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
            
            .subtitle {
                font-size: 16px;
                color: var(--text-secondary);
                margin: 4px 0 0 0;
            }
            
            /* Onglets principaux */
            .main-tabs {
                display: flex;
                gap: 8px;
                background: var(--surface);
                padding: 4px;
                border-radius: 12px;
                border: 1px solid var(--border);
            }
            
            .main-tab {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                border: none;
                background: transparent;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .main-tab:hover {
                background: var(--bg);
                color: var(--text);
            }
            
            .main-tab.active {
                background: var(--primary);
                color: white;
                box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            }
            
            /* Contenu des onglets */
            .tab-content {
                margin-top: 24px;
            }
            
            /* Stats bar avec recherche */
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
                grid-template-columns: repeat(6, minmax(0, 1fr));
                gap: 10px;
                padding: 0;
            }
            
            .category-card {
                background: var(--surface);
                border-radius: 10px;
                padding: 12px;
                border: 1px solid var(--border);
                transition: all 0.2s;
                cursor: pointer;
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 10px;
                width: 100%;
                box-sizing: border-box;
                min-height: 120px;
            }
            
            .category-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                border-color: var(--cat-color);
            }
            
            .category-card.inactive {
                opacity: 0.6;
                background: #F5F5F5;
            }
            
            .card-header {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
            }
            
            .cat-emoji {
                font-size: 24px;
                width: 40px;
                height: 40px;
                background: var(--cat-color)15;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .cat-info {
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }
            
            .cat-name {
                font-size: 16px;
                font-weight: 600;
                color: var(--text);
                line-height: 1.3;
                word-wrap: break-word;
                overflow-wrap: break-word;
                hyphens: auto;
                max-height: 2.6em;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            .cat-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 2px;
            }
            
            .meta-count {
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            .meta-star {
                font-size: 12px;
                color: #F59E0B;
                font-weight: 600;
            }
            
            .meta-description {
                font-size: 11px;
                color: var(--text-secondary);
                opacity: 0.8;
            }
            
            .card-actions {
                display: grid;
                grid-template-columns: repeat(3, 32px);
                gap: 3px;
                justify-content: start;
                margin-top: auto;
            }
            
            .btn-minimal {
                width: 32px;
                height: 32px;
                padding: 0;
                border: 1px solid #E5E7EB;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .btn-minimal:hover {
                transform: scale(1.05);
            }
            
            .btn-minimal.on {
                background: #10B981;
                color: white;
                border-color: #10B981;
            }
            
            .btn-minimal.off {
                background: #EF4444;
                color: white;
                border-color: #EF4444;
            }
            
            .btn-minimal.task {
                color: #9CA3AF;
            }
            
            .btn-minimal.task.selected {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }
            
            .btn-minimal.config {
                color: #6B7280;
            }
            
            .btn-minimal.config:hover {
                color: var(--text);
                border-color: var(--text);
            }
            
            /* STYLES BACKUP - Section principale */
            .backup-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px 0;
            }
            
            .backup-section {
                background: var(--surface);
                border-radius: 20px;
                padding: 32px;
                margin-bottom: 32px;
                border: 1px solid var(--border);
                box-shadow: var(--shadow);
            }
            
            .backup-header {
                margin-bottom: 32px;
                text-align: center;
            }
            
            .backup-header h2 {
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 8px 0;
                color: var(--text);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }
            
            .backup-header p {
                font-size: 16px;
                color: var(--text-secondary);
                margin: 0;
            }
            
            /* Grille des cartes backup */
            .backup-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 24px;
                margin-bottom: 32px;
            }
            
            .backup-card {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border: 2px solid var(--border);
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            }
            
            .backup-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, var(--primary), var(--secondary));
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .backup-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                border-color: var(--primary);
            }
            
            .backup-card:hover::before {
                opacity: 1;
            }
            
            .backup-icon {
                font-size: 48px;
                margin-bottom: 16px;
                display: block;
            }
            
            .backup-card h3 {
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 8px 0;
                color: var(--text);
            }
            
            .backup-card p {
                font-size: 14px;
                color: var(--text-secondary);
                margin: 0 0 20px 0;
                line-height: 1.5;
            }
            
            /* Boutons backup */
            .btn-backup {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 24px;
                border: none;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                text-decoration: none;
                min-width: 140px;
            }
            
            .btn-backup.primary {
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }
            
            .btn-backup.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            }
            
            .btn-backup.secondary {
                background: var(--bg);
                color: var(--text);
                border: 2px solid var(--border);
            }
            
            .btn-backup.secondary:hover {
                background: var(--surface);
                border-color: var(--primary);
                color: var(--primary);
            }
            
            .btn-backup.danger {
                background: var(--danger);
                color: white;
            }
            
            .btn-backup.danger:hover {
                background: #dc2626;
                transform: translateY(-1px);
            }
            
            /* Zone d'import */
            .import-zone {
                margin: 24px 0;
            }
            
            .import-area {
                border: 3px dashed var(--border);
                border-radius: 16px;
                padding: 48px 24px;
                text-align: center;
                background: #fafbfc;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            }
            
            .import-area:hover {
                border-color: var(--primary);
                background: #f0f9ff;
            }
            
            .import-area.dragover {
                border-color: var(--success);
                background: #f0fdf4;
            }
            
            .import-icon {
                font-size: 64px;
                margin-bottom: 16px;
                opacity: 0.7;
            }
            
            .import-area h3 {
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 8px 0;
                color: var(--text);
            }
            
            .import-area p {
                font-size: 16px;
                color: var(--text-secondary);
                margin: 4px 0;
            }
            
            .import-info {
                font-size: 12px !important;
                opacity: 0.7;
            }
            
            /* Options d'import */
            .import-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
                margin-top: 24px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 12px;
                border: 1px solid var(--border);
            }
            
            .import-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 0;
                cursor: pointer;
                font-size: 14px;
                color: var(--text);
            }
            
            .import-option input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--primary);
            }
            
            /* Historique backup */
            .backup-history {
                background: #fafbfc;
                border-radius: 12px;
                border: 1px solid var(--border);
                overflow: hidden;
            }
            
            .backup-empty {
                text-align: center;
                padding: 48px 24px;
                color: var(--text-secondary);
            }
            
            .backup-empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            
            .backup-empty p {
                margin: 0;
                font-size: 16px;
            }
            
            .backup-empty-sub {
                font-size: 14px !important;
                opacity: 0.7;
            }
            
            .backup-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid var(--border);
                transition: background-color 0.3s;
            }
            
            .backup-item:last-child {
                border-bottom: none;
            }
            
            .backup-item:hover {
                background: white;
            }
            
            .backup-item-info {
                flex: 1;
            }
            
            .backup-item-name {
                font-size: 16px;
                font-weight: 600;
                color: var(--text);
                margin-bottom: 4px;
            }
            
            .backup-item-meta {
                display: flex;
                gap: 12px;
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            .backup-date, .backup-size, .backup-type {
                padding: 2px 8px;
                background: #e5e7eb;
                border-radius: 6px;
            }
            
            .backup-item-actions {
                display: flex;
                gap: 8px;
            }
            
            .btn-backup-small {
                padding: 6px 12px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .btn-backup-small.primary {
                background: var(--primary);
                color: white;
            }
            
            .btn-backup-small.secondary {
                background: var(--bg);
                color: var(--text-secondary);
                border: 1px solid var(--border);
            }
            
            .btn-backup-small.danger {
                background: var(--danger);
                color: white;
            }
            
            .backup-actions {
                display: flex;
                justify-content: center;
                gap: 16px;
                margin-top: 24px;
            }
            
            /* Modal moderne avec onglets */
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
                animation: fadeIn 0.3s;
            }
            
            .modal-modern {
                background: #FFFFFF;
                border-radius: 24px;
                width: 100%;
                max-width: 1000px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
                animation: slideUp 0.3s;
                border: 2px solid var(--border);
                overflow: hidden;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-header {
                padding: 28px;
                border-bottom: 2px solid #D1D5DB;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #FFFFFF;
            }
            
            .modal-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .modal-icon {
                font-size: 32px;
            }
            
            .modal-header h2 {
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
            
            /* Onglets modernes */
            .tabs-modern {
                display: flex;
                padding: 0 28px;
                gap: 32px;
                border-bottom: 2px solid #D1D5DB;
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
            
            .modal-content {
                padding: 0;
                overflow-y: auto;
                flex: 1;
                background: #E8EAED;
            }
            
            .tab-panel {
                display: none;
                background: #E8EAED;
                min-height: 400px;
                padding: 24px;
            }
            
            .tab-panel.active {
                display: block;
            }
            
            /* Contenu des onglets mots-clés */
            .keywords-layout {
                padding: 20px 0;
            }
            
            /* Info box */
            .keywords-info {
                background: #e0e7ff;
                border: 1px solid #6366f1;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #4338ca;
                font-size: 14px;
            }
            
            .keywords-info i {
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .keywords-info p {
                margin: 0;
                line-height: 1.5;
            }
            
            .keywords-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
            }
            
            .keyword-box {
                background: #FFFFFF;
                border: 2px solid var(--border);
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .keyword-box.readonly {
                background: #f9fafb;
                border-color: #e5e7eb;
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
            
            .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                min-height: 40px;
                background: #FAFBFC;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid #E5E7EB;
            }
            
            .tags.readonly {
                background: #f3f4f6;
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
            
            /* Onglet filtres */
            .filters-layout {
                padding: 20px 0;
            }
            
            .filter-section {
                background: white;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 20px;
                border: 1px solid var(--border);
            }
            
            .filter-section h3 {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .section-description {
                font-size: 14px;
                color: var(--text-secondary);
                margin: 0 0 20px 0;
            }
            
            .filter-box {
                margin-bottom: 24px;
            }
            
            .filter-box:last-child {
                margin-bottom: 0;
            }
            
            .filter-box h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .filter-hint {
                font-size: 13px;
                color: var(--text-secondary);
                margin: 0 0 12px 0;
            }
            
            .filter-tag {
                background: #10B98115;
                color: #10B981;
            }
            
            .exclude-tag {
                background: #EF444415;
                color: #EF4444;
            }
            
            /* Other info modal */
            .other-info-content {
                padding: 20px;
            }
            
            .other-info-content h3 {
                margin: 0 0 16px 0;
                font-size: 20px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .info-section {
                margin: 20px 0;
            }
            
            .info-section h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .info-section ul {
                margin: 0;
                padding-left: 24px;
            }
            
            .info-section li {
                margin: 8px 0;
                line-height: 1.5;
            }
            
            /* Settings content */
            .settings-content {
                padding: 20px;
            }
            
            .danger-zone {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 12px;
                padding: 20px;
            }
            
            .danger-zone h4 {
                margin: 0 0 8px 0;
                color: #dc2626;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .danger-zone p {
                margin: 0 0 16px 0;
                color: #7f1d1d;
            }
            
            .btn-danger {
                background: #dc2626;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s;
            }
            
            .btn-danger:hover {
                background: #b91c1c;
                transform: translateY(-1px);
            }
            
            /* Footer modal */
            .modal-footer {
                padding: 24px 28px;
                border-top: 2px solid #D1D5DB;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                background: #FFFFFF;
            }
            
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
            
            /* States */
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
            
            .error-state p {
                font-size: 14px;
                margin-bottom: 16px;
            }
            
            /* Toast */
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
            
            .toast-modern.info {
                background: var(--primary);
            }
            
            /* Carte de création - même style que les autres */
            .category-card.create-card {
                cursor: pointer;
            }
            
            .category-card.create-card:hover {
                border-color: #dc2626;
            }
            
            .create-card .cat-emoji {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .priority-hint {
                font-size: 11px;
                color: var(--text-secondary);
                margin-top: 4px;
                font-style: italic;
            }
            
            /* Formulaire création catégorie */
            .create-category-form {
                padding: 20px;
            }
            
            .create-category-form h3 {
                margin: 0 0 24px 0;
                font-size: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .form-group input[type="text"],
            .form-group textarea {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid var(--border);
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s;
            }
            
            .form-group input[type="text"]:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            /* Icon picker */
            .icon-picker {
                position: relative;
            }
            
            .icon-picker input {
                cursor: pointer;
                text-align: center;
                font-size: 24px;
            }
            
            .icon-options {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 2px solid var(--border);
                border-radius: 8px;
                padding: 8px;
                margin-top: 4px;
                display: none;
                grid-template-columns: repeat(5, 1fr);
                gap: 4px;
                box-shadow: var(--shadow-lg);
                z-index: 10;
            }
            
            .icon-picker:focus-within .icon-options {
                display: grid;
            }
            
            .icon-option {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .icon-option:hover {
                background: var(--bg);
                transform: scale(1.1);
            }
            
            .icon-option.selected {
                background: var(--primary);
                color: white;
            }
            
            /* Color picker */
            .color-picker {
                position: relative;
            }
            
            .color-picker input {
                cursor: pointer;
                text-align: center;
                font-weight: 600;
            }
            
            .color-options {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 2px solid var(--border);
                border-radius: 8px;
                padding: 8px;
                margin-top: 4px;
                display: none;
                grid-template-columns: repeat(5, 1fr);
                gap: 4px;
                box-shadow: var(--shadow-lg);
                z-index: 10;
            }
            
            .color-picker:focus-within .color-options {
                display: grid;
            }
            
            .color-option {
                width: 40px;
                height: 40px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid transparent;
            }
            
            .color-option:hover {
                transform: scale(1.1);
                border-color: var(--text);
            }
            
            .color-option.selected {
                border-color: var(--text);
                box-shadow: 0 0 0 2px white, 0 0 0 4px var(--text);
            }
            
            /* Priority slider */
            input[type="range"] {
                width: 100%;
                margin: 8px 0;
            }
            
            #priority-value,
            #edit-priority-value {
                font-weight: 600;
                color: var(--primary);
                margin-left: 8px;
            }
            
            .form-info {
                background: #e0e7ff;
                border: 1px solid #6366f1;
                border-radius: 8px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                color: #4338ca;
                margin-top: 20px;
            }
            
            /* Settings form pour catégories custom */
            .category-settings-form {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                border: 1px solid var(--border);
            }
            
            .category-settings-form h4 {
                margin: 0 0 20px 0;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .icon-picker-inline,
            .color-picker-inline {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 4px;
                margin-top: 8px;
                padding: 8px;
                background: var(--bg);
                border-radius: 8px;
            }
            
            .btn-update-category {
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 20px;
                transition: all 0.3s;
            }
            
            .btn-update-category:hover {
                background: #5558E3;
                transform: translateY(-1px);
            }
            
            /* Responsive ajustements */
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .icon-picker-inline,
                .color-picker-inline {
                    grid-template-columns: repeat(5, 1fr);
                }
            }
                .categories-grid {
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                }
                
                .backup-grid {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                }
            }
            
            @media (max-width: 768px) {
                .categories-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 8px;
                }
                
                .stats-bar {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .search-modern {
                    grid-column: 1 / -1;
                }
                
                .keywords-grid {
                    grid-template-columns: 1fr;
                }
                
                .modal-modern {
                    max-height: 95vh;
                }
                
                .header-content h1 {
                    font-size: 24px;
                }
                
                .main-tabs {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .backup-grid {
                    grid-template-columns: 1fr;
                }
                
                .backup-section {
                    padding: 20px;
                }
                
                .backup-card {
                    padding: 20px;
                }
                
                .import-area {
                    padding: 32px 16px;
                }
                
                .backup-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .backup-item-actions {
                    width: 100%;
                    justify-content: flex-end;
                }
                
                .import-options {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INTÉGRATION GLOBALE AVANCÉE
// ================================================

// Créer l'instance principale
window.categoriesPage = new CategoriesPageAdvanced();

// Intégration avec PageManager si disponible
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        console.log('[CategoriesPage] 📄 Chargement page settings via PageManager');
        window.categoriesPage.render(container);
    };
    
    window.pageManager.pages.categories = (container) => {
        console.log('[CategoriesPage] 📄 Chargement page categories via PageManager');
        window.categoriesPage.render(container);
    };
}

// Fonction d'initialisation pour démarrage automatique
function initializeCategoriesPageAdvanced() {
    console.log('[CategoriesPage] 🎯 Initialisation automatique avancée...');
    
    const possibleContainers = [
        '#pageContent',
        '.main-content', 
        '.content',
        '.settings-container',
        '.app-content',
        '#app',
        'main'
    ];
    
    let container = null;
    for (const selector of possibleContainers) {
        container = document.querySelector(selector);
        if (container) {
            console.log(`[CategoriesPage] 📦 Container trouvé: ${selector}`);
            break;
        }
    }
    
    if (container) {
        window.categoriesPage.render(container);
        console.log('[CategoriesPage] ✅ Rendu automatique réussi');
    } else {
        console.warn('[CategoriesPage] ⚠️ Aucun container trouvé pour le rendu automatique');
        console.log('[CategoriesPage] 💡 Essayez: window.categoriesPage.render(document.body)');
    }
}

// Écouter les changements de CategoryManager si disponible
if (window.categoryManager) {
    console.log('[CategoriesPage] 🔗 Connexion avec CategoryManager détectée');
    
    // Écouter les changements de catégories
    window.addEventListener('categorySettingsChanged', (event) => {
        console.log('[CategoriesPage] 🔄 Changement CategoryManager détecté:', event.detail);
        if (window.categoriesPage.activeTab === 'categories') {
            window.categoriesPage.updateCategoriesDisplay();
        }
    });
}

// Initialisation différée
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategoriesPageAdvanced);
} else {
    setTimeout(initializeCategoriesPageAdvanced, 100);
}

console.log('[CategoriesPage] ✅ CategoriesPage v24.0 chargée - Export/Import complet fonctionnel!');
console.log('[CategoriesPage] 🎯 Pour un rendu manuel: window.categoriesPage.render(container)');
console.log('[CategoriesPage] 📋 Fonctionnalités: Gestion individuelle mots-clés + Export/Import tâches');
