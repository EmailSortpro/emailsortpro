// PageManager.js - Gestionnaire de pages avec intégration backup et pages séparées

class PageManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = {};
        this.isInitialized = false;
        this.history = [];
        this.maxHistorySize = 10;
        
        console.log('[PageManager] Initialized with backup support and separate pages');
        
        // Définir les pages disponibles
        this.setupPages();
        
        // Initialiser après le chargement du DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    setupPages() {
        this.pages = {
            // Dashboard
            dashboard: (container) => {
                if (window.dashboardModule) {
                    window.dashboardModule.render();
                } else {
                    this.renderDashboard(container);
                }
            },
            
            // Scanner/Start Scan
            scanner: (container) => {
                if (window.minimalScanModule) {
                    window.minimalScanModule.render(container);
                } else {
                    container.innerHTML = '<p>Module scanner non disponible</p>';
                }
            },
            
            // Emails
            emails: (container) => {
                this.renderEmailsPage(container);
            },
            
            // Tasks
            tasks: (container) => {
                if (window.tasksView) {
                    window.tasksView.render(container);
                } else {
                    container.innerHTML = '<p>Module tâches non disponible</p>';
                }
            },
            
            // Ranger
            ranger: (container) => {
                if (window.domainOrganizer) {
                    window.domainOrganizer.render(container);
                } else {
                    container.innerHTML = '<p>Module ranger non disponible</p>';
                }
            },
            
            // Catégories (page séparée)
            categories: (container) => {
                this.renderCategoriesPage(container);
            },
            
            // Paramètres (avec backup uniquement)
            settings: (container) => {
                this.renderSettingsPage(container);
            }
        };
    }

    init() {
        console.log('[PageManager] Initializing...');
        
        // Attacher les événements de navigation
        this.attachNavigationEvents();
        
        // Gérer les boutons retour du navigateur
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.loadPage(event.state.page, false);
            }
        });
        
        this.isInitialized = true;
        console.log('[PageManager] ✅ Initialization complete');
    }

    attachNavigationEvents() {
        // Attacher les événements aux boutons de navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.loadPage(page);
                }
            });
        });
    }

    // =====================================
    // CHARGEMENT DE PAGE
    // =====================================
    async loadPage(pageName, updateHistory = true) {
        console.log(`[PageManager] Loading page: ${pageName}`);
        
        const container = document.getElementById('pageContent');
        if (!container) {
            console.error('[PageManager] Page container not found');
            return;
        }
        
        // Vérifier si la page existe
        if (!this.pages[pageName]) {
            console.error(`[PageManager] Page not found: ${pageName}`);
            return;
        }
        
        // Mettre à jour la navigation active
        this.updateActiveNavigation(pageName);
        
        // Sauvegarder dans l'historique
        if (updateHistory) {
            this.addToHistory(pageName);
            window.history.pushState({ page: pageName }, '', `#${pageName}`);
        }
        
        // Appliquer le mode d'affichage
        if (window.setPageMode) {
            window.setPageMode(pageName);
        }
        
        try {
            // Afficher un loader si nécessaire
            if (window.uiManager) {
                window.uiManager.showLoading(`Chargement ${pageName}...`);
            }
            
            // Nettoyer le container
            container.innerHTML = '';
            
            // Charger la page
            await this.pages[pageName](container);
            
            // Mettre à jour la page courante
            this.currentPage = pageName;
            
            // Dispatcher un événement
            window.dispatchEvent(new CustomEvent('pageChanged', { 
                detail: { page: pageName, previousPage: this.getPreviousPage() }
            }));
            
        } catch (error) {
            console.error(`[PageManager] Error loading page ${pageName}:`, error);
            container.innerHTML = `
                <div class="error-page">
                    <h2>Erreur de chargement</h2>
                    <p>Impossible de charger la page ${pageName}</p>
                    <button onclick="window.pageManager.loadPage('dashboard')">
                        Retour au dashboard
                    </button>
                </div>
            `;
        } finally {
            if (window.uiManager) {
                window.uiManager.hideLoading();
            }
        }
    }

    // =====================================
    // PAGE CATÉGORIES (séparée des paramètres)
    // =====================================
    renderCategoriesPage(container) {
        // Si CategoriesPage.js existe, l'utiliser
        if (window.categoriesPage) {
            window.categoriesPage.render(container);
            return;
        }
        
        // Sinon, afficher une interface basique de gestion des catégories
        const categories = window.categoryManager?.getCategories() || {};
        const customCategories = window.categoryManager?.getCustomCategories() || {};
        
        container.innerHTML = `
            <div class="categories-management-page">
                <div class="page-header">
                    <div>
                        <h1><i class="fas fa-tags"></i> Gestion des Catégories</h1>
                        <p class="page-subtitle">Personnalisez vos catégories d'emails</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.pageManager.showCreateCategoryModal()">
                        <i class="fas fa-plus"></i> Nouvelle catégorie
                    </button>
                </div>
                
                <div class="categories-stats">
                    <div class="stat-mini">
                        <span class="stat-value">${Object.keys(categories).length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-value">${Object.keys(customCategories).length}</span>
                        <span class="stat-label">Personnalisées</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-value">${Object.keys(categories).length - Object.keys(customCategories).length}</span>
                        <span class="stat-label">Prédéfinies</span>
                    </div>
                </div>
                
                <div class="categories-grid">
                    ${Object.entries(categories).map(([id, category]) => `
                        <div class="category-card-full" data-id="${id}">
                            <div class="category-header">
                                <div class="category-icon" style="background: ${category.color}20; color: ${category.color}">
                                    ${category.icon}
                                </div>
                                <div class="category-info">
                                    <h3>${category.name}</h3>
                                    <p class="category-type">${customCategories[id] ? 'Personnalisée' : 'Prédéfinie'}</p>
                                </div>
                            </div>
                            
                            <div class="category-stats">
                                <div class="stat-item">
                                    <i class="fas fa-key"></i>
                                    <span>${this.getTotalKeywords(id)} mots-clés</span>
                                </div>
                                <div class="stat-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>${this.getCategoryEmailCount(id)} emails</span>
                                </div>
                            </div>
                            
                            <div class="category-actions">
                                <button class="btn-icon" onclick="window.pageManager.editCategory('${id}')" title="Modifier">
                                    <i class="fas fa-edit"></i>
                                </button>
                                ${customCategories[id] ? `
                                    <button class="btn-icon danger" onclick="window.pageManager.deleteCategory('${id}')" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="page-footer">
                    <p class="help-text">
                        <i class="fas fa-info-circle"></i>
                        Les catégories permettent d'organiser automatiquement vos emails. 
                        Vous pouvez créer des catégories personnalisées et définir des mots-clés pour la détection automatique.
                    </p>
                </div>
            </div>
        `;
        
        // Ajouter les styles spécifiques
        this.addCategoriesStyles();
    }

    // =====================================
    // PAGE PARAMÈTRES (uniquement backup et config)
    // =====================================
    renderSettingsPage(container) {
        const backupStatus = window.backupService ? window.backupService.getStatus() : null;
        
        container.innerHTML = `
            <div class="settings-page">
                <div class="page-header">
                    <h1><i class="fas fa-cog"></i> Paramètres</h1>
                    <p class="page-subtitle">Configuration de l'application et sauvegarde</p>
                </div>
                
                <!-- Navigation des paramètres -->
                <div class="settings-navigation">
                    <button class="settings-nav-item active" onclick="window.pageManager.showSettingsSection('backup')">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Sauvegarde</span>
                    </button>
                    <button class="settings-nav-item" onclick="window.pageManager.showSettingsSection('app')">
                        <i class="fas fa-desktop"></i>
                        <span>Application</span>
                    </button>
                    <button class="settings-nav-item" onclick="window.pageManager.loadPage('categories')">
                        <i class="fas fa-tags"></i>
                        <span>Catégories</span>
                        <i class="fas fa-external-link-alt" style="margin-left: 8px; font-size: 12px;"></i>
                    </button>
                </div>
                
                <div class="settings-content">
                    <!-- Section Backup -->
                    <div class="settings-section active" id="backup-section">
                        <div class="section-header">
                            <h2><i class="fas fa-cloud-upload-alt"></i> Sauvegarde & Synchronisation</h2>
                            <span class="section-badge">${backupStatus?.provider === 'google' ? 'Google Drive' : 'OneDrive'}</span>
                        </div>
                        
                        <div class="section-content">
                            <div class="setting-item">
                                <div class="setting-control">
                                    <label class="switch">
                                        <input type="checkbox" id="backup-enabled" ${backupStatus?.enabled ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                    <div class="setting-info">
                                        <span class="setting-label">Activer la sauvegarde</span>
                                        <span class="setting-description">Sauvegarde automatique dans Documents</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="setting-item ${!backupStatus?.enabled ? 'disabled' : ''}">
                                <div class="setting-control">
                                    <label class="switch">
                                        <input type="checkbox" id="backup-auto" ${backupStatus?.autoBackup ? 'checked' : ''} 
                                               ${!backupStatus?.enabled ? 'disabled' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                    <div class="setting-info">
                                        <span class="setting-label">Sauvegarde automatique</span>
                                        <span class="setting-description">Sauvegarder automatiquement les modifications</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="setting-item ${!backupStatus?.enabled || !backupStatus?.autoBackup ? 'disabled' : ''}">
                                <div class="setting-control full-width">
                                    <label class="setting-label">Intervalle de sauvegarde</label>
                                    <div class="input-group">
                                        <input type="number" id="backup-interval" min="1" max="60" 
                                               value="${(backupStatus?.interval || 300000) / 60000}"
                                               ${!backupStatus?.enabled || !backupStatus?.autoBackup ? 'disabled' : ''}>
                                        <span class="input-suffix">minutes</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-control">
                                    <label class="checkbox-group">
                                        <input type="checkbox" id="backup-categories" checked>
                                        <i class="fas fa-check"></i>
                                        <span>Sauvegarder les catégories</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-control">
                                    <label class="checkbox-group">
                                        <input type="checkbox" id="backup-tasks" checked>
                                        <i class="fas fa-check"></i>
                                        <span>Sauvegarder les tâches</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="backup-status-card">
                                <div class="status-header">
                                    <i class="fas fa-info-circle"></i>
                                    <h3>État de la sauvegarde</h3>
                                </div>
                                <div class="status-items">
                                    <div class="status-item">
                                        <span class="status-label">Statut:</span>
                                        <span class="status-value ${backupStatus?.enabled ? 'active' : 'inactive'}">
                                            ${backupStatus?.enabled ? 'Activé' : 'Désactivé'}
                                        </span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">Dernière sauvegarde:</span>
                                        <span class="status-value">${backupStatus?.lastBackup || 'Jamais'}</span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">Emplacement:</span>
                                        <span class="status-value">Documents/EmailSortPro/Backups</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="button-group">
                                <button class="btn btn-primary" onclick="window.pageManager.saveBackupSettings()">
                                    <i class="fas fa-save"></i>
                                    Sauvegarder les paramètres
                                </button>
                                <button class="btn btn-secondary" onclick="window.pageManager.performManualBackup()"
                                        ${!backupStatus?.enabled ? 'disabled' : ''}>
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    Backup manuel
                                </button>
                                <button class="btn btn-warning" onclick="window.pageManager.restoreFromBackup()">
                                    <i class="fas fa-cloud-download-alt"></i>
                                    Restaurer
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Section Application -->
                    <div class="settings-section" id="app-section">
                        <div class="section-header">
                            <h2><i class="fas fa-desktop"></i> Application</h2>
                        </div>
                        
                        <div class="section-content">
                            <div class="app-info-card">
                                <h3>Informations</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Version:</span>
                                        <span class="info-value">3.0.1</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Provider:</span>
                                        <span class="info-value">${window.app?.activeProvider || 'Non connecté'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Utilisateur:</span>
                                        <span class="info-value">${window.app?.user?.email || 'Non connecté'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Emails scannés:</span>
                                        <span class="info-value">${window.emailScanner?.getAllEmails().length || 0}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Tâches créées:</span>
                                        <span class="info-value">${window.taskManager?.getAllTasks().length || 0}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Catégories actives:</span>
                                        <span class="info-value">${Object.keys(window.categoryManager?.getCategories() || {}).length}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="danger-zone">
                                <h3><i class="fas fa-exclamation-triangle"></i> Zone dangereuse</h3>
                                <p>Ces actions sont irréversibles. Procédez avec prudence.</p>
                                
                                <div class="button-group">
                                    <button class="btn btn-secondary" onclick="window.pageManager.clearLocalData()">
                                        <i class="fas fa-trash"></i>
                                        Effacer les données locales
                                    </button>
                                    <button class="btn btn-danger" onclick="window.app?.logout()">
                                        <i class="fas fa-sign-out-alt"></i>
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter les styles
        this.addSettingsStyles();
        
        // Attacher les événements
        this.attachSettingsEvents();
    }

    // =====================================
    // NAVIGATION DANS LES PARAMÈTRES
    // =====================================
    showSettingsSection(sectionName) {
        // Mettre à jour la navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.closest('.settings-nav-item').classList.add('active');
        
        // Afficher la section correspondante
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`)?.classList.add('active');
    }

    // =====================================
    // MÉTHODES POUR LES CATÉGORIES
    // =====================================
    getTotalKeywords(categoryId) {
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        return keywords.absolute.length + 
               keywords.strong.length + 
               keywords.weak.length + 
               keywords.exclusions.length;
    }

    getCategoryEmailCount(categoryId) {
        const emails = window.emailScanner?.getAllEmails() || [];
        return emails.filter(email => email.category === categoryId).length;
    }

    editCategory(categoryId) {
        // Si CategoriesPage existe, utiliser sa méthode
        if (window.categoriesPage && window.categoriesPage.openModal) {
            window.categoriesPage.openModal(categoryId);
        } else {
            alert('Édition de catégorie: ' + categoryId);
        }
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.loadPage('categories'); // Recharger la page
        }
    }

    showCreateCategoryModal() {
        if (window.categoriesPage && window.categoriesPage.showCreateModal) {
            window.categoriesPage.showCreateModal();
        } else {
            alert('Création de catégorie');
        }
    }

    // =====================================
    // MÉTHODES BACKUP
    // =====================================
    saveBackupSettings() {
        const config = {
            enabled: document.getElementById('backup-enabled').checked,
            autoBackup: document.getElementById('backup-auto').checked,
            backupInterval: parseInt(document.getElementById('backup-interval').value) * 60000,
            includeCategories: document.getElementById('backup-categories').checked,
            includeTasks: document.getElementById('backup-tasks').checked
        };
        
        if (window.backupService) {
            window.backupService.updateConfig(config);
            
            // Rafraîchir la page
            this.loadPage('settings');
        }
    }

    async performManualBackup() {
        if (window.backupService) {
            const button = event.target;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Backup en cours...';
            
            try {
                await window.backupService.backup();
                // Rafraîchir pour mettre à jour le statut
                this.loadPage('settings');
            } catch (error) {
                console.error('[PageManager] Backup error:', error);
            }
        }
    }

    async restoreFromBackup() {
        if (confirm('Êtes-vous sûr de vouloir restaurer depuis le dernier backup ?\nLes données actuelles seront remplacées.')) {
            if (window.backupService) {
                const button = event.target;
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restauration...';
                
                try {
                    await window.backupService.restore();
                    
                    if (window.uiManager) {
                        window.uiManager.showToast('✅ Données restaurées avec succès', 'success');
                    }
                    
                    // Recharger la page actuelle
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    
                } catch (error) {
                    console.error('[PageManager] Restore error:', error);
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Restaurer';
                }
            }
        }
    }

    clearLocalData() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données locales ?\nCette action est irréversible.')) {
            // Effacer les tâches
            if (window.taskManager) {
                window.taskManager.clearAllTasks();
            }
            
            // Effacer les catégories personnalisées
            if (window.categoryManager) {
                const customCategories = window.categoryManager.getCustomCategories();
                Object.keys(customCategories).forEach(id => {
                    window.categoryManager.deleteCustomCategory(id);
                });
            }
            
            // Effacer les emails scannés
            if (window.emailScanner) {
                window.emailScanner.clearCache();
            }
            
            if (window.uiManager) {
                window.uiManager.showToast('✅ Données locales effacées', 'success');
            }
            
            // Recharger la page
            setTimeout(() => {
                this.loadPage('dashboard');
            }, 1000);
        }
    }

    // =====================================
    // EVENTS SETTINGS
    // =====================================
    attachSettingsEvents() {
        // Toggle de l'activation du backup
        const backupEnabled = document.getElementById('backup-enabled');
        if (backupEnabled) {
            backupEnabled.addEventListener('change', (e) => {
                const isEnabled = e.target.checked;
                const dependentElements = document.querySelectorAll('.setting-item.disabled');
                
                if (isEnabled) {
                    dependentElements.forEach(el => el.classList.remove('disabled'));
                    document.getElementById('backup-auto').disabled = false;
                    if (document.getElementById('backup-auto').checked) {
                        document.getElementById('backup-interval').disabled = false;
                    }
                } else {
                    document.getElementById('backup-auto').disabled = true;
                    document.getElementById('backup-interval').disabled = true;
                }
            });
        }
        
        // Toggle du backup automatique
        const backupAuto = document.getElementById('backup-auto');
        if (backupAuto) {
            backupAuto.addEventListener('change', (e) => {
                const isAuto = e.target.checked;
                document.getElementById('backup-interval').disabled = !isAuto;
                
                const intervalItem = document.getElementById('backup-interval').closest('.setting-item');
                if (isAuto) {
                    intervalItem.classList.remove('disabled');
                } else {
                    intervalItem.classList.add('disabled');
                }
            });
        }
    }

    // =====================================
    // PAGE EMAILS
    // =====================================
    renderEmailsPage(container) {
        const emails = window.emailScanner?.getAllEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        // Compter les emails par catégorie
        const categoryCounts = {};
        let totalEmails = 0;
        
        emails.forEach(email => {
            totalEmails++;
            const cat = email.category || 'other';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        
        container.innerHTML = `
            <div class="emails-page">
                <div class="page-header">
                    <h1><i class="fas fa-inbox"></i> Emails scannés</h1>
                    <div class="header-actions">
                        <span class="email-count">${totalEmails} emails</span>
                        <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                            <i class="fas fa-search"></i> Scanner
                        </button>
                    </div>
                </div>
                
                <!-- Filtres par catégorie -->
                <div class="category-filters">
                    ${window.categoriesPage ? window.categoriesPage.buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories) : ''}
                </div>
                
                <!-- Liste des emails -->
                <div class="emails-list" id="emails-container">
                    ${this.renderEmailsList(emails)}
                </div>
            </div>
        `;
        
        // Attacher les événements de filtre
        if (window.categoriesPage) {
            window.categoriesPage.currentCategory = 'all';
            window.categoriesPage.filterByCategory = (categoryId) => {
                this.filterEmailsByCategory(categoryId);
            };
        }
    }

    renderEmailsList(emails, categoryFilter = 'all') {
        const filteredEmails = categoryFilter === 'all' ? 
            emails : 
            emails.filter(email => (email.category || 'other') === categoryFilter);
        
        if (filteredEmails.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #CBD5E0; margin-bottom: 16px;"></i>
                    <p>Aucun email dans cette catégorie</p>
                </div>
            `;
        }
        
        return filteredEmails.map(email => `
            <div class="email-item" data-category="${email.category || 'other'}">
                <div class="email-header">
                    <div class="email-from">
                        <strong>${email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu'}</strong>
                        <span class="email-address">${email.from?.emailAddress?.address || ''}</span>
                    </div>
                    <div class="email-date">
                        ${new Date(email.receivedDateTime).toLocaleDateString('fr-FR')}
                    </div>
                </div>
                <div class="email-subject">${email.subject || '(Sans sujet)'}</div>
                <div class="email-preview">${email.bodyPreview || ''}</div>
                <div class="email-footer">
                    <span class="category-badge" style="background: ${this.getCategoryColor(email.category)}">
                        ${this.getCategoryInfo(email.category).icon} ${this.getCategoryInfo(email.category).name}
                    </span>
                    ${email.hasAttachments ? '<span class="attachment-badge"><i class="fas fa-paperclip"></i></span>' : ''}
                </div>
            </div>
        `).join('');
    }

    filterEmailsByCategory(categoryId) {
        const emails = window.emailScanner?.getAllEmails() || [];
        const container = document.getElementById('emails-container');
        
        if (container) {
            container.innerHTML = this.renderEmailsList(emails, categoryId);
        }
        
        // Mettre à jour l'état actif des boutons
        document.querySelectorAll('.status-pill-harmonized-twolines').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-category-id') === categoryId);
        });
        
        if (window.categoriesPage) {
            window.categoriesPage.currentCategory = categoryId;
        }
    }

    // =====================================
    // DASHBOARD (fallback)
    // =====================================
    renderDashboard(container) {
        const stats = this.getStats();
        
        container.innerHTML = `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>Bienvenue dans EmailSortPro</h1>
                    <p>Gérez efficacement vos emails avec l'IA</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #3B82F6;">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.totalEmails}</div>
                            <div class="stat-label">Emails scannés</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #10B981;">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.totalTasks}</div>
                            <div class="stat-label">Tâches créées</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #F59E0B;">
                            <i class="fas fa-tags"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.totalCategories}</div>
                            <div class="stat-label">Catégories</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #8B5CF6;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.pendingTasks}</div>
                            <div class="stat-label">Tâches en attente</div>
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h2>Actions rapides</h2>
                    <div class="actions-grid">
                        <button class="action-card" onclick="window.pageManager.loadPage('scanner')">
                            <i class="fas fa-search"></i>
                            <span>Scanner des emails</span>
                        </button>
                        <button class="action-card" onclick="window.pageManager.loadPage('tasks')">
                            <i class="fas fa-list"></i>
                            <span>Voir les tâches</span>
                        </button>
                        <button class="action-card" onclick="window.pageManager.loadPage('categories')">
                            <i class="fas fa-tags"></i>
                            <span>Gérer les catégories</span>
                        </button>
                        <button class="action-card" onclick="window.pageManager.loadPage('settings')">
                            <i class="fas fa-cog"></i>
                            <span>Paramètres & Backup</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // =====================================
    // MÉTHODES UTILITAIRES
    // =====================================
    updateActiveNavigation(pageName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });
    }

    addToHistory(pageName) {
        this.history.push(pageName);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    getPreviousPage() {
        return this.history.length > 1 ? this.history[this.history.length - 2] : null;
    }

    refreshCurrentPage() {
        if (this.currentPage) {
            this.loadPage(this.currentPage, false);
        }
    }

    getStats() {
        const stats = {
            totalEmails: 0,
            totalTasks: 0,
            totalCategories: 0,
            pendingTasks: 0,
            completedTasks: 0
        };

        // Emails
        if (window.emailScanner) {
            stats.totalEmails = window.emailScanner.getAllEmails().length;
        }

        // Tâches
        if (window.taskManager) {
            const tasks = window.taskManager.getAllTasks();
            stats.totalTasks = tasks.length;
            stats.pendingTasks = tasks.filter(t => !t.completed).length;
            stats.completedTasks = tasks.filter(t => t.completed).length;
        }

        // Catégories
        if (window.categoryManager) {
            stats.totalCategories = Object.keys(window.categoryManager.getCategories()).length;
        }

        return stats;
    }

    getCategoryInfo(categoryId) {
        if (!categoryId || categoryId === 'other') {
            return { name: 'Autre', icon: '📌', color: '#6B7280' };
        }
        
        const category = window.categoryManager?.getCategory(categoryId);
        if (category) {
            return category;
        }
        
        return { name: categoryId, icon: '📁', color: '#6B7280' };
    }

    getCategoryColor(categoryId) {
        const info = this.getCategoryInfo(categoryId);
        return info.color || '#6B7280';
    }

    // =====================================
    // STYLES
    // =====================================
    addSettingsStyles() {
        if (document.getElementById('settings-page-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'settings-page-styles';
        styles.textContent = `
            /* Page Settings */
            .settings-page {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .page-header {
                margin-bottom: 32px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .page-header h1 {
                font-size: 32px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 0;
            }
            
            .page-subtitle {
                color: #6b7280;
                font-size: 16px;
                margin-top: 8px;
            }
            
            /* Navigation des paramètres */
            .settings-navigation {
                display: flex;
                gap: 16px;
                border-bottom: 2px solid #e5e7eb;
                margin-bottom: 32px;
                padding-bottom: 0;
            }
            
            .settings-nav-item {
                padding: 12px 24px;
                border: none;
                background: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 15px;
                font-weight: 500;
                color: #6b7280;
                transition: all 0.3s;
                position: relative;
                border-bottom: 3px solid transparent;
                margin-bottom: -2px;
            }
            
            .settings-nav-item:hover {
                color: #374151;
                background: #f9fafb;
            }
            
            .settings-nav-item.active {
                color: #3b82f6;
                font-weight: 600;
                border-bottom-color: #3b82f6;
            }
            
            .settings-nav-item i {
                font-size: 16px;
            }
            
            .settings-content {
                background: white;
                border-radius: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .settings-section {
                display: none;
            }
            
            .settings-section.active {
                display: block;
            }
            
            .section-header {
                padding: 24px;
                background: linear-gradient(135deg, #f8fafc 0%, #f3f4f6 100%);
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .section-header h2 {
                font-size: 20px;
                font-weight: 600;
                color: #374151;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .section-badge {
                background: #3b82f6;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .section-content {
                padding: 32px;
            }
            
            /* Setting Items */
            .setting-item {
                margin-bottom: 24px;
                transition: opacity 0.3s ease;
            }
            
            .setting-item.disabled {
                opacity: 0.5;
                pointer-events: none;
            }
            
            .setting-item:last-child {
                margin-bottom: 0;
            }
            
            .setting-control {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .setting-control.full-width {
                flex-direction: column;
                align-items: stretch;
                gap: 8px;
            }
            
            .setting-info {
                flex: 1;
            }
            
            .setting-label {
                font-weight: 600;
                color: #374151;
                display: block;
                margin-bottom: 4px;
                font-size: 15px;
            }
            
            .setting-description {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.4;
            }
            
            /* Switch Toggle */
            .switch {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 26px;
                flex-shrink: 0;
            }
            
            .switch input {
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
                background-color: #cbd5e1;
                transition: .3s;
                border-radius: 26px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            }
            
            input:checked + .slider {
                background-color: #3b82f6;
            }
            
            input:checked + .slider:before {
                transform: translateX(22px);
            }
            
            input:disabled + .slider {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Checkbox Group */
            .checkbox-group {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                user-select: none;
                padding: 8px 0;
            }
            
            .checkbox-group input[type="checkbox"] {
                width: 18px;
                height: 18px;
                margin: 0;
                cursor: pointer;
            }
            
            .checkbox-group i {
                font-size: 16px;
                color: #3b82f6;
            }
            
            /* Input Group */
            .input-group {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .input-group input {
                flex: 1;
                padding: 10px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 15px;
                transition: border-color 0.3s;
            }
            
            .input-group input:focus {
                outline: none;
                border-color: #3b82f6;
            }
            
            .input-group input:disabled {
                background: #f3f4f6;
                cursor: not-allowed;
            }
            
            .input-suffix {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
            }
            
            /* Status Card */
            .backup-status-card {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .status-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 16px;
            }
            
            .status-header i {
                color: #0369a1;
                font-size: 20px;
            }
            
            .status-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #0c4a6e;
            }
            
            .status-items {
                display: grid;
                gap: 12px;
            }
            
            .status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
            }
            
            .status-label {
                font-weight: 500;
                color: #075985;
                font-size: 14px;
            }
            
            .status-value {
                font-weight: 600;
                color: #0c4a6e;
                font-size: 14px;
            }
            
            .status-value.active {
                color: #059669;
            }
            
            .status-value.inactive {
                color: #dc2626;
            }
            
            /* App Info Card */
            .app-info-card {
                background: #f9fafb;
                padding: 24px;
                border-radius: 12px;
                margin-bottom: 24px;
            }
            
            .app-info-card h3 {
                margin: 0 0 20px 0;
                font-size: 18px;
                font-weight: 600;
                color: #374151;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .info-label {
                color: #6b7280;
                font-size: 13px;
                font-weight: 500;
            }
            
            .info-value {
                color: #374151;
                font-size: 15px;
                font-weight: 600;
            }
            
            /* Danger Zone */
            .danger-zone {
                background: #fef2f2;
                border: 1px solid #fecaca;
                padding: 24px;
                border-radius: 12px;
            }
            
            .danger-zone h3 {
                color: #dc2626;
                margin: 0 0 12px 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .danger-zone p {
                color: #7f1d1d;
                margin: 0 0 20px 0;
                font-size: 14px;
            }
            
            /* Buttons */
            .button-group {
                display: flex;
                gap: 12px;
                margin-top: 24px;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s;
                text-decoration: none;
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover:not(:disabled) {
                background: #2563eb;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-secondary {
                background: #e5e7eb;
                color: #374151;
            }
            
            .btn-secondary:hover:not(:disabled) {
                background: #d1d5db;
            }
            
            .btn-warning {
                background: #f59e0b;
                color: white;
            }
            
            .btn-warning:hover:not(:disabled) {
                background: #d97706;
            }
            
            .btn-danger {
                background: #ef4444;
                color: white;
            }
            
            .btn-danger:hover:not(:disabled) {
                background: #dc2626;
            }
            
            /* Categories Page */
            .categories-management-page {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .categories-stats {
                display: flex;
                gap: 24px;
                margin-bottom: 32px;
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .stat-mini {
                text-align: center;
                flex: 1;
            }
            
            .stat-mini .stat-value {
                display: block;
                font-size: 32px;
                font-weight: 700;
                color: #3b82f6;
                margin-bottom: 4px;
            }
            
            .stat-mini .stat-label {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 32px;
            }
            
            .category-card-full {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
                transition: all 0.3s;
            }
            
            .category-card-full:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .category-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 20px;
            }
            
            .category-icon {
                width: 56px;
                height: 56px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                flex-shrink: 0;
            }
            
            .category-info h3 {
                margin: 0 0 4px 0;
                font-size: 18px;
                font-weight: 600;
                color: #111827;
            }
            
            .category-type {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
            }
            
            .category-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 16px;
                padding: 16px 0;
                border-top: 1px solid #f3f4f6;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .category-stats .stat-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #6b7280;
            }
            
            .category-stats .stat-item i {
                color: #3b82f6;
            }
            
            .category-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }
            
            .btn-icon {
                width: 36px;
                height: 36px;
                border: 1px solid #e5e7eb;
                background: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                color: #6b7280;
            }
            
            .btn-icon:hover {
                background: #f3f4f6;
                color: #374151;
                border-color: #d1d5db;
            }
            
            .btn-icon.danger:hover {
                background: #fee2e2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .page-footer {
                margin-top: 32px;
                padding: 24px;
                background: #f9fafb;
                border-radius: 12px;
                text-align: center;
            }
            
            .help-text {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .help-text i {
                color: #3b82f6;
            }
            
            /* Emails Page */
            .emails-page {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header-actions {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .email-count {
                background: #e5e7eb;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
            }
            
            .category-filters {
                margin: 24px 0;
                padding: 16px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .emails-list {
                display: grid;
                gap: 12px;
            }
            
            .email-item {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s;
                cursor: pointer;
            }
            
            .email-item:hover {
                border-color: #3b82f6;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .email-from strong {
                color: #111827;
                font-size: 16px;
            }
            
            .email-address {
                color: #6b7280;
                font-size: 14px;
                margin-left: 8px;
            }
            
            .email-date {
                color: #9ca3af;
                font-size: 14px;
            }
            
            .email-subject {
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
                font-size: 15px;
            }
            
            .email-preview {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.5;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                margin-bottom: 12px;
            }
            
            .email-footer {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .category-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
                color: white;
            }
            
            .attachment-badge {
                color: #6b7280;
                font-size: 14px;
            }
            
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .empty-state p {
                font-size: 16px;
                margin: 0;
            }
            
            /* Dashboard */
            .dashboard-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            
            .dashboard-header {
                text-align: center;
                margin-bottom: 48px;
            }
            
            .dashboard-header h1 {
                font-size: 36px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 12px;
            }
            
            .dashboard-header p {
                font-size: 18px;
                color: #6b7280;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 24px;
                margin-bottom: 48px;
            }
            
            .stat-card {
                background: white;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #f3f4f6;
                display: flex;
                align-items: center;
                gap: 20px;
                transition: all 0.3s;
            }
            
            .stat-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .stat-icon {
                width: 64px;
                height: 64px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 28px;
                flex-shrink: 0;
            }
            
            .stat-content {
                flex: 1;
            }
            
            .stat-value {
                font-size: 32px;
                font-weight: 700;
                color: #111827;
                line-height: 1.2;
            }
            
            .stat-label {
                font-size: 14px;
                color: #6b7280;
                margin-top: 4px;
            }
            
            .quick-actions {
                margin-top: 48px;
            }
            
            .quick-actions h2 {
                font-size: 24px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 24px;
            }
            
            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            
            .action-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 24px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }
            
            .action-card i {
                font-size: 32px;
                color: #3b82f6;
            }
            
            .action-card span {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
            }
            
            .action-card:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .settings-navigation {
                    flex-wrap: wrap;
                }
                
                .settings-nav-item {
                    flex: 1;
                    min-width: 120px;
                    padding: 10px 16px;
                    font-size: 14px;
                }
                
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .button-group {
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                    justify-content: center;
                }
                
                .categories-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
                
                .actions-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    addCategoriesStyles() {
        if (document.getElementById('categories-page-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categories-page-styles';
        styles.textContent = `
            /* Styles déjà inclus dans addSettingsStyles */
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale
window.pageManager = new PageManager();

console.log('✅ PageManager loaded with backup integration and separate categories/settings pages');
                
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .button-group {
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                    justify-content: center;
                }
                
                .categories-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
                
                .actions-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
