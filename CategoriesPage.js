// CategoriesPage.js - Version 22.0 - Avec onglets séparés et configuration backup
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v22.0...');

// Nettoyer toute instance précédente
if (window.categoriesPage) {
    console.log('[CategoriesPage] 🧹 Nettoyage instance précédente...');
    delete window.categoriesPage;
}

class CategoriesPageV22 {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.viewMode = 'grid';
        this.currentTab = 'categories'; // Onglet actif par défaut
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8'
        ];
        console.log('[CategoriesPage] 🎨 Interface moderne v22.0 initialisée avec onglets');
    }

    // ================================================
    // RENDU PRINCIPAL AVEC DEUX ONGLETS
    // ================================================
    render(container) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant');
            return;
        }

        try {
            container.innerHTML = `
                <div class="categories-modern">
                    <!-- Header pour la page Paramètres -->
                    <div class="header-modern">
                        <div class="header-content">
                            <h1>Paramètres <span class="emoji">⚙️</span></h1>
                            <p class="subtitle">Configuration de votre extension</p>
                        </div>
                    </div>
                    
                    <!-- Deux onglets principaux -->
                    <div class="main-tabs-container">
                        <div class="main-tabs-two">
                            <button class="main-tab ${this.currentTab === 'categories' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV22.switchMainTab('categories')">
                                <i class="fas fa-tags"></i>
                                <span>Catégories</span>
                            </button>
                            <button class="main-tab ${this.currentTab === 'backup' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV22.switchMainTab('backup')">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Sauvegarde</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Contenu des deux onglets -->
                    <div class="main-tab-content">
                        <!-- Onglet Catégories (vue existante) -->
                        <div id="tab-categories" class="tab-pane ${this.currentTab === 'categories' ? 'active' : ''}">
                            ${this.renderCategoriesTab()}
                        </div>
                        
                        <!-- Onglet Sauvegarde -->
                        <div id="tab-backup" class="tab-pane ${this.currentTab === 'backup' ? 'active' : ''}">
                            ${this.renderBackupTab()}
                        </div>
                    </div>
                </div>
            `;
            
            this.addStyles();
            this.initializeBackupSettings();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">😵</div>
                    <h3>Oups! Une erreur est survenue</h3>
                    <button class="btn-modern primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Recharger
                    </button>
                </div>
            `;
        }
    }

    // Méthode pour la page Settings/Paramètres
    renderSettings(container) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant pour settings');
            return;
        }
        
        // Utiliser la même méthode render()
        this.render(container);
    }

    // ================================================
    // ONGLET CATÉGORIES (Vue actuelle)
    // ================================================
    renderCategoriesTab() {
        const categories = window.categoryManager?.getCategories() || {};
        const settings = this.loadSettings();
        
        return `
            <!-- Bouton créer en haut à droite -->
            <button class="btn-create-top" onclick="window.categoriesPageV22.showCreateModal()">
                <i class="fas fa-plus"></i>
                <span>Créer</span>
            </button>
            
            <!-- Header avec titre de section -->
            <div class="section-header">
                <h2>Catégories <span class="emoji">✨</span></h2>
                <p>Organisez vos emails avec style</p>
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
                           onkeyup="window.categoriesPageV22.handleSearch(this.value)">
                </div>
            </div>
            
            <!-- Grille de catégories -->
            <div class="categories-grid" id="categories-container">
                ${this.renderCategories(categories, settings.activeCategories)}
            </div>
        `;
    }

    // ================================================
    // ONGLET SAUVEGARDE
    // ================================================
    renderBackupTab() {
        const backupStatus = window.backupService?.getStatus() || {
            enabled: true,  // Activé par défaut
            autoBackup: true,  // Sauvegarde automatique activée par défaut
            interval: 300000,
            lastBackup: 'Jamais',
            provider: 'unknown'
        };
        
        // Récupérer le chemin du dossier depuis la config
        const backupConfig = window.backupService?.config || {};
        const folderPath = backupConfig.folderPath || 'Documents/EmailSortPro/Backups';
        
        return `
            <div class="backup-tab-content">
                <!-- Header avec titre de section -->
                <div class="section-header">
                    <h2>Sauvegarde Cloud <span class="emoji">☁️</span></h2>
                    <p>Protégez vos données automatiquement</p>
                </div>
                
                <!-- Status de sauvegarde -->
                <div class="backup-status-card">
                    <div class="status-header">
                        <div class="status-icon ${backupStatus.enabled ? 'active' : ''}">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="status-info">
                            <h3>État de la sauvegarde</h3>
                            <p class="status-text">
                                ${backupStatus.enabled ? 
                                    `Sauvegarde automatique ${backupStatus.autoBackup ? 'activée' : 'désactivée'}` : 
                                    'Sauvegarde désactivée'
                                }
                            </p>
                            <p class="last-backup">
                                <i class="fas fa-clock"></i>
                                Dernière sauvegarde : ${backupStatus.lastBackup}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Actions rapides -->
                    <div class="backup-quick-actions">
                        <button class="btn-backup-action primary" onclick="window.categoriesPageV22.performManualBackup()">
                            <i class="fas fa-save"></i>
                            Sauvegarder maintenant
                        </button>
                        <button class="btn-backup-action secondary" onclick="window.categoriesPageV22.showRestoreModal()">
                            <i class="fas fa-undo"></i>
                            Restaurer
                        </button>
                    </div>
                </div>
                
                <!-- Configuration de sauvegarde -->
                <div class="backup-config-section">
                    <h3><i class="fas fa-cog"></i> Configuration</h3>
                    
                    <div class="config-group">
                        <div class="config-item">
                            <label class="toggle-label">
                                <input type="checkbox" 
                                       id="backup-enabled"
                                       ${backupStatus.enabled ? 'checked' : ''} 
                                       onchange="window.categoriesPageV22.updateBackupConfig('enabled', this.checked)">
                                <span class="toggle-slider"></span>
                                <span class="toggle-text">Activer la sauvegarde</span>
                            </label>
                        </div>
                        
                        <div class="config-item">
                            <label class="toggle-label">
                                <input type="checkbox" 
                                       id="backup-auto"
                                       ${backupStatus.autoBackup ? 'checked' : ''} 
                                       ${!backupStatus.enabled ? 'disabled' : ''}
                                       onchange="window.categoriesPageV22.updateBackupConfig('autoBackup', this.checked)">
                                <span class="toggle-slider"></span>
                                <span class="toggle-text">Sauvegarde automatique</span>
                            </label>
                        </div>
                        
                        <div class="config-item">
                            <label class="config-label">Intervalle de sauvegarde</label>
                            <select id="backup-interval" 
                                    class="config-select"
                                    ${!backupStatus.enabled || !backupStatus.autoBackup ? 'disabled' : ''}
                                    onchange="window.categoriesPageV22.updateBackupConfig('backupInterval', parseInt(this.value))">
                                <option value="60000" ${backupStatus.interval === 60000 ? 'selected' : ''}>1 minute</option>
                                <option value="300000" ${backupStatus.interval === 300000 ? 'selected' : ''}>5 minutes</option>
                                <option value="900000" ${backupStatus.interval === 900000 ? 'selected' : ''}>15 minutes</option>
                                <option value="1800000" ${backupStatus.interval === 1800000 ? 'selected' : ''}>30 minutes</option>
                                <option value="3600000" ${backupStatus.interval === 3600000 ? 'selected' : ''}>1 heure</option>
                            </select>
                        </div>
                        
                        <div class="config-item">
                            <label class="config-label">Nombre de sauvegardes à conserver</label>
                            <select class="config-select"
                                    onchange="window.categoriesPageV22.updateBackupConfig('maxBackups', parseInt(this.value))">
                                <option value="5">5 dernières</option>
                                <option value="10" selected>10 dernières</option>
                                <option value="20">20 dernières</option>
                                <option value="50">50 dernières</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Données à sauvegarder -->
                <div class="backup-data-section">
                    <h3><i class="fas fa-database"></i> Données à sauvegarder</h3>
                    
                    <div class="data-options">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   checked
                                   onchange="window.categoriesPageV22.updateBackupConfig('includeCategories', this.checked)">
                            <span><i class="fas fa-tags"></i> Catégories personnalisées</span>
                        </label>
                        
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   checked
                                   onchange="window.categoriesPageV22.updateBackupConfig('includeTasks', this.checked)">
                            <span><i class="fas fa-tasks"></i> Tâches créées</span>
                        </label>
                        
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   onchange="window.categoriesPageV22.updateBackupConfig('includeSettings', this.checked)">
                            <span><i class="fas fa-cog"></i> Paramètres de l'application</span>
                        </label>
                    </div>
                </div>
                
                <!-- Informations sur le stockage avec bouton de sélection du dossier -->
                <div class="backup-info-section">
                    <div class="info-card">
                        <i class="fas fa-folder-open"></i>
                        <div class="info-content">
                            <p>Vos données sont sauvegardées dans le dossier :</p>
                            <div class="folder-path-container">
                                <code id="backup-folder-path">${folderPath}</code>
                                <button class="btn-select-folder" onclick="window.categoriesPageV22.selectBackupFolder()" title="Choisir un autre dossier">
                                    <i class="fas fa-folder-open"></i>
                                    <span>Choisir le dossier</span>
                                </button>
                            </div>
                            <p class="info-provider">Provider actuel : <strong>${this.getProviderName(backupStatus.provider)}</strong></p>
                        </div>
                    </div>
                </div>
                
                <!-- Section avancée -->
                <div class="backup-advanced-section">
                    <h3><i class="fas fa-tools"></i> Options avancées</h3>
                    
                    <div class="advanced-actions">
                        <button class="btn-advanced" onclick="window.categoriesPageV22.exportLocalBackup()">
                            <i class="fas fa-download"></i>
                            Exporter backup local
                        </button>
                        <button class="btn-advanced" onclick="window.categoriesPageV22.importLocalBackup()">
                            <i class="fas fa-upload"></i>
                            Importer backup local
                        </button>
                        <button class="btn-advanced danger" onclick="window.categoriesPageV22.clearAllBackups()">
                            <i class="fas fa-trash"></i>
                            Effacer tous les backups
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchMainTab(tabName) {
        this.currentTab = tabName;
        
        // Mise à jour des onglets
        document.querySelectorAll('.main-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`.main-tab[onclick*="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Mise à jour du contenu
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const activePane = document.getElementById(`tab-${tabName}`);
        if (activePane) {
            activePane.classList.add('active');
        }
        
        // Animation de transition
        if (activePane) {
            activePane.style.opacity = '0';
            setTimeout(() => {
                activePane.style.opacity = '1';
            }, 50);
        }
    }

    // ================================================
    // MÉTHODES EXISTANTES POUR LES CATÉGORIES
    // ================================================
    renderCategories(categories, activeCategories) {
        const filtered = this.filterCategories(categories);
        
        console.log('[CategoriesPage] 🏷️ Rendu des catégories:', {
            total: Object.keys(categories).length,
            filtered: Object.keys(filtered).length,
            searchTerm: this.searchTerm
        });
        
        if (Object.keys(filtered).length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>Aucune catégorie trouvée</p>
                    ${this.searchTerm ? `
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.handleSearch('')">
                            Effacer la recherche
                        </button>
                    ` : ''}
                </div>
            `;
        }
        
        // Calculer les statistiques pour chaque catégorie
        const emailStats = this.calculateEmailStats();
        console.log('[CategoriesPage] 📊 Statistiques emails:', emailStats);
        
        // Rendu des cartes de catégories
        const categoryCards = Object.entries(filtered)
            .map(([id, category]) => this.renderCategoryCard(id, category, activeCategories, emailStats[id] || 0))
            .join('');
        
        // CORRECTION CRITIQUE: Ajouter la catégorie "Autre" si elle n'existe pas mais a des emails
        const otherCount = emailStats.other || 0;
        let otherCard = '';
        
        if (otherCount > 0 && !filtered.other) {
            console.log(`[CategoriesPage] 📌 Ajout carte "Autre" avec ${otherCount} emails`);
            
            const isActive = activeCategories === null || activeCategories.includes('other');
            const settings = this.loadSettings();
            const isPreselected = settings.taskPreselectedCategories?.includes('other') || false;
            
            otherCard = `
                <div class="category-card ${!isActive ? 'inactive' : ''}" 
                     data-id="other"
                     style="--cat-color: #64748b"
                     onclick="window.categoriesPageV22.showOtherCategoryInfo()">
                    
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
                                onclick="window.categoriesPageV22.toggleOtherCategory()"
                                title="Les emails 'Autre' sont toujours visibles">
                            ${isActive ? 'ON' : 'OFF'}
                        </button>
                        <button class="btn-minimal task ${isPreselected ? 'selected' : ''}" 
                                onclick="window.categoriesPageV22.togglePreselection('other')"
                                title="${isPreselected ? 'Tâches pré-cochées' : 'Tâches non cochées'}">
                            <i class="fas fa-${isPreselected ? 'check-square' : 'square'}"></i>
                        </button>
                        <button class="btn-minimal config" 
                                onclick="window.categoriesPageV22.showOtherCategoryInfo()"
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
                 onclick="window.categoriesPageV22.openModal('${id}')">
                
                <div class="card-header">
                    <div class="cat-emoji">${category.icon}</div>
                    <div class="cat-info">
                        <div class="cat-name">${category.name}</div>
                        <div class="cat-meta">
                            <span class="meta-count">${stats.keywords}</span>
                            ${stats.absolute > 0 ? `<span class="meta-star">★ ${stats.absolute}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="btn-minimal ${isActive ? 'on' : 'off'}" 
                            onclick="window.categoriesPageV22.toggleCategory('${id}')">
                        ${isActive ? 'ON' : 'OFF'}
                    </button>
                    <button class="btn-minimal task ${isPreselected ? 'selected' : ''}" 
                            onclick="window.categoriesPageV22.togglePreselection('${id}')"
                            title="${isPreselected ? 'Tâches pré-cochées' : 'Tâches non cochées'}">
                        <i class="fas fa-${isPreselected ? 'check-square' : 'square'}"></i>
                    </button>
                    <button class="btn-minimal config" 
                            onclick="window.categoriesPageV22.openModal('${id}')">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================
    initializeBackupSettings() {
        // S'assurer que le service de backup est initialisé
        if (window.backupService && !window.backupService.isInitialized) {
            window.backupService.initialize().catch(error => {
                console.error('[CategoriesPage] Erreur initialisation backup:', error);
            });
        }
    }

    async selectBackupFolder() {
        const provider = window.backupService?.provider;
        
        if (!provider || provider === 'unknown') {
            this.showToast('⚠️ Aucun provider de stockage cloud détecté', 'warning');
            return;
        }
        
        // Créer la modal de sélection de dossier
        this.showFolderSelectionModal();
    }

    showFolderSelectionModal() {
        this.closeModal();
        
        const provider = window.backupService?.provider;
        const currentPath = window.backupService?.config?.folderPath || 'Documents/EmailSortPro/Backups';
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern modal-folder">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">📁</span>
                            <h2>Choisir le dossier de sauvegarde</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="folder-selection-content">
                            <div class="current-folder-info">
                                <p><strong>Dossier actuel :</strong></p>
                                <div class="current-path">${currentPath}</div>
                            </div>
                            
                            <div class="folder-suggestions">
                                <h4>Suggestions de dossiers :</h4>
                                <div class="folder-options">
                                    <button class="folder-option" onclick="window.categoriesPageV22.setBackupFolder('Documents/EmailSortPro/Backups')">
                                        <i class="fas fa-folder"></i>
                                        <div>
                                            <div class="folder-name">Documents/EmailSortPro/Backups</div>
                                            <div class="folder-desc">Dossier par défaut (recommandé)</div>
                                        </div>
                                    </button>
                                    
                                    <button class="folder-option" onclick="window.categoriesPageV22.setBackupFolder('Documents/Backups/EmailSortPro')">
                                        <i class="fas fa-folder"></i>
                                        <div>
                                            <div class="folder-name">Documents/Backups/EmailSortPro</div>
                                            <div class="folder-desc">Dossier Backups général</div>
                                        </div>
                                    </button>
                                    
                                    <button class="folder-option" onclick="window.categoriesPageV22.setBackupFolder('EmailSortPro/Backups')">
                                        <i class="fas fa-folder"></i>
                                        <div>
                                            <div class="folder-name">EmailSortPro/Backups</div>
                                            <div class="folder-desc">À la racine du ${this.getProviderName(provider)}</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="custom-folder-section">
                                <h4>Ou entrer un chemin personnalisé :</h4>
                                <div class="custom-folder-input">
                                    <input type="text" 
                                           id="custom-folder-path" 
                                           placeholder="Ex: MonDossier/EmailSortPro/Backups"
                                           value="${currentPath}">
                                    <button class="btn-apply-custom" onclick="window.categoriesPageV22.applyCustomFolder()">
                                        <i class="fas fa-check"></i> Appliquer
                                    </button>
                                </div>
                                <p class="folder-hint">
                                    <i class="fas fa-info-circle"></i>
                                    Le dossier sera créé automatiquement s'il n'existe pas
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.closeModal()">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
    }

    setBackupFolder(folderPath) {
        this.updateBackupConfig('folderPath', folderPath);
        
        // Mettre à jour l'affichage
        const pathElement = document.getElementById('backup-folder-path');
        if (pathElement) {
            pathElement.textContent = folderPath;
        }
        
        this.closeModal();
        this.showToast(`✅ Dossier de sauvegarde modifié : ${folderPath}`, 'success');
    }

    applyCustomFolder() {
        const input = document.getElementById('custom-folder-path');
        if (!input) return;
        
        const customPath = input.value.trim();
        if (!customPath) {
            this.showToast('⚠️ Veuillez entrer un chemin de dossier', 'warning');
            return;
        }
        
        // Nettoyer le chemin (retirer les / au début et à la fin)
        const cleanPath = customPath.replace(/^\/+|\/+$/g, '');
        
        this.setBackupFolder(cleanPath);
    }

    async performManualBackup() {
        if (!window.backupService) {
            this.showToast('⚠️ Service de backup non disponible', 'warning');
            return;
        }

        this.showToast('🔄 Sauvegarde en cours...', 'info');
        
        try {
            const success = await window.backupService.backup();
            if (success) {
                this.showToast('✅ Sauvegarde réussie !', 'success');
                // Rafraîchir l'affichage du statut
                this.refreshBackupTab();
            } else {
                this.showToast('❌ Échec de la sauvegarde', 'error');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur backup:', error);
            this.showToast('❌ Erreur : ' + error.message, 'error');
        }
    }

    showRestoreModal() {
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern modal-restore">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">🔄</span>
                            <h2>Restaurer une sauvegarde</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="restore-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>
                                <strong>Attention :</strong> La restauration remplacera toutes vos données actuelles 
                                (catégories personnalisées et tâches) par celles de la sauvegarde.
                            </p>
                        </div>
                        
                        <div class="restore-options">
                            <button class="restore-option" onclick="window.categoriesPageV22.restoreBackup('latest')">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <h4>Dernière sauvegarde</h4>
                                    <p>Restaurer la sauvegarde la plus récente</p>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-modern danger" onclick="window.categoriesPageV22.confirmRestore()">
                            <i class="fas fa-undo"></i> Restaurer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
    }

    async restoreBackup(backupId = 'latest') {
        if (!window.backupService) {
            this.showToast('⚠️ Service de backup non disponible', 'warning');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Toutes les données actuelles seront remplacées.')) {
            this.showToast('🔄 Restauration en cours...', 'info');
            
            try {
                const success = await window.backupService.restore(backupId);
                if (success) {
                    this.closeModal();
                    this.showToast('✅ Restauration réussie !', 'success');
                    // Rafraîchir toute l'interface
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    this.showToast('❌ Aucune sauvegarde trouvée', 'error');
                }
            } catch (error) {
                console.error('[CategoriesPage] Erreur restauration:', error);
                this.showToast('❌ Erreur : ' + error.message, 'error');
            }
        }
    }

    confirmRestore() {
        this.restoreBackup('latest');
    }

    updateBackupConfig(key, value) {
        if (!window.backupService) return;
        
        const config = {};
        config[key] = value;
        
        window.backupService.updateConfig(config);
        
        // Rafraîchir l'affichage
        setTimeout(() => {
            this.refreshBackupTab();
        }, 100);
    }

    refreshBackupTab() {
        const backupContainer = document.querySelector('.backup-tab-content');
        if (backupContainer && this.currentTab === 'backup') {
            backupContainer.innerHTML = this.renderBackupTab();
        }
    }

    getProviderName(provider) {
        const providers = {
            'microsoft': 'Microsoft OneDrive',
            'google': 'Google Drive',
            'unknown': 'Non configuré'
        };
        return providers[provider] || provider;
    }

    // Actions avancées
    exportLocalBackup() {
        // À implémenter
        this.showToast('📦 Export local à venir...', 'info');
    }

    importLocalBackup() {
        // À implémenter
        this.showToast('📥 Import local à venir...', 'info');
    }

    clearAllBackups() {
        if (confirm('Êtes-vous sûr de vouloir supprimer TOUS les backups ? Cette action est irréversible.')) {
            // À implémenter
            this.showToast('🗑️ Suppression des backups...', 'info');
        }
    }

    // ================================================
    // TOUTES LES AUTRES MÉTHODES EXISTANTES
    // ================================================
    
    // Je garde toutes les méthodes existantes de la version 21.0
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
        
        this.updateCategoriesDisplay();
        this.showToast('État de la catégorie mis à jour');
    }

    togglePreselection(categoryId) {
        console.log('[CategoriesPage] 🔄 Toggle pré-sélection pour:', categoryId);
        
        const settings = this.loadSettings();
        let taskPreselectedCategories = settings.taskPreselectedCategories || [];
        
        const isPreselected = taskPreselectedCategories.includes(categoryId);
        
        if (isPreselected) {
            taskPreselectedCategories = taskPreselectedCategories.filter(id => id !== categoryId);
            console.log('[CategoriesPage] ➖ Retrait pré-sélection:', categoryId);
        } else {
            taskPreselectedCategories.push(categoryId);
            console.log('[CategoriesPage] ➕ Ajout pré-sélection:', categoryId);
        }
        
        // Sauvegarder dans les settings
        settings.taskPreselectedCategories = taskPreselectedCategories;
        this.saveSettings(settings);
        
        // SYNCHRONISATION COMPLÈTE
        this.syncTaskPreselectedCategories(taskPreselectedCategories);
        
        // Mettre à jour l'affichage
        this.updateCategoriesDisplay();
        
        // Toast avec icône appropriée
        const category = window.categoryManager?.getCategory(categoryId);
        const message = isPreselected ? 
            `☐ ${category?.name || categoryId} - Pré-sélection désactivée` : 
            `☑️ ${category?.name || categoryId} - Pré-sélection activée`;
        this.showToast(message);
    }

    syncTaskPreselectedCategories(categories) {
        console.log('[CategoriesPage] 🔄 === SYNCHRONISATION GLOBALE ===');
        console.log('[CategoriesPage] 📋 Catégories à synchroniser:', categories);
        
        // 1. CategoryManager
        if (window.categoryManager && typeof window.categoryManager.updateTaskPreselectedCategories === 'function') {
            window.categoryManager.updateTaskPreselectedCategories(categories);
            console.log('[CategoriesPage] ✅ CategoryManager synchronisé');
        }
        
        // 2. EmailScanner
        if (window.emailScanner && typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
            window.emailScanner.updateTaskPreselectedCategories(categories);
            console.log('[CategoriesPage] ✅ EmailScanner synchronisé');
        }
        
        // 3. PageManager
        if (window.pageManager && typeof window.pageManager.updateSettings === 'function') {
            window.pageManager.updateSettings({
                taskPreselectedCategories: categories
            });
            console.log('[CategoriesPage] ✅ PageManager synchronisé');
        }
        
        // 4. StartScan/MinimalScanModule
        if (window.minimalScanModule && typeof window.minimalScanModule.updateSettings === 'function') {
            window.minimalScanModule.updateSettings({
                taskPreselectedCategories: categories
            });
            console.log('[CategoriesPage] ✅ MinimalScanModule synchronisé');
        }
        
        // 5. AITaskAnalyzer
        if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
            window.aiTaskAnalyzer.updatePreselectedCategories(categories);
            console.log('[CategoriesPage] ✅ AITaskAnalyzer synchronisé');
        }
        
        // 6. Dispatcher des événements pour les autres modules
        this.dispatchSettingsChanged({
            type: 'taskPreselectedCategories',
            value: categories,
            settings: this.loadSettings()
        });
        
        console.log('[CategoriesPage] ✅ Synchronisation terminée');
    }

    dispatchSettingsChanged(detail) {
        try {
            // Événement spécifique pour les catégories
            window.dispatchEvent(new CustomEvent('categorySettingsChanged', { 
                detail: {
                    ...detail,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                }
            }));
            
            // Événement générique
            window.dispatchEvent(new CustomEvent('settingsChanged', { 
                detail: {
                    ...detail,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                }
            }));
            
            console.log('[CategoriesPage] 📨 Événements dispatched');
        } catch (error) {
            console.error('[CategoriesPage] Erreur dispatch événements:', error);
        }
    }

    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
    }

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
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern">
                    <!-- Header avec gradient -->
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">${category.icon}</span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Tabs modernes -->
                    <div class="tabs-modern">
                        <button class="tab active" data-tab="keywords" onclick="window.categoriesPageV22.switchTab('keywords')">
                            <i class="fas fa-key"></i> Mots-clés
                        </button>
                        <button class="tab" data-tab="filters" onclick="window.categoriesPageV22.switchTab('filters')">
                            <i class="fas fa-filter"></i> Filtres
                        </button>
                        ${category.isCustom ? `
                            <button class="tab" data-tab="settings" onclick="window.categoriesPageV22.switchTab('settings')">
                                <i class="fas fa-cog"></i> Paramètres
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Contenu -->
                    <div class="modal-content">
                        <!-- Tab Mots-clés -->
                        <div class="tab-panel active" id="tab-keywords">
                            <div class="keywords-main-layout">
                                <div class="keywords-left-section">
                                    <div class="keywords-grid">
                                        ${this.renderKeywordBox('absolute', 'Mots-clés absolus', keywords.absolute, '#FF6B6B', 'fa-star', 'Déclenchent toujours la catégorie')}
                                        ${this.renderKeywordBox('strong', 'Mots-clés forts', keywords.strong, '#FECA57', 'fa-bolt', 'Poids élevé dans la détection')}
                                        ${this.renderKeywordBox('weak', 'Mots-clés faibles', keywords.weak, '#54A0FF', 'fa-feather', 'Poids modéré dans la détection')}
                                        ${this.renderKeywordBox('exclusions', 'Exclusions', keywords.exclusions, '#A29BFE', 'fa-ban', 'Empêchent la détection')}
                                    </div>
                                </div>
                                <div class="keywords-right-section">
                                    <div class="filter-compact-box">
                                        <h3><i class="fas fa-filter"></i> Filtres rapides</h3>
                                        
                                        <div class="filter-compact-section">
                                            <h4><i class="fas fa-globe"></i> Domaines autorisés</h4>
                                            <div class="input-modern compact">
                                                <input type="text" id="quick-include-domain" placeholder="exemple.com">
                                                <button onclick="window.categoriesPageV22.addFilter('includeDomains')">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div class="tags compact" id="quick-includeDomains">
                                                ${filters.includeDomains.map(d => `
                                                    <span class="tag filter-tag">
                                                        ${d}
                                                        <button onclick="window.categoriesPageV22.removeFilter('includeDomains', '${d}')">×</button>
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                        
                                        <div class="filter-compact-section">
                                            <h4><i class="fas fa-ban"></i> Domaines exclus</h4>
                                            <div class="input-modern compact">
                                                <input type="text" id="quick-exclude-domain" placeholder="spam.com">
                                                <button onclick="window.categoriesPageV22.addFilter('excludeDomains')">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div class="tags compact" id="quick-excludeDomains">
                                                ${filters.excludeDomains.map(d => `
                                                    <span class="tag exclude-tag">
                                                        ${d}
                                                        <button onclick="window.categoriesPageV22.removeFilter('excludeDomains', '${d}')">×</button>
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                        
                                        <div class="filter-compact-section">
                                            <h4><i class="fas fa-at"></i> Emails autorisés</h4>
                                            <div class="input-modern compact">
                                                <input type="text" id="quick-include-email" placeholder="contact@exemple.com">
                                                <button onclick="window.categoriesPageV22.addFilter('includeEmails')">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div class="tags compact" id="quick-includeEmails">
                                                ${filters.includeEmails.map(e => `
                                                    <span class="tag filter-tag">
                                                        ${e}
                                                        <button onclick="window.categoriesPageV22.removeFilter('includeEmails', '${e}')">×</button>
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab Filtres -->
                        <div class="tab-panel" id="tab-filters">
                            ${this.renderFiltersTab(filters)}
                        </div>
                        
                        <!-- Tab Paramètres -->
                        ${category.isCustom ? `
                            <div class="tab-panel" id="tab-settings">
                                <div class="settings-content">
                                    <div class="danger-zone">
                                        <h4><i class="fas fa-exclamation-triangle"></i> Zone dangereuse</h4>
                                        <p>Cette action est irréversible</p>
                                        <button class="btn-danger" onclick="window.categoriesPageV22.deleteCategory('${categoryId}')">
                                            <i class="fas fa-trash"></i> Supprimer la catégorie
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Footer -->
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-modern primary" onclick="window.categoriesPageV22.save()">
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
                           onkeypress="if(event.key === 'Enter') window.categoriesPageV22.addKeyword('${type}', '${color}')">
                    <button style="background: ${color}" onclick="window.categoriesPageV22.addKeyword('${type}', '${color}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="tags" id="${type}-items">
                    ${keywords.map(k => `
                        <span class="tag" style="background: ${color}15; color: ${color}">
                            ${k}
                            <button onclick="window.categoriesPageV22.removeItem('${type}', '${k}')">
                                <i class="fas fa-times"></i>
                            </button>
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
                    <h3>Filtres d'inclusion</h3>
                    
                    <div class="filter-box">
                        <h4><i class="fas fa-globe"></i> Domaines autorisés</h4>
                        <p class="filter-hint">Accepter uniquement les emails de ces domaines</p>
                        <div class="input-modern">
                            <input type="text" id="include-domain" placeholder="exemple.com">
                            <button onclick="window.categoriesPageV22.addFilter('includeDomains')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="includeDomains-items">
                            ${filters.includeDomains.map(d => `
                                <span class="tag filter-tag">
                                    <i class="fas fa-globe"></i>
                                    ${d}
                                    <button onclick="window.categoriesPageV22.removeItem('includeDomains', '${d}')">
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
                            <button onclick="window.categoriesPageV22.addFilter('includeEmails')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="includeEmails-items">
                            ${filters.includeEmails.map(e => `
                                <span class="tag filter-tag">
                                    <i class="fas fa-at"></i>
                                    ${e}
                                    <button onclick="window.categoriesPageV22.removeItem('includeEmails', '${e}')">
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
                            <button onclick="window.categoriesPageV22.addFilter('excludeDomains')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="excludeDomains-items">
                            ${filters.excludeDomains.map(d => `
                                <span class="tag exclude-tag">
                                    <i class="fas fa-ban"></i>
                                    ${d}
                                    <button onclick="window.categoriesPageV22.removeItem('excludeDomains', '${d}')">
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
                            <button onclick="window.categoriesPageV22.addFilter('excludeEmails')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="excludeEmails-items">
                            ${filters.excludeEmails.map(e => `
                                <span class="tag exclude-tag">
                                    <i class="fas fa-user-slash"></i>
                                    ${e}
                                    <button onclick="window.categoriesPageV22.removeItem('excludeEmails', '${e}')">
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

    showCreateModal() {
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern modal-create">
                    <div class="create-header">
                        <h2>Nouvelle catégorie ✨</h2>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
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
                                             onclick="window.categoriesPageV22.selectIcon('${emoji}')">${emoji}</button>`
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
                                             onclick="window.categoriesPageV22.selectColor('${color}')"></button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="new-color" value="${this.colors[0]}">
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-modern primary" onclick="window.categoriesPageV22.createCategory()">
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

    // Je continue avec toutes les autres méthodes existantes...
    // (Toutes les autres méthodes de la version 21.0 restent identiques)

    calculateEmailStats() {
        const emails = window.emailScanner?.getAllEmails() || [];
        const stats = {};
        
        console.log('[CategoriesPage] 📊 Calcul statistiques emails...');
        
        emails.forEach((email, index) => {
            const cat = email.category;
            
            // Debug pour les premiers emails
            if (index < 5) {
                console.log(`[CategoriesPage] 🔍 Email ${index} stats:`, {
                    subject: email.subject?.substring(0, 30),
                    category: cat,
                    categoryType: typeof cat
                });
            }
            
            // CORRECTION CRITIQUE: Traiter tous les cas explicitement
            if (cat === null || cat === undefined || cat === '') {
                // Emails sans catégorie -> les forcer à "other"
                email.category = 'other'; // Correction directe
                stats.other = (stats.other || 0) + 1;
            } else {
                // Tous les autres emails (y compris ceux déjà marqués "other")
                stats[cat] = (stats[cat] || 0) + 1;
            }
        });
        
        console.log('[CategoriesPage] 📊 Statistiques calculées:', {
            totalCategories: Object.keys(stats).length,
            categories: stats,
            totalEmails: emails.length,
            otherCount: stats.other || 0
        });
        
        // Vérification de cohérence
        const totalCounted = Object.values(stats).reduce((sum, count) => sum + count, 0);
        if (totalCounted !== emails.length) {
            console.error(`[CategoriesPage] ❌ ERREUR COMPTAGE: ${totalCounted} comptés vs ${emails.length} emails totaux`);
        }
        
        return stats;
    }

    showOtherCategoryInfo() {
        console.log('[CategoriesPage] ℹ️ Affichage infos catégorie "Autre"');
        
        const emails = window.emailScanner?.getAllEmails() || [];
        const otherEmails = emails.filter(email => {
            const cat = email.category;
            return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
        });
        
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">📌</span>
                            <h2>Catégorie "Autre"</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="tab-panel active">
                            <div style="padding: 20px;">
                                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                                    <h3 style="margin: 0 0 12px 0; color: #475569;">
                                        <i class="fas fa-info-circle"></i> À propos de cette catégorie
                                    </h3>
                                    <p style="margin: 0; color: #64748b; line-height: 1.5;">
                                        La catégorie "Autre" contient tous les emails qui n'ont pas pu être automatiquement classés 
                                        dans une catégorie spécifique. Cela peut arriver pour des emails très courts, 
                                        inhabituels ou provenant de nouvelles sources.
                                    </p>
                                </div>
                                
                                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                                    <h4 style="margin: 0 0 16px 0; color: #374151;">
                                        📊 Statistiques (${otherEmails.length} emails)
                                    </h4>
                                    
                                    ${otherEmails.length > 0 ? `
                                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
                                            <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; text-align: center;">
                                                <div style="font-size: 24px; font-weight: 700; color: #0369a1;">${otherEmails.length}</div>
                                                <div style="font-size: 12px; color: #075985;">Total emails</div>
                                            </div>
                                            <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; text-align: center;">
                                                <div style="font-size: 24px; font-weight: 700; color: #16a34a;">${new Set(otherEmails.map(e => e.from?.emailAddress?.address?.split('@')[1])).size}</div>
                                                <div style="font-size: 12px; color: #15803d;">Domaines uniques</div>
                                            </div>
                                        </div>
                                        
                                        <h5 style="margin: 0 0 12px 0; color: #374151;">Échantillon d'emails :</h5>
                                        <div style="max-height: 200px; overflow-y: auto;">
                                            ${otherEmails.slice(0, 10).map(email => `
                                                <div style="padding: 8px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                                                    <div style="flex: 1; min-width: 0;">
                                                        <div style="font-weight: 600; font-size: 13px; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                                            ${email.subject || 'Sans sujet'}
                                                        </div>
                                                        <div style="font-size: 11px; color: #6b7280;">
                                                            ${email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu'}
                                                        </div>
                                                    </div>
                                                    <div style="font-size: 10px; color: #9ca3af; white-space: nowrap; margin-left: 8px;">
                                                        ${new Date(email.receivedDateTime).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <div style="text-align: center; padding: 40px; color: #6b7280;">
                                            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                                            <p>Aucun email non catégorisé !</p>
                                            <p style="font-size: 14px;">Tous vos emails ont été correctement classés.</p>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.closeModal()">
                            Fermer
                        </button>
                        ${otherEmails.length > 0 ? `
                            <button class="btn-modern primary" onclick="window.categoriesPageV22.closeModal(); window.pageManager?.filterByCategory('other');">
                                <i class="fas fa-eye"></i> Voir ces emails
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
    }

    toggleOtherCategory() {
        console.log('[CategoriesPage] 🔄 Toggle catégorie "Autre"');
        
        // La catégorie "Autre" est toujours visible car elle représente les emails non catégorisés
        this.showToast('ℹ️ La catégorie "Autre" est toujours visible', 'info');
    }

    getCategoryStats(categoryId) {
        if (categoryId === 'other') {
            // Stats spéciales pour la catégorie "Autre"
            const emails = window.emailScanner?.getAllEmails() || [];
            const otherEmails = emails.filter(email => {
                const cat = email.category;
                return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
            });
            
            return {
                keywords: 0, // La catégorie "Autre" n'a pas de mots-clés
                absolute: 0,
                emailCount: otherEmails.length
            };
        }
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        return {
            keywords: keywords.absolute.length + keywords.strong.length + 
                     keywords.weak.length + keywords.exclusions.length,
            absolute: keywords.absolute.length,
            emailCount: this.getCategoryEmailCount(categoryId)
        };
    }

    getCategoryEmailCount(categoryId) {
        const emails = window.emailScanner?.getAllEmails() || [];
        
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
            // Si activeCategories est null, toutes les catégories sont actives + "Autre"
            const allCategoriesCount = Object.keys(categories).length;
            const hasOtherEmails = this.getCategoryEmailCount('other') > 0;
            return allCategoriesCount + (hasOtherEmails ? 1 : 0);
        }
        
        // Compter les catégories actives qui existent
        const activeCategoriesCount = activeCategories.filter(id => categories[id]).length;
        
        // Ajouter "Autre" si elle est active et a des emails
        const otherIsActive = activeCategories.includes('other');
        const hasOtherEmails = this.getCategoryEmailCount('other') > 0;
        
        return activeCategoriesCount + (otherIsActive && hasOtherEmails ? 1 : 0);
    }

    getTotalKeywords(categories) {
        let total = 0;
        
        // Compter les mots-clés de toutes les catégories (sauf "Autre")
        Object.keys(categories).forEach(id => {
            if (id !== 'other') {
                const stats = this.getCategoryStats(id);
                total += stats.keywords;
            }
        });
        
        // La catégorie "Autre" n'a pas de mots-clés par définition
        return total;
    }

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
                <button onclick="window.categoriesPageV22.removeItem('${type}', '${value}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `);
        
        input.value = '';
        input.focus();
    }

    addFilter(type) {
        let inputId;
        if (type.includes('Domain')) {
            inputId = document.getElementById('quick-include-domain') ? 'quick-include-domain' : 
                     (type.includes('exclude') ? 'exclude-domain' : 'include-domain');
        } else {
            inputId = document.getElementById('quick-include-email') ? 'quick-include-email' :
                     (type.includes('exclude') ? 'exclude-email' : 'include-email');
        }
        
        const input = document.getElementById(inputId);
        if (!input?.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        
        const containers = [
            document.getElementById(`${type}-items`),
            document.getElementById(`quick-${type}`)
        ].filter(Boolean);
        
        const isExclude = type.includes('exclude');
        const icon = type.includes('Domain') ? 
            (isExclude ? 'ban' : 'globe') : 
            (isExclude ? 'user-slash' : 'at');
        
        containers.forEach(container => {
            if (!container.querySelector(`[data-value="${value}"]`)) {
                container.insertAdjacentHTML('beforeend', `
                    <span class="tag ${isExclude ? 'exclude-tag' : 'filter-tag'}" data-value="${value}">
                        ${type.includes('Domain') || type.includes('Email') ? '' : `<i class="fas fa-${icon}"></i>`}
                        ${value}
                        <button onclick="window.categoriesPageV22.removeFilter('${type}', '${value}')">×</button>
                    </span>
                `);
            }
        });
        
        input.value = '';
        input.focus();
    }
    
    removeFilter(type, value) {
        const containers = [
            document.getElementById(`${type}-items`),
            document.getElementById(`quick-${type}`)
        ].filter(Boolean);
        
        containers.forEach(container => {
            const tags = container.querySelectorAll('.tag');
            tags.forEach(tag => {
                if (tag.getAttribute('data-value') === value || 
                    tag.textContent.trim().replace('×', '').trim() === value) {
                    tag.remove();
                }
            });
        });
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
                        document.querySelector('.content') ||
                        document.getElementById('pageContent');
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



    // ================================================
    // STYLES CSS ÉTENDUS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesModernStylesV22')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesModernStylesV22';
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
            
            /* Onglets principaux - Style deux onglets */
            .main-tabs-container {
                margin-bottom: 24px;
            }
            
            .main-tabs-two {
                display: flex;
                gap: 8px;
                background: #f8fafc;
                padding: 4px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
                max-width: 600px;
            }
            
            .main-tab {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 24px;
                background: transparent;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                color: #6B7280;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            }
            
            .main-tab::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .main-tab:hover {
                background: rgba(255, 255, 255, 0.5);
                color: #374151;
                transform: translateY(-1px);
            }
            
            .main-tab.active {
                background: white;
                color: var(--primary);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transform: translateY(-1px);
            }
            
            .main-tab i {
                font-size: 18px;
            }
            
            .tab-pane {
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .tab-pane.active {
                display: block;
                opacity: 1;
            }
            
            /* Section header */
            .section-header {
                margin-bottom: 24px;
            }
            
            .section-header h2 {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .section-header p {
                font-size: 14px;
                color: var(--text-secondary);
                margin: 4px 0 0 0;
            }
            
            /* Bouton créer en haut */
            .btn-create-top {
                position: absolute;
                top: 0;
                right: 0;
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
            
            .btn-create-top:hover {
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
                grid-template-columns: repeat(6, minmax(0, 1fr));
                gap: 10px;
                padding: 0;
            }
            
            /* Carte de catégorie */
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
            
            .meta-emails {
                font-size: 12px;
                color: #3b82f6;
                font-weight: 600;
            }
            
            .meta-star {
                font-size: 12px;
                color: #F59E0B;
                font-weight: 600;
            }
            
            .card-actions {
                display: grid;
                grid-template-columns: repeat(3, 32px);
                gap: 3px;
                justify-content: start;
                margin-top: auto;
            }
            
            /* Boutons minimalistes */
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
            
            .btn-minimal.task:not(.selected):hover {
                color: var(--primary);
                border-color: var(--primary);
            }
            
            .btn-minimal.config {
                color: #6B7280;
            }
            
            .btn-minimal.config:hover {
                color: var(--text);
                border-color: var(--text);
            }
            
            /* Styles pour l'onglet backup */
            .backup-tab-content {
                display: flex;
                flex-direction: column;
                gap: 24px;
                max-width: 1000px;
            }
            
            .backup-status-card {
                background: white;
                border-radius: 16px;
                padding: 24px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .status-header {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .status-icon {
                width: 64px;
                height: 64px;
                background: #f3f4f6;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: #9ca3af;
                transition: all 0.3s;
            }
            
            .status-icon.active {
                background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }
            
            .status-info h3 {
                margin: 0 0 8px 0;
                font-size: 20px;
                color: #1f2937;
            }
            
            .status-text {
                margin: 0 0 8px 0;
                color: #6b7280;
                font-size: 15px;
            }
            
            .last-backup {
                margin: 0;
                color: #9ca3af;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .backup-quick-actions {
                display: flex;
                gap: 12px;
            }
            
            .btn-backup-action {
                padding: 12px 20px;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s;
            }
            
            .btn-backup-action.primary {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-backup-action.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }
            
            .btn-backup-action.secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
            }
            
            .btn-backup-action.secondary:hover {
                background: #e5e7eb;
                transform: translateY(-1px);
            }
            
            .backup-config-section,
            .backup-data-section,
            .backup-info-section,
            .backup-advanced-section {
                background: white;
                border-radius: 16px;
                padding: 24px;
                border: 1px solid #e5e7eb;
            }
            
            .backup-config-section h3,
            .backup-data-section h3,
            .backup-advanced-section h3 {
                margin: 0 0 20px 0;
                font-size: 18px;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .config-group {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .config-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
            }
            
            .toggle-label {
                display: flex;
                align-items: center;
                cursor: pointer;
                position: relative;
            }
            
            .toggle-label input[type="checkbox"] {
                position: absolute;
                opacity: 0;
            }
            
            .toggle-slider {
                width: 48px;
                height: 24px;
                background: #e5e7eb;
                border-radius: 12px;
                margin-right: 12px;
                position: relative;
                transition: background 0.3s;
            }
            
            .toggle-slider::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .toggle-label input:checked + .toggle-slider {
                background: #10b981;
            }
            
            .toggle-label input:checked + .toggle-slider::after {
                transform: translateX(24px);
            }
            
            .toggle-label input:disabled + .toggle-slider {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .toggle-text {
                font-size: 15px;
                font-weight: 500;
                color: #374151;
            }
            
            .config-label {
                font-size: 15px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 8px;
                display: block;
            }
            
            .config-select {
                padding: 10px 16px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                color: #374151;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 150px;
            }
            
            .config-select:hover {
                border-color: #cbd5e1;
            }
            
            .config-select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .config-select:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .data-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                font-size: 15px;
                color: #374151;
            }
            
            .checkbox-label input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            
            .info-card {
                background: #f0f9ff;
                border: 1px solid #0ea5e9;
                border-radius: 12px;
                padding: 20px;
                display: flex;
                gap: 16px;
                align-items: flex-start;
            }
            
            .info-card i {
                font-size: 24px;
                color: #0ea5e9;
                flex-shrink: 0;
            }
            
            .info-content {
                flex: 1;
            }
            
            .info-content p {
                margin: 0 0 8px 0;
                color: #0c4a6e;
                font-size: 14px;
            }
            
            .info-content code {
                display: block;
                background: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-family: monospace;
                font-size: 13px;
                color: #1f2937;
                margin: 8px 0;
            }
            
            .folder-path-container {
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 8px 0;
            }
            
            .folder-path-container code {
                flex: 1;
                margin: 0;
            }
            
            .btn-select-folder {
                padding: 8px 16px;
                background: white;
                border: 1px solid #0ea5e9;
                border-radius: 8px;
                color: #0369a1;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
                white-space: nowrap;
            }
            
            .btn-select-folder:hover {
                background: #e0f2fe;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.2);
            }
            
            .info-provider {
                margin-top: 12px !important;
                font-size: 13px !important;
            }
            
            /* Modal de sélection de dossier */
            .modal-folder {
                max-width: 600px;
            }
            
            .folder-selection-content {
                padding: 20px;
            }
            
            .current-folder-info {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
            }
            
            .current-folder-info p {
                margin: 0 0 8px 0;
                font-weight: 600;
                color: #374151;
            }
            
            .current-path {
                font-family: monospace;
                font-size: 14px;
                color: #1f2937;
                background: white;
                padding: 8px 12px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
            }
            
            .folder-suggestions h4,
            .custom-folder-section h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: #1f2937;
            }
            
            .folder-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 24px;
            }
            
            .folder-option {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 16px;
                text-align: left;
                width: 100%;
            }
            
            .folder-option:hover {
                background: #f9fafb;
                border-color: #3b82f6;
                transform: translateX(4px);
            }
            
            .folder-option i {
                font-size: 24px;
                color: #f59e0b;
                flex-shrink: 0;
            }
            
            .folder-name {
                font-family: monospace;
                font-size: 14px;
                color: #1f2937;
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .folder-desc {
                font-size: 12px;
                color: #6b7280;
            }
            
            .custom-folder-input {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .custom-folder-input input {
                flex: 1;
                padding: 10px 16px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                font-family: monospace;
            }
            
            .custom-folder-input input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .btn-apply-custom {
                padding: 10px 20px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .btn-apply-custom:hover {
                background: #2563eb;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            }
            
            .folder-hint {
                margin: 0;
                font-size: 12px;
                color: #6b7280;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .folder-hint i {
                color: #3b82f6;
            }
            
            .advanced-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }
            
            .btn-advanced {
                padding: 12px 20px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .btn-advanced:hover {
                background: #f9fafb;
                border-color: #3b82f6;
                color: #2563eb;
                transform: translateY(-1px);
            }
            
            .btn-advanced.danger {
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-advanced.danger:hover {
                background: #fef2f2;
                border-color: #f87171;
            }
            
            /* Modal moderne */
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
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-modern {
                background: #FFFFFF;
                border-radius: 24px;
                width: 100%;
                max-width: 900px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
                animation: slideUp 0.3s;
                border: 2px solid var(--border);
                overflow: hidden;
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-create {
                max-width: 480px;
            }
            
            .modal-restore {
                max-width: 500px;
            }
            
            /* Modal header */
            .modal-header,
            .create-header {
                padding: 28px;
                border-bottom: 2px solid #D1D5DB;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #FFFFFF;
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
            
            /* Modal content */
            .modal-content {
                padding: 0;
                overflow-y: auto;
                flex: 1;
                background: #E8EAED;
                position: relative;
            }
            
            .create-content {
                padding: 28px;
                overflow-y: auto;
                flex: 1;
                background: #FFFFFF;
            }
            
            /* Tab panel */
            .tab-panel {
                display: none;
                background: #E8EAED;
                min-height: 400px;
                padding: 24px;
            }
            
            .tab-panel.active {
                display: block;
            }
            
            /* Autres styles existants... */
            /* (Je n'inclus pas tous les styles de la modal et autres pour économiser de l'espace) */
            
            /* Modal footer */
            .modal-footer {
                padding: 24px 28px;
                border-top: 2px solid #D1D5DB;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                background: #FFFFFF;
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
            
            .btn-modern.danger {
                background: #ef4444;
                color: white;
            }
            
            .btn-modern.danger:hover {
                background: #dc2626;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }
            
            /* Restore warning */
            .restore-warning {
                background: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                gap: 12px;
                align-items: flex-start;
                margin-bottom: 24px;
            }
            
            .restore-warning i {
                color: #f59e0b;
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .restore-warning p {
                margin: 0;
                font-size: 14px;
                color: #92400e;
                line-height: 1.5;
            }
            
            .restore-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .restore-option {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                gap: 16px;
                align-items: center;
                text-align: left;
            }
            
            .restore-option:hover {
                background: white;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            
            .restore-option i {
                font-size: 24px;
                color: #6b7280;
            }
            
            .restore-option h4 {
                margin: 0 0 4px 0;
                font-size: 16px;
                color: #1f2937;
            }
            
            .restore-option p {
                margin: 0;
                font-size: 13px;
                color: #6b7280;
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
            
            .toast-modern.info {
                background: #3b82f6;
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
            
            /* Responsive */
            @media (max-width: 1200px) {
                .categories-grid {
                    grid-template-columns: repeat(4, minmax(0, 1fr));
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
                
                .main-tab span {
                    display: none;
                }
                
                .backup-quick-actions {
                    flex-direction: column;
                }
                
                .btn-backup-action {
                    width: 100%;
                    justify-content: center;
                }
                
                .advanced-actions {
                    grid-template-columns: 1fr;
                }
                
                .config-item {
                    flex-direction: column;
                    align-items: stretch;
                }
            }
            
            @media (max-width: 480px) {
                .header-content h1 {
                    font-size: 24px;
                }
                
                .cat-name {
                    font-size: 14px;
                }
                
                .btn-minimal {
                    font-size: 10px;
                    padding: 4px 8px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INTÉGRATION GLOBALE
// ================================================

// Créer l'instance avec un nom unique
window.categoriesPageV22 = new CategoriesPageV22();

// Créer un alias pour maintenir la compatibilité
window.categoriesPage = window.categoriesPageV22;

// Intégration avec PageManager
if (window.pageManager?.pages) {
    // Pour la page settings/paramètres
    window.pageManager.pages.settings = (container) => {
        window.categoriesPageV22.render(container);
    };
    
    // Pour la page categories si elle existe
    window.pageManager.pages.categories = (container) => {
        window.categoriesPageV22.render(container);
    };
}

// S'assurer que StartScan peut accéder aux catégories pré-sélectionnées
if (!window.categoriesPage.getTaskPreselectedCategories) {
    window.categoriesPage.getTaskPreselectedCategories = function() {
        return window.categoriesPageV22.getTaskPreselectedCategories();
    };
}

console.log('[CategoriesPage] ✅ CategoriesPage v22.0 chargée - Avec 2 onglets : Catégories et Sauvegarde!');
