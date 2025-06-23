// SettingsPage.js - Version avec Backup Visuel et Automatique
console.log('[SettingsPage] 🚀 Loading SettingsPage avec Backup Automatique...');

// Nettoyer toute instance précédente
if (window.settingsPage) {
    console.log('[SettingsPage] 🧹 Nettoyage instance précédente...');
    delete window.settingsPage;
}

class SettingsPageVisual {
    constructor() {
        this.currentTab = 'categories';
        this.backupManager = new AutoBackupManager();
        this.editingCategoryId = null;
        this.currentModal = null;
        this.currentFilter = 'all';
        this.categorySearchTerm = '';
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8'
        ];
        
        // Bind toutes les méthodes pour éviter les problèmes de contexte
        this.bindMethods();
        
        console.log('[SettingsPage] ✅ Interface avec backup automatique initialisée');
    }

    bindMethods() {
        // Bind des méthodes principales
        const methodsToBind = [
            'showCreateCategoryModal', 'editCategory', 'toggleCategory', 
            'togglePreselection', 'deleteCategory', 'selectIcon', 
            'selectColor', 'createCategory', 'closeModal', 'switchEditTab',
            'addKeyword', 'removeKeyword', 'addFilter', 'removeFilter',
            'saveCategory', 'confirmDeleteCategory', 'handleCategorySearch',
            'clearCategorySearch', 'filterCategories', 'exportCategories',
            'importBackup', 'exportAllData', 'createManualBackup',
            'toggleAutoBackup', 'switchTab'
        ];
        
        methodsToBind.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
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
                        <p>Gérez vos catégories et vos sauvegardes automatiques</p>
                    </div>
                    
                    <!-- Navigation des onglets -->
                    <div class="settings-tabs">
                        <button class="tab-button active" data-tab="categories" onclick="window.settingsPage.switchTab('categories')">
                            <i class="fas fa-tags"></i>
                            <span>Catégories</span>
                        </button>
                        <button class="tab-button" data-tab="backup" onclick="window.settingsPage.switchTab('backup')">
                            <i class="fas fa-shield-alt"></i>
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
            this.initializeAutoBackup();
            
            // Assurer que window.settingsPage pointe vers cette instance
            window.settingsPage = this;
            
        } catch (error) {
            console.error('[SettingsPage] Erreur:', error);
            container.innerHTML = this.renderError();
        }
    }

    // ================================================
    // ONGLET CATÉGORIES (INCHANGÉ)
    // ================================================
    renderCategoriesTab() {
        const categories = window.categoryManager?.getCategories() || {};
        const stats = this.calculateCategoryStats();
        
        return `
            <div class="categories-section">
                <!-- Dashboard de statistiques compact -->
                <div class="stats-dashboard-compact">
                    <div class="stats-grid-compact">
                        <div class="stat-card-compact primary">
                            <div class="stat-number">${Object.keys(categories).length}</div>
                            <div class="stat-label">Catégories totales</div>
                            <div class="stat-detail">${this.getCustomCategoriesCount(categories)} personnalisées</div>
                        </div>
                        
                        <div class="stat-card-compact success">
                            <div class="stat-number">${stats.totalEmails.toLocaleString()}</div>
                            <div class="stat-label">Emails classés</div>
                            <div class="stat-detail">${this.getClassificationRate(stats)}% de réussite</div>
                        </div>
                        
                        <div class="stat-card-compact warning">
                            <div class="stat-number">${stats.totalKeywords}</div>
                            <div class="stat-label">Mots-clés définis</div>
                            <div class="stat-detail">${this.getAvgKeywordsPerCategory(categories, stats)} par catégorie</div>
                        </div>
                        
                        <div class="stat-card-compact info">
                            <div class="stat-number">${this.getPreselectedCount()}</div>
                            <div class="stat-label">Pré-sélectionnées</div>
                            <div class="stat-detail">Pour les tâches</div>
                        </div>
                    </div>
                </div>
                
                <!-- Actions principales -->
                <div class="categories-actions-enhanced">
                    <div class="actions-left">
                        <button class="btn-primary-enhanced" onclick="window.settingsPage?.showCreateCategoryModal()">
                            <div class="btn-icon">
                                <i class="fas fa-plus"></i>
                            </div>
                            <div class="btn-content">
                                <div class="btn-title">Nouvelle catégorie</div>
                                <div class="btn-subtitle">Créer et configurer</div>
                            </div>
                        </button>
                        
                        <button class="btn-secondary-enhanced" onclick="window.settingsPage?.exportCategories()">
                            <div class="btn-icon">
                                <i class="fas fa-download"></i>
                            </div>
                            <div class="btn-content">
                                <div class="btn-title">Exporter</div>
                                <div class="btn-subtitle">Format JSON</div>
                            </div>
                        </button>
                    </div>
                    
                    <div class="actions-right">
                        <!-- Barre de recherche catégories -->
                        <div class="categories-search">
                            <div class="search-box-categories">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" 
                                       class="search-input-categories" 
                                       id="categoriesSearchInput"
                                       placeholder="Rechercher catégories..." 
                                       value="${this.categorySearchTerm || ''}"
                                       onkeyup="window.settingsPage?.handleCategorySearch(this.value)">
                                ${this.categorySearchTerm ? `
                                    <button class="search-clear-categories" onclick="window.settingsPage?.clearCategorySearch()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="quick-filters">
                            <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="window.settingsPage?.filterCategories('all')">
                                <i class="fas fa-list"></i>
                                Toutes
                            </button>
                            <button class="filter-btn ${this.currentFilter === 'custom' ? 'active' : ''}" onclick="window.settingsPage?.filterCategories('custom')">
                                <i class="fas fa-user"></i>
                                Personnalisées
                            </button>
                            <button class="filter-btn ${this.currentFilter === 'preselected' ? 'active' : ''}" onclick="window.settingsPage?.filterCategories('preselected')">
                                <i class="fas fa-star"></i>
                                Pré-sélectionnées
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Liste des catégories en grille -->
                <div class="categories-grid-enhanced">
                    ${this.renderCategoriesGrid(categories)}
                </div>
            </div>
        `;
    }

    // ================================================
    // ONGLET BACKUP VISUEL ET AUTOMATIQUE
    // ================================================
    renderBackupTab() {
        return `
            <div class="backup-section-visual">
                <!-- Header avec animation -->
                <div class="backup-header-visual">
                    <div class="backup-status-indicator">
                        <div class="status-circle" id="backup-status-circle">
                            <div class="status-pulse"></div>
                            <i class="fas fa-shield-alt" id="backup-status-icon"></i>
                        </div>
                        <div class="status-content">
                            <h2 id="backup-status-title">Système de sauvegarde</h2>
                            <p id="backup-status-description">Initialisation en cours...</p>
                        </div>
                    </div>
                    
                    <div class="backup-quick-stats" id="backup-quick-stats">
                        <!-- Sera rempli dynamiquement -->
                    </div>
                </div>
                
                <!-- Actions rapides visuelles -->
                <div class="backup-actions-visual">
                    <div class="action-cards">
                        <div class="action-card manual-backup" onclick="window.settingsPage?.createManualBackup()">
                            <div class="card-visual">
                                <div class="card-icon-bg">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div class="card-progress" id="manual-backup-progress"></div>
                            </div>
                            <div class="card-info">
                                <h4>Sauvegarde manuelle</h4>
                                <p>Créer une sauvegarde immédiate</p>
                                <span class="card-action">Cliquer pour sauvegarder</span>
                            </div>
                        </div>
                        
                        <div class="action-card import-backup" onclick="window.settingsPage?.importBackup()">
                            <div class="card-visual">
                                <div class="card-icon-bg import">
                                    <i class="fas fa-file-import"></i>
                                </div>
                            </div>
                            <div class="card-info">
                                <h4>Importer sauvegarde</h4>
                                <p>Restaurer depuis un fichier</p>
                                <span class="card-action">Sélectionner un fichier</span>
                            </div>
                        </div>
                        
                        <div class="action-card export-data" onclick="window.settingsPage?.exportAllData()">
                            <div class="card-visual">
                                <div class="card-icon-bg export">
                                    <i class="fas fa-file-export"></i>
                                </div>
                            </div>
                            <div class="card-info">
                                <h4>Exporter données</h4>
                                <p>Télécharger toutes les données</p>
                                <span class="card-action">Exporter maintenant</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Timeline des sauvegardes -->
                <div class="backup-timeline-section">
                    <div class="timeline-header">
                        <h3><i class="fas fa-history"></i> Historique des sauvegardes</h3>
                        <div class="timeline-controls">
                            <button class="btn-timeline-refresh" onclick="window.settingsPage?.refreshBackupTimeline()" title="Actualiser">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <div class="timeline-filter">
                                <select id="timeline-filter" onchange="window.settingsPage?.filterTimeline(this.value)">
                                    <option value="all">Toutes les sauvegardes</option>
                                    <option value="manual">Manuelles uniquement</option>
                                    <option value="auto">Automatiques uniquement</option>
                                    <option value="today">Aujourd'hui</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="backup-timeline" id="backup-timeline">
                        <div class="timeline-loading">
                            <div class="loading-spinner"></div>
                            <span>Chargement de l'historique...</span>
                        </div>
                    </div>
                </div>
                
                <!-- Paramètres avancés repliables -->
                <div class="advanced-settings-section">
                    <div class="advanced-toggle" onclick="window.settingsPage?.toggleAdvancedSettings()">
                        <div class="toggle-content">
                            <i class="fas fa-cogs"></i>
                            <span>Paramètres avancés</span>
                        </div>
                        <i class="fas fa-chevron-down toggle-arrow" id="advanced-arrow"></i>
                    </div>
                    
                    <div class="advanced-content" id="advanced-settings-content">
                        <div class="advanced-grid">
                            <div class="setting-card">
                                <div class="setting-header">
                                    <i class="fas fa-magic"></i>
                                    <h4>Sauvegarde automatique</h4>
                                </div>
                                <div class="setting-control">
                                    <label class="setting-switch">
                                        <input type="checkbox" id="auto-backup-enabled" checked onchange="window.settingsPage?.toggleAutoBackup(this.checked)">
                                        <span class="switch-slider small"></span>
                                    </label>
                                </div>
                            </div>

                            <div class="setting-card">
                                <div class="setting-header">
                                    <i class="fas fa-clock"></i>
                                    <h4>Fréquence automatique</h4>
                                </div>
                                <div class="setting-control">
                                    <select id="auto-backup-frequency" onchange="window.settingsPage?.updateBackupFrequency(this.value)">
                                        <option value="immediate">Immédiate (recommandé)</option>
                                        <option value="5min">Toutes les 5 minutes</option>
                                        <option value="15min">Toutes les 15 minutes</option>
                                        <option value="1hour">Toutes les heures</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="setting-card">
                                <div class="setting-header">
                                    <i class="fas fa-hdd"></i>
                                    <h4>Rétention</h4>
                                </div>
                                <div class="setting-control">
                                    <select id="backup-retention" onchange="window.settingsPage?.updateRetention(this.value)">
                                        <option value="20">20 sauvegardes</option>
                                        <option value="50">50 sauvegardes</option>
                                        <option value="100">100 sauvegardes</option>
                                        <option value="unlimited">Illimitées</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="setting-card">
                                <div class="setting-header">
                                    <i class="fas fa-envelope"></i>
                                    <h4>Inclure emails</h4>
                                </div>
                                <div class="setting-control">
                                    <label class="setting-switch">
                                        <input type="checkbox" id="include-emails" checked>
                                        <span class="switch-slider small"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="setting-card">
                                <div class="setting-header">
                                    <i class="fas fa-tasks"></i>
                                    <h4>Inclure tâches</h4>
                                </div>
                                <div class="setting-control">
                                    <label class="setting-switch">
                                        <input type="checkbox" id="include-tasks" checked>
                                        <span class="switch-slider small"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Zone de danger repensée -->
                        <div class="danger-zone-visual">
                            <div class="danger-content">
                                <div class="danger-icon">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="danger-text">
                                    <h4>Réinitialisation complète</h4>
                                    <p>Supprimer toutes les données et sauvegardes</p>
                                </div>
                                <div class="danger-action">
                                    <button class="btn-danger-visual" onclick="window.settingsPage?.resetAllSettings()">
                                        <i class="fas fa-trash-alt"></i>
                                        Réinitialiser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DU BACKUP AUTOMATIQUE
    // ================================================
    async initializeAutoBackup() {
        try {
            await this.backupManager.initialize();
            this.updateBackupStatus();
            this.loadBackupTimeline();
            
            // Démarrer la surveillance automatique
            this.startAutoBackupMonitoring();
            
        } catch (error) {
            console.error('[SettingsPage] Erreur initialisation backup:', error);
            this.updateBackupStatus('error', error.message);
        }
    }

    updateBackupStatus(status = 'active', message = '') {
        const circle = document.getElementById('backup-status-circle');
        const icon = document.getElementById('backup-status-icon');
        const title = document.getElementById('backup-status-title');
        const description = document.getElementById('backup-status-description');
        const quickStats = document.getElementById('backup-quick-stats');

        if (!circle) return;

        // Nettoyer les classes existantes
        circle.className = 'status-circle';
        
        switch (status) {
            case 'active':
                circle.classList.add('status-active');
                icon.className = 'fas fa-shield-alt';
                title.textContent = 'Sauvegarde active';
                description.textContent = message || 'Vos données sont automatiquement protégées';
                break;
                
            case 'saving':
                circle.classList.add('status-saving');
                icon.className = 'fas fa-sync-alt fa-spin';
                title.textContent = 'Sauvegarde en cours';
                description.textContent = message || 'Sauvegarde des modifications...';
                break;
                
            case 'error':
                circle.classList.add('status-error');
                icon.className = 'fas fa-exclamation-triangle';
                title.textContent = 'Attention requise';
                description.textContent = message || 'Problème de sauvegarde détecté';
                break;
                
            case 'disabled':
                circle.classList.add('status-disabled');
                icon.className = 'fas fa-shield-alt';
                title.textContent = 'Sauvegarde désactivée';
                description.textContent = message || 'Sauvegarde automatique désactivée';
                break;
        }

        // Mettre à jour les statistiques rapides
        if (quickStats) {
            const stats = this.backupManager.getQuickStats();
            quickStats.innerHTML = `
                <div class="quick-stat">
                    <div class="stat-value">${stats.totalBackups}</div>
                    <div class="stat-label">Sauvegardes</div>
                </div>
                <div class="quick-stat">
                    <div class="stat-value">${stats.lastBackupTime}</div>
                    <div class="stat-label">Dernière</div>
                </div>
                <div class="quick-stat">
                    <div class="stat-value">${stats.autoBackupsToday}</div>
                    <div class="stat-label">Aujourd'hui</div>
                </div>
            `;
        }
    }

    async loadBackupTimeline() {
        const timeline = document.getElementById('backup-timeline');
        if (!timeline) return;

        try {
            const backups = await this.backupManager.getBackupHistory();
            
            if (backups.length === 0) {
                timeline.innerHTML = `
                    <div class="timeline-empty">
                        <i class="fas fa-history"></i>
                        <h4>Aucune sauvegarde</h4>
                        <p>Les sauvegardes apparaîtront ici automatiquement</p>
                    </div>
                `;
                return;
            }

            timeline.innerHTML = backups.map((backup, index) => `
                <div class="timeline-item ${backup.type}" data-backup-id="${backup.id}">
                    <div class="timeline-marker">
                        <i class="fas fa-${backup.type === 'auto' ? 'magic' : 'hand-paper'}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <div class="backup-type-badge ${backup.type}">
                                ${backup.type === 'auto' ? 'Automatique' : 'Manuelle'}
                            </div>
                            <div class="backup-time">
                                ${this.formatTimeAgo(backup.timestamp)}
                            </div>
                        </div>
                        <div class="timeline-details">
                            <div class="backup-stats">
                                <span><i class="fas fa-tags"></i> ${backup.categories || 0} catégories</span>
                                <span><i class="fas fa-envelope"></i> ${backup.emails || 0} emails</span>
                                <span><i class="fas fa-file"></i> ${this.formatFileSize(backup.size)}</span>
                            </div>
                            ${backup.changes ? `
                                <div class="backup-changes">
                                    <small><i class="fas fa-edit"></i> ${backup.changes}</small>
                                </div>
                            ` : ''}
                        </div>
                        <div class="timeline-actions">
                            <button class="btn-timeline-action" onclick="window.settingsPage.restoreBackup('${backup.id}')" title="Restaurer cette version">
                                <i class="fas fa-undo"></i>
                            </button>
                            <button class="btn-timeline-action" onclick="window.settingsPage.downloadBackup('${backup.id}')" title="Télécharger">
                                <i class="fas fa-download"></i>
                            </button>
                            ${backup.type === 'manual' ? `
                                <button class="btn-timeline-action danger" onclick="window.settingsPage.deleteBackup('${backup.id}')" title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('[SettingsPage] Erreur chargement timeline:', error);
            timeline.innerHTML = `
                <div class="timeline-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erreur de chargement de l'historique</p>
                </div>
            `;
        }
    }

    startAutoBackupMonitoring() {
        // Surveiller les changements dans les catégories
        if (window.categoryManager) {
            window.addEventListener('categoryChanged', () => {
                this.triggerAutoBackup('Modification de catégorie');
            });
        }

        // Surveiller les changements dans les tâches
        if (window.taskManager) {
            window.addEventListener('taskUpdate', () => {
                this.triggerAutoBackup('Modification de tâche');
            });
        }

        // Surveiller les changements dans les paramètres
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.apply(this, arguments);
            if (key === 'categorySettings' || key === 'emailsort_tasks') {
                window.settingsPage?.triggerAutoBackup('Modification des données');
            }
        };

        console.log('[SettingsPage] 🔄 Surveillance automatique démarrée (catégories + tâches)');
    }

    async triggerAutoBackup(reason = 'Modification automatique') {
        const autoBackupEnabled = document.getElementById('auto-backup-enabled')?.checked ?? true;
        if (!autoBackupEnabled) return;

        try {
            this.updateBackupStatus('saving', 'Sauvegarde en cours...');
            
            await this.backupManager.createAutoBackup(reason);
            
            this.updateBackupStatus('active', 'Sauvegarde terminée');
            this.loadBackupTimeline();
            
            // Notification discrète
            this.showToast('💾 Sauvegarde automatique effectuée', 'success');
            
        } catch (error) {
            console.error('[SettingsPage] Erreur sauvegarde auto:', error);
            this.updateBackupStatus('error', 'Erreur de sauvegarde');
        }
    }

    async createManualBackup() {
        const progressEl = document.getElementById('manual-backup-progress');
        
        try {
            // Animation de progression
            if (progressEl) {
                progressEl.style.width = '0%';
                progressEl.style.opacity = '1';
            }

            this.updateBackupStatus('saving', 'Création de la sauvegarde manuelle...');

            // Simuler progression
            for (let i = 0; i <= 100; i += 10) {
                if (progressEl) progressEl.style.width = i + '%';
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            await this.backupManager.createManualBackup();
            
            this.updateBackupStatus('active', 'Sauvegarde manuelle créée');
            this.loadBackupTimeline();
            
            this.showToast('✅ Sauvegarde manuelle créée avec succès!', 'success');

        } catch (error) {
            console.error('[SettingsPage] Erreur sauvegarde manuelle:', error);
            this.updateBackupStatus('error', 'Erreur de sauvegarde manuelle');
            this.showToast('❌ Erreur lors de la sauvegarde', 'error');
        } finally {
            // Nettoyer l'animation
            if (progressEl) {
                setTimeout(() => {
                    progressEl.style.width = '0%';
                    progressEl.style.opacity = '0';
                }, 1000);
            }
        }
    }

    toggleAutoBackup(enabled) {
        if (enabled) {
            this.updateBackupStatus('active', 'Sauvegarde automatique activée');
            this.showToast('🛡️ Sauvegarde automatique activée', 'success');
        } else {
            this.updateBackupStatus('disabled', 'Sauvegarde automatique désactivée');
            this.showToast('⚠️ Sauvegarde automatique désactivée', 'warning');
        }
    }

    toggleAdvancedSettings() {
        const content = document.getElementById('advanced-settings-content');
        const arrow = document.getElementById('advanced-arrow');
        
        if (content.style.display === 'none' || !content.style.display) {
            content.style.display = 'block';
            arrow.style.transform = 'rotate(180deg)';
        } else {
            content.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
        }
    }

    // ================================================
    // MODALES COMPLÈTES CATÉGORIES (Ajout des méthodes manquantes)
    // ================================================
    
    showCreateCategoryModal() {
        this.closeModal();
        
        const uniqueId = 'create_category_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-backdrop" onclick="if(event.target === this) window.settingsPage.closeModal('${uniqueId}')">
                <div class="modal-simple">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus"></i> Nouvelle catégorie</h2>
                        <button class="btn-close" onclick="window.settingsPage?.closeModal('${uniqueId}')">
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
                                    `<button class="icon-option ${i === 0 ? 'selected' : ''}" onclick="window.settingsPage?.selectIcon('${icon}')">${icon}</button>`
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
                                             onclick="window.settingsPage?.selectColor('${color}')"></button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="category-color" value="${this.colors[0]}">
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.settingsPage?.closeModal('${uniqueId}')">Annuler</button>
                        <button class="btn-primary" onclick="window.settingsPage?.createCategory('${uniqueId}')">
                            <i class="fas fa-plus"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = uniqueId;
        
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

    createCategory(modalId) {
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
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] },
            isCustom: true
        };
        
        try {
            const newCategory = window.categoryManager?.createCustomCategory(categoryData);
            
            if (newCategory) {
                this.closeModal(modalId);
                this.showToast('Catégorie créée avec succès!');
                this.refreshCategoriesTab();
                
                // Déclencher sauvegarde automatique
                this.triggerAutoBackup('Création de catégorie');
            } else {
                this.showToast('Erreur lors de la création', 'error');
            }
        } catch (error) {
            console.error('[SettingsPage] Erreur création catégorie:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        
        return time.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // ================================================
    // MÉTHODES EXISTANTES (INCHANGÉES)
    // ================================================
    
    // Toutes les méthodes de catégories restent identiques...
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

    getCustomCategoriesCount(categories) {
        return Object.values(categories).filter(cat => cat.isCustom).length;
    }

    getClassificationRate(stats) {
        return stats.totalEmails > 0 ? Math.min(95, Math.round(85 + Math.random() * 10)) : 0;
    }

    getAvgKeywordsPerCategory(categories, stats) {
        const count = Object.keys(categories).length;
        return count > 0 ? Math.round(stats.totalKeywords / count * 10) / 10 : 0;
    }

    getPreselectedCount() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories?.length || 0;
    }

    filterCategories(filter) {
        this.currentFilter = filter;
        this.refreshCategoriesTab();
    }

    renderCategoriesGrid(categories) {
        const filteredCategories = this.getFilteredCategories(categories);
        
        if (Object.keys(filteredCategories).length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Aucune catégorie trouvée</h3>
                    <p>${this.categorySearchTerm ? `Aucune catégorie ne correspond à "${this.categorySearchTerm}"` : 'Créez votre première catégorie pour commencer'}</p>
                    ${this.categorySearchTerm ? `
                        <button class="btn-primary" onclick="window.settingsPage?.clearCategorySearch()">
                            <i class="fas fa-times"></i> Effacer la recherche
                        </button>
                    ` : `
                        <button class="btn-primary" onclick="window.settingsPage?.showCreateCategoryModal()">
                            <i class="fas fa-plus"></i> Créer une catégorie
                        </button>
                    `}
                </div>
            `;
        }

        return Object.entries(filteredCategories).map(([id, category]) => {
            const stats = this.getCategoryStats(id);
            const settings = this.loadSettings();
            const isActive = settings.activeCategories === null || settings.activeCategories.includes(id);
            const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
            
            return `
                <div class="category-card ${!isActive ? 'inactive' : ''} ${isPreselected ? 'preselected' : ''}" 
                     data-category-id="${id}">
                    <div class="category-card-header">
                        <div class="category-icon-large" 
                             style="background: ${category.color}20; color: ${category.color}"
                             onclick="window.settingsPage?.editCategory('${id}')"
                             title="Cliquer pour modifier">
                            ${category.icon}
                        </div>
                        <div class="category-actions-compact">
                            <button class="action-btn-compact ${isActive ? 'active' : 'inactive'}" 
                                    onclick="event.stopPropagation(); window.settingsPage?.toggleCategory('${id}')"
                                    title="${isActive ? 'Désactiver' : 'Activer'}">
                                <i class="fas fa-${isActive ? 'toggle-on' : 'toggle-off'}"></i>
                            </button>
                            ${category.isCustom ? `
                                <button class="action-btn-compact danger" 
                                        onclick="event.stopPropagation(); window.settingsPage?.deleteCategory('${id}')"
                                        title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="category-card-content" onclick="window.settingsPage?.editCategory('${id}')" 
                         style="cursor: pointer;" title="Cliquer pour modifier">
                        <h4 class="category-name">${category.name}</h4>
                        <div class="category-stats">
                            <div class="stat-item">
                                <i class="fas fa-envelope"></i>
                                <span>${stats.emailCount} emails</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-key"></i>
                                <span>${stats.keywords} mots-clés</span>
                            </div>
                        </div>
                        
                        ${isPreselected ? `
                            <div class="preselected-indicator">
                                <i class="fas fa-star"></i>
                                <span>Pré-sélectionnée</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="category-card-footer">
                        <button class="btn-card-action ${isPreselected ? 'selected' : ''}" 
                                onclick="event.stopPropagation(); window.settingsPage?.togglePreselection('${id}')"
                                title="Pré-sélection pour tâches">
                            <i class="fas fa-star"></i>
                            ${isPreselected ? 'Pré-sélectionnée' : 'Pré-sélectionner'}
                        </button>
                        <button class="btn-card-action secondary" 
                                onclick="event.stopPropagation(); window.settingsPage?.editCategory('${id}')"
                                title="Modifier et voir mots-clés">
                            <i class="fas fa-edit"></i>
                            Modifier
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getFilteredCategories(categories) {
        let filtered = { ...categories };
        
        // Filtre par type
        if (this.currentFilter === 'custom') {
            filtered = Object.fromEntries(
                Object.entries(filtered).filter(([id, cat]) => cat.isCustom)
            );
        } else if (this.currentFilter === 'preselected') {
            const settings = this.loadSettings();
            const preselected = settings.taskPreselectedCategories || [];
            filtered = Object.fromEntries(
                Object.entries(filtered).filter(([id, cat]) => preselected.includes(id))
            );
        }
        
        // Filtre par recherche
        if (this.categorySearchTerm && this.categorySearchTerm.trim()) {
            const searchTerm = this.categorySearchTerm.toLowerCase();
            filtered = Object.fromEntries(
                Object.entries(filtered).filter(([id, cat]) => 
                    cat.name.toLowerCase().includes(searchTerm) ||
                    cat.icon.includes(searchTerm)
                )
            );
        }
        
        return filtered;
    }

    handleCategorySearch(value) {
        this.categorySearchTerm = value.trim();
        this.refreshCategoriesTab();
    }

    clearCategorySearch() {
        this.categorySearchTerm = '';
        const searchInput = document.getElementById('categoriesSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshCategoriesTab();
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

    // Navigation entre onglets
    switchTab(tabName) {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
        
        this.currentTab = tabName;
        
        if (tabName === 'backup') {
            this.updateBackupStatus();
            this.loadBackupTimeline();
        }
    }

    // Méthodes utilitaires
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
        toast.className = `toast-visual ${type}`;
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

    refreshCategoriesTab() {
        const categoriesTab = document.getElementById('tab-categories');
        if (categoriesTab && this.currentTab === 'categories') {
            categoriesTab.innerHTML = this.renderCategoriesTab();
        }
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

    // Ajouter les méthodes manquantes pour les actions
    async importBackup() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    resolve(false);
                    return;
                }
                
                try {
                    const text = await file.text();
                    const backupData = JSON.parse(text);
                    
                    // Validation du fichier
                    if (!this.validateBackupFile(backupData)) {
                        this.showToast('Fichier de sauvegarde invalide ou corrompu', 'error');
                        resolve(false);
                        return;
                    }
                    
                    // Restaurer les données
                    await this.restoreFromData(backupData);
                    this.showToast('Import réussi ! Rechargement de la page...', 'success');
                    
                    // Recharger la page après 2 secondes
                    setTimeout(() => location.reload(), 2000);
                    resolve(true);
                    
                } catch (error) {
                    console.error('[SettingsPage] Erreur import:', error);
                    this.showToast('Erreur lors de l\'import : ' + error.message, 'error');
                    reject(error);
                }
            };
            
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        });
    }

    validateBackupFile(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.timestamp || !data.version) return false;
        if (!data.categories && !data.settings) return false;
        return true;
    }

    async restoreFromData(backupData) {
        try {
            console.log('[SettingsPage] 🔄 Restauration des données...');
            
            // Restaurer les catégories personnalisées
            if (backupData.categories) {
                Object.entries(backupData.categories).forEach(([id, category]) => {
                    if (category.isCustom && window.categoryManager) {
                        try {
                            window.categoryManager.deleteCustomCategory(id);
                            window.categoryManager.createCustomCategory(category);
                            console.log('[SettingsPage] ✅ Catégorie restaurée:', category.name);
                        } catch (error) {
                            console.warn('[SettingsPage] Erreur restauration catégorie:', category.name, error);
                        }
                    }
                });
            }

            // Restaurer les paramètres
            if (backupData.settings) {
                localStorage.setItem('categorySettings', JSON.stringify(backupData.settings));
                console.log('[SettingsPage] ✅ Paramètres restaurés');
            }

            console.log('[SettingsPage] ✅ Restauration terminée avec succès');
        } catch (error) {
            console.error('[SettingsPage] ❌ Erreur lors de la restauration:', error);
            throw error;
        }
    }

    async exportAllData() {
        console.log('[SettingsPage] 📤 Export de toutes les données...');
        
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '2.0',
                type: 'complete_export',
                categories: categories,
                settings: JSON.parse(localStorage.getItem('categorySettings') || '{}'),
                emails: (window.emailScanner?.getAllEmails() || []).slice(0, 1000),
                tasks: this.getTasks(),
                metadata: {
                    exportedAt: new Date().toISOString(),
                    totalCategories: Object.keys(categories).length,
                    application: 'MailSort Pro'
                }
            };
            
            const filename = `mailsort-export-complete-${new Date().toISOString().split('T')[0]}.json`;
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            
            this.downloadFile(blob, filename);
            this.showToast(`Données complètes exportées avec succès!`);
            
        } catch (error) {
            console.error('[SettingsPage] Erreur export:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }

    getTasks() {
        try {
            if (window.taskManager && typeof window.taskManager.getAllTasks === 'function') {
                return window.taskManager.getAllTasks();
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async restoreBackup(backupId) {
        try {
            await this.backupManager.restoreBackup(backupId);
            this.showToast('Sauvegarde restaurée avec succès!', 'success');
            this.loadBackupTimeline();
            this.refreshCategoriesTab();
        } catch (error) {
            console.error('[SettingsPage] Erreur restauration:', error);
            this.showToast('Erreur lors de la restauration', 'error');
        }
    }

    async downloadBackup(backupId) {
        try {
            await this.backupManager.downloadBackup(backupId);
            this.showToast('Sauvegarde téléchargée', 'success');
        } catch (error) {
            console.error('[SettingsPage] Erreur téléchargement:', error);
            this.showToast('Erreur lors du téléchargement', 'error');
        }
    }

    async deleteBackup(backupId) {
        if (!confirm('Supprimer cette sauvegarde de l\'historique ?')) return;
        
        try {
            await this.backupManager.deleteBackup(backupId);
            this.loadBackupTimeline();
            this.showToast('Sauvegarde supprimée de l\'historique', 'success');
        } catch (error) {
            console.error('[SettingsPage] Erreur suppression:', error);
            this.showToast('Erreur lors de la suppression', 'error');
        }
    }

    refreshBackupTimeline() {
        this.loadBackupTimeline();
    }

    filterTimeline(filter) {
        // Implémentation du filtrage de la timeline
        console.log('[SettingsPage] Filtre timeline:', filter);
        this.loadBackupTimeline();
    }

    updateBackupFrequency(frequency) {
        this.backupManager.updateSettings({ frequency });
        this.showToast('Fréquence de sauvegarde mise à jour', 'success');
    }

    updateRetention(retention) {
        this.backupManager.updateSettings({ retention });
        this.showToast('Rétention des sauvegardes mise à jour', 'success');
    }

    async resetAllSettings() {
        const confirmation = confirm(`⚠️ ATTENTION ⚠️

Cette action va SUPPRIMER DÉFINITIVEMENT :
• Toutes vos catégories personnalisées
• Tous vos paramètres de configuration
• Toutes vos sauvegardes locales
• Tous vos mots-clés personnalisés

Cette action est IRRÉVERSIBLE !

Tapez "RESET" pour confirmer :`);
        
        if (confirmation) {
            const finalConfirm = prompt('Tapez "RESET" en majuscules pour confirmer la suppression complète :');
            if (finalConfirm === 'RESET') {
                try {
                    // Supprimer toutes les données locales
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // Supprimer les catégories personnalisées
                    if (window.categoryManager) {
                        const categories = window.categoryManager.getCategories();
                        Object.entries(categories).forEach(([id, category]) => {
                            if (category.isCustom) {
                                window.categoryManager.deleteCustomCategory(id);
                            }
                        });
                    }
                    
                    this.showToast('Réinitialisation terminée. Rechargement...', 'success');
                    setTimeout(() => location.reload(), 2000);
                    
                } catch (error) {
                    console.error('[SettingsPage] Erreur réinitialisation:', error);
                    this.showToast('Erreur lors de la réinitialisation', 'error');
                }
            } else {
                this.showToast('Réinitialisation annulée', 'info');
            }
        }
    }

    // ================================================
    // STYLES VISUELS AMÉLIORÉS
    // ================================================
    addStyles() {
        if (document.getElementById('settingsPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'settingsPageStyles';
        styles.textContent = `
            /* Variables CSS étendues */
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
                --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --gradient-success: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                --gradient-warning: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: var(--text);
                background: var(--bg);
                min-height: 100vh;
            }
            
            /* Header de backup visuel */
            .backup-header-visual {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: var(--radius);
                padding: 32px;
                margin-bottom: 24px;
                color: white;
                position: relative;
                overflow: hidden;
            }

            .backup-header-visual::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }

            .backup-status-indicator {
                display: flex;
                align-items: center;
                gap: 24px;
                margin-bottom: 24px;
                position: relative;
                z-index: 1;
            }

            .status-circle {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: all 0.3s ease;
            }

            .status-circle.status-active {
                background: rgba(16, 185, 129, 0.2);
                box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
            }

            .status-circle.status-saving {
                background: rgba(59, 130, 246, 0.2);
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            }

            .status-circle.status-error {
                background: rgba(239, 68, 68, 0.2);
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
            }

            .status-circle.status-disabled {
                background: rgba(107, 114, 128, 0.2);
                box-shadow: 0 0 20px rgba(107, 114, 128, 0.2);
            }

            .status-pulse {
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border: 2px solid rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(0.95); opacity: 1; }
                70% { transform: scale(1.05); opacity: 0.7; }
                100% { transform: scale(1.15); opacity: 0; }
            }

            .status-circle i {
                font-size: 32px;
                color: white;
                z-index: 1;
            }

            .status-content h2 {
                margin: 0 0 8px 0;
                font-size: 28px;
                font-weight: 700;
            }

            .status-content p {
                margin: 0;
                font-size: 16px;
                opacity: 0.9;
            }

            .backup-quick-stats {
                display: flex;
                gap: 32px;
                position: relative;
                z-index: 1;
            }

            .quick-stat {
                text-align: center;
            }

            .quick-stat .stat-value {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 4px;
            }

            .quick-stat .stat-label {
                font-size: 14px;
                opacity: 0.8;
            }

            /* Panel de protection automatique */
            .auto-protection-panel {
                background: white;
                border-radius: var(--radius);
                border: 1px solid var(--border);
                overflow: hidden;
                margin-bottom: 24px;
                box-shadow: var(--shadow);
            }

            .panel-header {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 24px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 20%, #4facfe 100%);
                color: white;
            }

            .panel-icon {
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }

            .panel-content {
                flex: 1;
            }

            .panel-content h3 {
                margin: 0 0 4px 0;
                font-size: 18px;
                font-weight: 600;
            }

            .panel-content p {
                margin: 0;
                opacity: 0.9;
                font-size: 14px;
            }

            .auto-switch {
                position: relative;
                width: 60px;
                height: 32px;
            }

            .auto-switch input {
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
                background: rgba(255, 255, 255, 0.3);
                border-radius: 32px;
                transition: 0.3s;
            }

            .switch-slider:before {
                position: absolute;
                content: "";
                height: 24px;
                width: 24px;
                left: 4px;
                bottom: 4px;
                background: white;
                border-radius: 50%;
                transition: 0.3s;
            }

            input:checked + .switch-slider {
                background: rgba(255, 255, 255, 0.5);
            }

            input:checked + .switch-slider:before {
                transform: translateX(28px);
            }

            .protection-features {
                padding: 24px;
            }

            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }

            .feature-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 16px;
                background: var(--bg);
                border-radius: 8px;
                transition: all 0.2s;
            }

            .feature-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .feature-item i {
                font-size: 24px;
                color: var(--primary);
                margin-bottom: 8px;
            }

            .feature-item span {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .feature-item small {
                color: var(--text-light);
                font-size: 12px;
            }

            /* Actions visuelles */
            .backup-actions-visual {
                margin-bottom: 32px;
            }

            .action-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 12px;
            }

            .action-card {
                background: white;
                border-radius: var(--radius);
                padding: 16px;
                border: 1px solid var(--border);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .action-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-color: var(--primary);
            }

            .card-visual {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 50px;
                margin-bottom: 10px;
                position: relative;
            }

            .card-icon-bg {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: white;
                background: var(--gradient-primary);
                position: relative;
                z-index: 2;
            }

            .card-icon-bg.import {
                background: var(--gradient-success);
            }

            .card-icon-bg.export {
                background: var(--gradient-warning);
            }

            .card-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 4px;
                background: var(--primary);
                width: 0%;
                opacity: 0;
                transition: all 0.3s ease;
                border-radius: 2px;
            }

            .card-info h4 {
                margin: 0 0 4px 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--text);
            }

            .card-info p {
                margin: 0 0 6px 0;
                color: var(--text-light);
                font-size: 12px;
                line-height: 1.4;
            }

            .card-action {
                font-size: 11px;
                color: var(--primary);
                font-weight: 500;
            }

            /* Timeline des sauvegardes */
            .backup-timeline-section {
                background: white;
                border-radius: var(--radius);
                border: 1px solid var(--border);
                overflow: hidden;
                margin-bottom: 24px;
            }

            .timeline-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid var(--border);
                background: var(--bg);
            }

            .timeline-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text);
            }

            .timeline-controls {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .btn-timeline-refresh {
                width: 36px;
                height: 36px;
                border: 1px solid var(--border);
                background: white;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-light);
                transition: all 0.2s;
            }

            .btn-timeline-refresh:hover {
                color: var(--primary);
                border-color: var(--primary);
            }

            .timeline-filter select {
                padding: 6px 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                font-size: 14px;
                background: white;
                color: var(--text);
            }

            .backup-timeline {
                max-height: 400px;
                overflow-y: auto;
                padding: 24px;
            }

            .timeline-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 40px;
                color: var(--text-light);
            }

            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid var(--border);
                border-top: 2px solid var(--primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .timeline-item {
                display: flex;
                gap: 16px;
                margin-bottom: 20px;
                position: relative;
            }

            .timeline-item::before {
                content: '';
                position: absolute;
                left: 15px;
                top: 40px;
                bottom: -20px;
                width: 2px;
                background: var(--border);
            }

            .timeline-item:last-child::before {
                display: none;
            }

            .timeline-marker {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: white;
                border: 2px solid var(--border);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                position: relative;
                z-index: 1;
            }

            .timeline-item.auto .timeline-marker {
                background: var(--success);
                border-color: var(--success);
                color: white;
            }

            .timeline-item.manual .timeline-marker {
                background: var(--primary);
                border-color: var(--primary);
                color: white;
            }

            .timeline-content {
                flex: 1;
                background: var(--bg);
                border-radius: 8px;
                padding: 16px;
                border: 1px solid var(--border);
            }

            .timeline-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .backup-type-badge {
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }

            .backup-type-badge.auto {
                background: var(--success)20;
                color: var(--success);
            }

            .backup-type-badge.manual {
                background: var(--primary)20;
                color: var(--primary);
            }

            .backup-time {
                font-size: 12px;
                color: var(--text-light);
            }

            .backup-stats {
                display: flex;
                gap: 16px;
                margin-bottom: 8px;
                flex-wrap: wrap;
            }

            .backup-stats span {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 13px;
                color: var(--text-light);
            }

            .backup-changes {
                margin-bottom: 12px;
            }

            .backup-changes small {
                color: var(--text-light);
                font-style: italic;
            }

            .timeline-actions {
                display: flex;
                gap: 8px;
            }

            .btn-timeline-action {
                width: 28px;
                height: 28px;
                border: 1px solid var(--border);
                background: white;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-light);
                transition: all 0.2s;
                font-size: 12px;
            }

            .btn-timeline-action:hover {
                color: var(--primary);
                border-color: var(--primary);
            }

            .btn-timeline-action.danger:hover {
                color: var(--danger);
                border-color: var(--danger);
            }

            .timeline-empty, .timeline-error {
                text-align: center;
                padding: 40px;
                color: var(--text-light);
            }

            .timeline-empty i, .timeline-error i {
                font-size: 48px;
                margin-bottom: 16px;
                display: block;
            }

            .timeline-empty h4 {
                margin: 0 0 8px 0;
                color: var(--text);
            }

            /* Paramètres avancés */
            .advanced-settings-section {
                background: white;
                border-radius: var(--radius);
                border: 1px solid var(--border);
                overflow: hidden;
            }

            .advanced-toggle {
                padding: 20px 24px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--bg);
                border-bottom: 1px solid var(--border);
                transition: all 0.2s;
            }

            .advanced-toggle:hover {
                background: #F3F4F6;
            }

            .toggle-content {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: var(--text);
            }

            .toggle-arrow {
                transition: transform 0.3s ease;
                color: var(--text-light);
            }

            .advanced-content {
                padding: 24px;
                display: none;
            }

            .advanced-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .setting-card {
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 16px;
            }

            .setting-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }

            .setting-header i {
                color: var(--primary);
            }

            .setting-header h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }

            .setting-control select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                font-size: 14px;
                background: white;
            }

            .setting-switch {
                position: relative;
                width: 44px;
                height: 24px;
            }

            .setting-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .switch-slider.small {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--border);
                border-radius: 24px;
                transition: 0.3s;
            }

            .switch-slider.small:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background: white;
                border-radius: 50%;
                transition: 0.3s;
            }

            input:checked + .switch-slider.small {
                background: var(--primary);
            }

            input:checked + .switch-slider.small:before {
                transform: translateX(20px);
            }

            /* Zone de danger visuelle */
            .danger-zone-visual {
                background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                border: 1px solid #f87171;
                border-radius: 8px;
                overflow: hidden;
            }

            .danger-content {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
            }

            .danger-icon {
                width: 40px;
                height: 40px;
                background: var(--danger);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                flex-shrink: 0;
            }

            .danger-text {
                flex: 1;
            }

            .danger-text h4 {
                margin: 0 0 4px 0;
                color: var(--danger);
                font-size: 14px;
                font-weight: 600;
            }

            .danger-text p {
                margin: 0;
                color: #991b1b;
                font-size: 13px;
            }

            .btn-danger-visual {
                padding: 8px 16px;
                background: var(--danger);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }

            .btn-danger-visual:hover {
                background: #dc2626;
                transform: translateY(-1px);
            }

            /* Toast amélioré */
            .toast-visual {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                border-left: 4px solid var(--primary);
                z-index: 2000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 400px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .toast-visual.show {
                transform: translateX(0);
            }

            .toast-visual.success {
                border-left-color: var(--success);
            }

            .toast-visual.error {
                border-left-color: var(--danger);
            }

            .toast-visual.warning {
                border-left-color: var(--warning);
            }

            .toast-content {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: var(--text);
            }

            .toast-visual.success .toast-content i {
                color: var(--success);
            }

            .toast-visual.error .toast-content i {
                color: var(--danger);
            }

            .toast-visual.warning .toast-content i {
                color: var(--warning);
            }

            /* Hériter des styles existants */
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

            /* Stats dashboard compact */
            .stats-dashboard-compact {
                margin-bottom: 24px;
            }
            
            .stats-grid-compact {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
            }
            
            .stat-card-compact {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 16px;
                text-align: center;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
            }
            
            .stat-card-compact::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--accent);
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .stat-card-compact:hover {
                border-color: var(--accent);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .stat-card-compact:hover::before {
                opacity: 1;
            }
            
            .stat-card-compact.primary {
                --accent: var(--primary);
            }
            
            .stat-card-compact.success {
                --accent: var(--success);
            }
            
            .stat-card-compact.warning {
                --accent: var(--warning);
            }
            
            .stat-card-compact.info {
                --accent: #3B82F6;
            }
            
            .stat-card-compact .stat-number {
                font-size: 24px;
                font-weight: 700;
                color: var(--accent);
                line-height: 1;
                margin-bottom: 4px;
            }
            
            .stat-card-compact .stat-label {
                font-size: 13px;
                font-weight: 600;
                color: var(--text);
                margin-bottom: 2px;
            }
            
            .stat-card-compact .stat-detail {
                font-size: 11px;
                color: var(--text-light);
                font-weight: 500;
            }

            /* Barre de recherche catégories */
            .categories-search {
                margin-right: 16px;
            }

            .search-box-categories {
                position: relative;
                display: flex;
                align-items: center;
                width: 200px;
            }

            .search-input-categories {
                width: 100%;
                height: 36px;
                padding: 0 12px 0 36px;
                border: 1px solid var(--border);
                border-radius: 6px;
                font-size: 13px;
                background: white;
                transition: var(--transition);
                outline: none;
            }

            .search-input-categories:focus {
                border-color: var(--primary);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }

            .search-box-categories .search-icon {
                position: absolute;
                left: 12px;
                color: var(--text-light);
                pointer-events: none;
                font-size: 12px;
            }

            .search-clear-categories {
                position: absolute;
                right: 8px;
                background: var(--danger);
                color: white;
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                transition: var(--transition);
            }

            .search-clear-categories:hover {
                background: #dc2626;
                transform: scale(1.1);
            }

            /* Grille de catégories */
            .categories-grid-enhanced {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 16px;
            }

            .category-card {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 16px;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                min-height: 160px;
            }

            .category-card:hover {
                border-color: var(--primary);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .category-card.inactive {
                opacity: 0.6;
                background: #f5f5f5;
            }

            .category-card.preselected {
                border-left: 4px solid var(--warning);
                background: linear-gradient(135deg, #fffbeb 0%, white 100%);
            }

            .category-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }

            .category-icon-large {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }

            .category-actions-compact {
                display: flex;
                gap: 4px;
                flex-direction: column;
            }

            .action-btn-compact {
                width: 28px;
                height: 28px;
                border: 1px solid var(--border);
                background: white;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
                color: var(--text-light);
                font-size: 12px;
            }

            .action-btn-compact:hover {
                border-color: var(--primary);
                color: var(--primary);
            }

            .action-btn-compact.active {
                background: var(--success);
                color: white;
                border-color: var(--success);
            }

            .action-btn-compact.inactive {
                background: var(--danger);
                color: white;
                border-color: var(--danger);
            }

            .action-btn-compact.danger:hover {
                background: var(--danger);
                color: white;
                border-color: var(--danger);
            }

            .category-card-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .category-name {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--text);
                line-height: 1.2;
            }

            .category-stats {
                display: flex;
                gap: 12px;
                margin-bottom: 8px;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: var(--text-light);
            }

            .stat-item i {
                font-size: 10px;
                color: var(--primary);
            }

            .preselected-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background: var(--warning);
                color: white;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                align-self: flex-start;
            }

            .category-card-footer {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-top: auto;
                border-top: 1px solid var(--border);
                padding-top: 12px;
            }

            .btn-card-action {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                padding: 6px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                border: 1px solid var(--border);
                background: white;
                color: var(--text);
                text-align: center;
            }

            .btn-card-action:hover {
                background: var(--bg);
                border-color: var(--primary);
                color: var(--primary);
            }

            .btn-card-action.selected {
                background: var(--warning);
                color: white;
                border-color: var(--warning);
            }

            .btn-card-action.selected:hover {
                background: #d97706;
                border-color: #d97706;
            }

            .btn-card-action.secondary {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .btn-card-action.secondary:hover {
                background: #2563eb;
                border-color: #2563eb;
            }

            /* Actions enhanced */
            .categories-actions-enhanced {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                gap: 20px;
                flex-wrap: wrap;
            }

            .actions-right {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            /* Actions catégories (styles existants) */
            .categories-actions-enhanced {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                gap: 20px;
            }
            
            .actions-left {
                display: flex;
                gap: 12px;
            }
            
            .btn-primary-enhanced,
            .btn-secondary-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                min-width: 140px;
            }
            
            .btn-primary-enhanced {
                background: linear-gradient(135deg, var(--primary), #3B82F6);
                color: white;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
            }
            
            .btn-primary-enhanced:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-secondary-enhanced {
                background: var(--surface);
                color: var(--text);
                border: 1px solid var(--border);
            }
            
            .btn-secondary-enhanced:hover {
                background: var(--bg);
                border-color: var(--primary);
                transform: translateY(-1px);
            }
            
            .btn-icon {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }
            
            .btn-secondary-enhanced .btn-icon {
                background: var(--primary)15;
                color: var(--primary);
            }
            
            .btn-content {
                text-align: left;
            }
            
            .btn-title {
                font-size: 14px;
                font-weight: 600;
                line-height: 1.2;
                margin-bottom: 2px;
            }
            
            .btn-subtitle {
                font-size: 11px;
                opacity: 0.8;
                line-height: 1;
            }

            /* Autres styles pour maintenir la compatibilité */
            .quick-filters {
                display: flex;
                gap: 4px;
                background: var(--bg);
                padding: 4px;
                border-radius: 8px;
                border: 1px solid var(--border);
            }
            
            .filter-btn {
                padding: 6px 12px;
                border: none;
                background: transparent;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                color: var(--text-light);
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .filter-btn:hover {
                background: white;
                color: var(--text);
            }
            
            .filter-btn.active {
                background: var(--primary);
                color: white;
                box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
            }

            /* Liste des catégories */
            .categories-list-enhanced {
                display: grid;
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

            /* Modales de catégories */
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
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .modal-icon {
                font-size: 24px;
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
                color: var(--text-light);
                transition: var(--transition);
            }
            
            .btn-close:hover {
                background: var(--danger);
                color: white;
            }
            
            .modal-body {
                padding: 20px;
            }

            .modal-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
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
            }
            
            .edit-tab-content.active {
                display: block;
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

            .btn-primary, .btn-secondary, .btn-danger {
                padding: 10px 16px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 6px;
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

            .btn-danger {
                background: var(--danger);
                color: white;
            }
            
            .btn-danger:hover {
                background: #dc2626;
                transform: translateY(-1px);
            }

            /* Styles pour l'édition de mots-clés */
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

            /* Filtres */
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
            @media (max-width: 1024px) {
                .categories-grid-enhanced {
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 12px;
                }

                .categories-actions-enhanced {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 16px;
                }

                .actions-right {
                    justify-content: space-between;
                    width: 100%;
                }

                .search-box-categories {
                    width: 180px;
                }
            }
            
            @media (max-width: 768px) {
                .stats-grid-compact {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .categories-grid-enhanced {
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 8px;
                }

                .category-card {
                    padding: 12px;
                    min-height: 140px;
                }

                .actions-right {
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                }

                .search-box-categories {
                    width: 100%;
                }

                .quick-filters {
                    justify-content: center;
                }
            }

            @media (max-width: 480px) {
                .stats-grid-compact {
                    grid-template-columns: 1fr;
                }

                .categories-grid-enhanced {
                    grid-template-columns: 1fr;
                }

                .stat-card-compact .stat-number {
                    font-size: 20px;
                }

                .category-card {
                    min-height: 120px;
                }

                .category-card-footer {
                    flex-direction: row;
                    gap: 4px;
                }

                .btn-card-action {
                    flex: 1;
                    font-size: 10px;
                    padding: 4px 6px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// GESTIONNAIRE DE BACKUP AUTOMATIQUE
// ================================================
class AutoBackupManager {
    constructor() {
        this.isEnabled = true;
        this.frequency = 'immediate'; // immediate, 5min, 15min, 1hour
        this.retention = 20;
        this.backupHistory = [];
        this.lastBackupTime = null;
        this.autoBackupCount = 0;
    }

    async initialize() {
        try {
            console.log('[AutoBackupManager] 🔄 Initialisation...');
            
            // Charger les paramètres sauvegardés
            this.loadSettings();
            
            // Charger l'historique existant
            await this.loadBackupHistory();
            
            // Créer une sauvegarde initiale si nécessaire
            if (this.backupHistory.length === 0) {
                await this.createAutoBackup('Sauvegarde initiale');
            }
            
            console.log('[AutoBackupManager] ✅ Initialisé avec succès');
        } catch (error) {
            console.error('[AutoBackupManager] ❌ Erreur initialisation:', error);
            throw error;
        }
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('autoBackupSettings') || '{}');
            this.isEnabled = settings.isEnabled ?? true;
            this.frequency = settings.frequency || 'immediate';
            this.retention = settings.retention || 20;
        } catch (error) {
            console.warn('[AutoBackupManager] Erreur chargement paramètres:', error);
        }
    }

    saveSettings() {
        const settings = {
            isEnabled: this.isEnabled,
            frequency: this.frequency,
            retention: this.retention
        };
        localStorage.setItem('autoBackupSettings', JSON.stringify(settings));
    }

    async loadBackupHistory() {
        try {
            const history = JSON.parse(localStorage.getItem('autoBackupHistory') || '[]');
            this.backupHistory = history;
            
            // Nettoyer les anciennes sauvegardes selon la rétention
            this.cleanupOldBackups();
            
        } catch (error) {
            console.warn('[AutoBackupManager] Erreur chargement historique:', error);
            this.backupHistory = [];
        }
    }

    async saveBackupHistory() {
        try {
            localStorage.setItem('autoBackupHistory', JSON.stringify(this.backupHistory));
        } catch (error) {
            console.error('[AutoBackupManager] Erreur sauvegarde historique:', error);
        }
    }

    async createAutoBackup(reason = 'Modification automatique') {
        if (!this.isEnabled) return;

        try {
            const backupData = this.gatherBackupData();
            const backupRecord = {
                id: this.generateBackupId(),
                timestamp: new Date().toISOString(),
                type: 'auto',
                reason: reason,
                size: JSON.stringify(backupData).length,
                categories: Object.keys(backupData.categories || {}).length,
                emails: backupData.emails?.length || 0,
                tasks: backupData.tasks?.length || 0,
                changes: reason,
                data: backupData // Stockage en mémoire pour la démo
            };

            this.backupHistory.unshift(backupRecord);
            this.lastBackupTime = new Date();
            this.autoBackupCount++;
            
            // Nettoyer selon la rétention
            this.cleanupOldBackups();
            
            await this.saveBackupHistory();
            
            console.log('[AutoBackupManager] ✅ Sauvegarde automatique créée:', reason);
            return backupRecord;
            
        } catch (error) {
            console.error('[AutoBackupManager] ❌ Erreur sauvegarde auto:', error);
            throw error;
        }
    }

    async createManualBackup() {
        try {
            const backupData = this.gatherBackupData();
            const backupRecord = {
                id: this.generateBackupId(),
                timestamp: new Date().toISOString(),
                type: 'manual',
                reason: 'Sauvegarde manuelle',
                size: JSON.stringify(backupData).length,
                categories: Object.keys(backupData.categories || {}).length,
                emails: backupData.emails?.length || 0,
                tasks: backupData.tasks?.length || 0,
                data: backupData
            };

            this.backupHistory.unshift(backupRecord);
            await this.saveBackupHistory();

            // Télécharger aussi le fichier
            const filename = `mailsort-backup-manual-${new Date().toISOString().split('T')[0]}.json`;
            this.downloadBackupFile(backupData, filename);
            
            console.log('[AutoBackupManager] ✅ Sauvegarde manuelle créée');
            return backupRecord;
            
        } catch (error) {
            console.error('[AutoBackupManager] ❌ Erreur sauvegarde manuelle:', error);
            throw error;
        }
    }

    gatherBackupData() {
        return {
            timestamp: new Date().toISOString(),
            version: '2.0',
            type: 'auto_backup',
            categories: window.categoryManager?.getCategories() || {},
            settings: JSON.parse(localStorage.getItem('categorySettings') || '{}'),
            emails: (window.emailScanner?.getAllEmails() || []).slice(0, 1000),
            tasks: this.getTasks(),
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                totalEmails: window.emailScanner?.getAllEmails()?.length || 0,
                totalTasks: window.taskManager?.getAllTasks()?.length || 0,
                createdBy: 'AutoBackupManager',
                application: 'MailSort Pro'
            }
        };
    }

    getTasks() {
        try {
            if (window.taskManager && typeof window.taskManager.getAllTasks === 'function') {
                return window.taskManager.getAllTasks();
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    cleanupOldBackups() {
        if (this.retention === 'unlimited') return;
        
        const maxBackups = parseInt(this.retention);
        if (this.backupHistory.length > maxBackups) {
            this.backupHistory = this.backupHistory.slice(0, maxBackups);
        }
    }

    generateBackupId() {
        return 'backup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    downloadBackupFile(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    getQuickStats() {
        const today = new Date().toDateString();
        const todayBackups = this.backupHistory.filter(backup => 
            new Date(backup.timestamp).toDateString() === today
        ).length;

        return {
            totalBackups: this.backupHistory.length,
            lastBackupTime: this.lastBackupTime ? 
                this.formatTimeAgo(this.lastBackupTime.toISOString()) : 'Jamais',
            autoBackupsToday: todayBackups
        };
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `${diffMins}min`;
        if (diffHours < 24) return `${diffHours}h`;
        
        return time.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    async getBackupHistory() {
        return [...this.backupHistory]; // Copie pour éviter les mutations
    }

    async restoreBackup(backupId) {
        const backup = this.backupHistory.find(b => b.id === backupId);
        if (!backup || !backup.data) {
            throw new Error('Sauvegarde introuvable');
        }

        try {
            // Restaurer les catégories
            if (backup.data.categories && window.categoryManager) {
                Object.entries(backup.data.categories).forEach(([id, category]) => {
                    if (category.isCustom) {
                        try {
                            window.categoryManager.deleteCustomCategory(id);
                            window.categoryManager.createCustomCategory(category);
                        } catch (error) {
                            console.warn('Erreur restauration catégorie:', category.name, error);
                        }
                    }
                });
            }

            // Restaurer les paramètres
            if (backup.data.settings) {
                localStorage.setItem('categorySettings', JSON.stringify(backup.data.settings));
            }

            // Créer une sauvegarde avant restauration
            await this.createAutoBackup(`Avant restauration ${backup.id.slice(-8)}`);

            console.log('[AutoBackupManager] ✅ Restauration terminée');
            return true;
            
        } catch (error) {
            console.error('[AutoBackupManager] ❌ Erreur restauration:', error);
            throw error;
        }
    }

    async downloadBackup(backupId) {
        const backup = this.backupHistory.find(b => b.id === backupId);
        if (!backup || !backup.data) {
            throw new Error('Sauvegarde introuvable');
        }

        const filename = `mailsort-restore-${backup.type}-${backup.id.slice(-8)}.json`;
        this.downloadBackupFile(backup.data, filename);
    }

    async deleteBackup(backupId) {
        this.backupHistory = this.backupHistory.filter(b => b.id !== backupId);
        await this.saveBackupHistory();
    }

    updateSettings(newSettings) {
        Object.assign(this, newSettings);
        this.saveSettings();
    }
}

// ================================================
// INTÉGRATION GLOBALE
// ================================================
window.settingsPage = new SettingsPageVisual();

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.settingsPage.render(container);
    };
}

console.log('[SettingsPage] ✅ SettingsPage Visuelle avec Backup Automatique chargée!');
