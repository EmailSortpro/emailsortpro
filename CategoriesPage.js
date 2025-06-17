// CategoriesPage.js - Version 22.0 - Avec vue Paramètres et Backup intégré
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v22.0 avec Backup...');

// Nettoyer toute instance précédente
if (window.categoriesPage) {
    console.log('[CategoriesPage] 🧹 Nettoyage instance précédente...');
    delete window.categoriesPage;
}

class CategoriesPageV22 {
    constructor() {
        // État général
        this.currentView = 'categories'; // 'categories' ou 'settings'
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.viewMode = 'grid';
        
        // Couleurs disponibles
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8'
        ];
        
        // Configuration backup par défaut
        this.backupSettings = this.loadBackupSettings();
        
        console.log('[CategoriesPage] 🎨 Interface moderne v22.0 avec Backup initialisée');
    }

    // ================================================
    // RENDU PRINCIPAL - ROUTER ENTRE VUES
    // ================================================
    render(container, view = null) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant');
            return;
        }

        // Déterminer la vue à afficher
        if (view) {
            this.currentView = view;
        } else {
            // Détection automatique basée sur le contexte
            const isSettingsPage = window.pageManager?.currentPage === 'settings';
            this.currentView = isSettingsPage ? 'settings' : 'categories';
        }

        console.log('[CategoriesPage] 📍 Rendu vue:', this.currentView);

        try {
            if (this.currentView === 'settings') {
                this.renderSettingsView(container);
            } else {
                this.renderCategoriesView(container);
            }
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            container.innerHTML = this.renderError();
        }
    }

    // ================================================
    // VUE CATEGORIES - INCHANGÉE
    // ================================================
    renderCategoriesView(container) {
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
                    <button class="btn-create" onclick="window.categoriesPageV22.showCreateModal()">
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
                               onkeyup="window.categoriesPageV22.handleSearch(this.value)">
                    </div>
                </div>
                
                <!-- Grille de catégories -->
                <div class="categories-grid" id="categories-container">
                    ${this.renderCategories(categories, settings.activeCategories)}
                </div>
            </div>
        `;
    }

    // ================================================
    // VUE PARAMÈTRES - NOUVELLE AVEC BACKUP
    // ================================================
    renderSettingsView(container) {
        const backupStatus = window.backupService?.getStatus() || {};
        const backupConfig = this.backupSettings;
        
        container.innerHTML = `
            <div class="settings-modern">
                <!-- Header -->
                <div class="header-modern">
                    <div class="header-content">
                        <h1>Paramètres <span class="emoji">⚙️</span></h1>
                        <p class="subtitle">Configuration de l'application</p>
                    </div>
                </div>
                
                <!-- Navigation des sections -->
                <div class="settings-nav">
                    <button class="nav-item active" data-section="general" onclick="window.categoriesPageV22.switchSettingsSection('general')">
                        <i class="fas fa-cog"></i>
                        <span>Général</span>
                    </button>
                    <button class="nav-item" data-section="backup" onclick="window.categoriesPageV22.switchSettingsSection('backup')">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Sauvegarde</span>
                    </button>
                    <button class="nav-item" data-section="categories" onclick="window.categoriesPageV22.switchSettingsSection('categories')">
                        <i class="fas fa-tags"></i>
                        <span>Catégories</span>
                    </button>
                    <button class="nav-item" data-section="about" onclick="window.categoriesPageV22.switchSettingsSection('about')">
                        <i class="fas fa-info-circle"></i>
                        <span>À propos</span>
                    </button>
                </div>
                
                <!-- Contenu des sections -->
                <div class="settings-content">
                    <!-- Section Général -->
                    <div class="settings-section active" id="section-general">
                        ${this.renderGeneralSettings()}
                    </div>
                    
                    <!-- Section Backup -->
                    <div class="settings-section" id="section-backup">
                        ${this.renderBackupSettings(backupStatus, backupConfig)}
                    </div>
                    
                    <!-- Section Catégories -->
                    <div class="settings-section" id="section-categories">
                        ${this.renderCategoriesSettings()}
                    </div>
                    
                    <!-- Section À propos -->
                    <div class="settings-section" id="section-about">
                        ${this.renderAboutSection()}
                    </div>
                </div>
            </div>
        `;
        
        // Initialiser les événements backup
        this.initializeBackupEvents();
    }

    // ================================================
    // SECTIONS PARAMÈTRES
    // ================================================
    renderGeneralSettings() {
        const appConfig = window.AppConfig || {};
        
        return `
            <div class="section-card">
                <h2><i class="fas fa-globe"></i> Paramètres généraux</h2>
                
                <div class="setting-group">
                    <h3>Interface</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Thème de l'application</label>
                            <span class="setting-description">Choisissez l'apparence de l'interface</span>
                        </div>
                        <select class="setting-select" onchange="window.categoriesPageV22.changeTheme(this.value)">
                            <option value="light">Clair</option>
                            <option value="dark" disabled>Sombre (bientôt)</option>
                            <option value="auto" disabled>Automatique (bientôt)</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Langue</label>
                            <span class="setting-description">Langue de l'interface</span>
                        </div>
                        <select class="setting-select">
                            <option value="fr">Français</option>
                            <option value="en" disabled>English (bientôt)</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-group">
                    <h3>Comportement</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Nombre d'emails par page</label>
                            <span class="setting-description">Emails affichés simultanément</span>
                        </div>
                        <select class="setting-select" onchange="window.categoriesPageV22.changeEmailsPerPage(this.value)">
                            <option value="25">25</option>
                            <option value="50" selected>50</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Actualisation automatique</label>
                            <span class="setting-description">Rafraîchir la liste des emails</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked onchange="window.categoriesPageV22.toggleAutoRefresh(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    renderBackupSettings(status, config) {
        const provider = status.provider || window.app?.activeProvider || 'unknown';
        const providerName = provider === 'microsoft' ? 'OneDrive' : 
                           provider === 'google' ? 'Google Drive' : 
                           'Non configuré';
        
        return `
            <div class="section-card">
                <h2><i class="fas fa-cloud-upload-alt"></i> Sauvegarde automatique</h2>
                
                <!-- État actuel -->
                <div class="backup-status-card ${status.isInitialized ? 'active' : 'inactive'}">
                    <div class="status-icon">
                        ${status.isInitialized ? 
                            '<i class="fas fa-check-circle"></i>' : 
                            '<i class="fas fa-exclamation-circle"></i>'}
                    </div>
                    <div class="status-info">
                        <h3>État de la sauvegarde</h3>
                        <p>Provider: <strong>${providerName}</strong></p>
                        <p>Dernière sauvegarde: <strong>${status.lastBackup || 'Jamais'}</strong></p>
                        ${status.backupInProgress ? 
                            '<p class="status-progress"><i class="fas fa-spinner fa-spin"></i> Sauvegarde en cours...</p>' : ''}
                    </div>
                    <div class="status-actions">
                        <button class="btn-modern primary" onclick="window.categoriesPageV22.performManualBackup()" 
                                ${!status.isInitialized || status.backupInProgress ? 'disabled' : ''}>
                            <i class="fas fa-save"></i> Sauvegarder maintenant
                        </button>
                    </div>
                </div>
                
                <!-- Configuration -->
                <div class="setting-group">
                    <h3>Configuration de la sauvegarde</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Sauvegarde automatique</label>
                            <span class="setting-description">Active la sauvegarde périodique dans le dossier Documents</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" 
                                   ${config.enabled ? 'checked' : ''} 
                                   onchange="window.categoriesPageV22.toggleBackup(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="setting-item" ${!config.enabled ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                        <div class="setting-info">
                            <label>Fréquence de sauvegarde</label>
                            <span class="setting-description">Intervalle entre les sauvegardes automatiques</span>
                        </div>
                        <select class="setting-select" onchange="window.categoriesPageV22.changeBackupInterval(this.value)">
                            <option value="60000" ${config.backupInterval === 60000 ? 'selected' : ''}>Chaque minute (test)</option>
                            <option value="300000" ${config.backupInterval === 300000 ? 'selected' : ''}>5 minutes</option>
                            <option value="900000" ${config.backupInterval === 900000 ? 'selected' : ''}>15 minutes</option>
                            <option value="1800000" ${config.backupInterval === 1800000 ? 'selected' : ''}>30 minutes</option>
                            <option value="3600000" ${config.backupInterval === 3600000 ? 'selected' : ''}>1 heure</option>
                            <option value="86400000" ${config.backupInterval === 86400000 ? 'selected' : ''}>Quotidien</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Contenu de la sauvegarde</label>
                            <span class="setting-description">Éléments à inclure dans les backups</span>
                        </div>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" 
                                       ${config.includeCategories ? 'checked' : ''}
                                       onchange="window.categoriesPageV22.toggleBackupContent('categories', this.checked)">
                                <span>Catégories personnalisées</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" 
                                       ${config.includeTasks ? 'checked' : ''}
                                       onchange="window.categoriesPageV22.toggleBackupContent('tasks', this.checked)">
                                <span>Tâches extraites</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Nombre de backups conservés</label>
                            <span class="setting-description">Backups historiques dans Documents/EmailSortPro/Backups</span>
                        </div>
                        <select class="setting-select" onchange="window.categoriesPageV22.changeMaxBackups(this.value)">
                            <option value="5" ${config.maxBackups === 5 ? 'selected' : ''}>5 backups</option>
                            <option value="10" ${config.maxBackups === 10 ? 'selected' : ''}>10 backups</option>
                            <option value="20" ${config.maxBackups === 20 ? 'selected' : ''}>20 backups</option>
                            <option value="50" ${config.maxBackups === 50 ? 'selected' : ''}>50 backups</option>
                        </select>
                    </div>
                </div>
                
                <!-- Actions avancées -->
                <div class="setting-group">
                    <h3>Actions avancées</h3>
                    
                    <div class="backup-actions">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.showRestoreModal()">
                            <i class="fas fa-download"></i> Restaurer un backup
                        </button>
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.openBackupFolder()">
                            <i class="fas fa-folder-open"></i> Ouvrir le dossier de sauvegarde
                        </button>
                    </div>
                    
                    <div class="backup-info">
                        <p><i class="fas fa-info-circle"></i> Les sauvegardes sont stockées dans :</p>
                        <code>${provider === 'microsoft' ? 'OneDrive' : 'Google Drive'}/Documents/EmailSortPro/Backups/</code>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoriesSettings() {
        const categories = window.categoryManager?.getCategories() || {};
        const settings = this.loadSettings();
        
        return `
            <div class="section-card">
                <h2><i class="fas fa-tags"></i> Gestion des catégories</h2>
                
                <div class="categories-mini-grid">
                    ${Object.entries(categories).map(([id, category]) => {
                        const isActive = settings.activeCategories === null || settings.activeCategories.includes(id);
                        const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
                        
                        return `
                            <div class="category-mini-card">
                                <div class="mini-header">
                                    <span class="mini-icon">${category.icon}</span>
                                    <span class="mini-name">${category.name}</span>
                                </div>
                                <div class="mini-actions">
                                    <button class="btn-mini ${isActive ? 'active' : ''}" 
                                            onclick="window.categoriesPageV22.toggleCategory('${id}')"
                                            title="${isActive ? 'Désactiver' : 'Activer'}">
                                        <i class="fas fa-power-off"></i>
                                    </button>
                                    <button class="btn-mini ${isPreselected ? 'active' : ''}" 
                                            onclick="window.categoriesPageV22.togglePreselection('${id}')"
                                            title="${isPreselected ? 'Retirer de la pré-sélection' : 'Ajouter à la pré-sélection'}">
                                        <i class="fas fa-check-square"></i>
                                    </button>
                                    <button class="btn-mini" 
                                            onclick="window.categoriesPageV22.openModal('${id}')"
                                            title="Configurer">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="categories-actions">
                    <button class="btn-modern primary" onclick="window.categoriesPageV22.switchToCategories()">
                        <i class="fas fa-th"></i> Voir toutes les catégories
                    </button>
                    <button class="btn-modern secondary" onclick="window.categoriesPageV22.showCreateModal()">
                        <i class="fas fa-plus"></i> Nouvelle catégorie
                    </button>
                </div>
            </div>
        `;
    }

    renderAboutSection() {
        const appConfig = window.AppConfig || {};
        
        return `
            <div class="section-card">
                <h2><i class="fas fa-info-circle"></i> À propos d'EmailSortPro</h2>
                
                <div class="about-content">
                    <div class="app-logo">
                        <div class="logo-icon">📧</div>
                        <h3>EmailSortPro</h3>
                        <p class="version">Version ${appConfig.app?.version || '3.0.0'}</p>
                    </div>
                    
                    <div class="about-info">
                        <p>EmailSortPro est votre assistant intelligent pour organiser et gérer vos emails avec Microsoft Outlook et Gmail.</p>
                        
                        <div class="features-list">
                            <h4>Fonctionnalités principales :</h4>
                            <ul>
                                <li><i class="fas fa-check"></i> Catégorisation automatique des emails</li>
                                <li><i class="fas fa-check"></i> Extraction intelligente des tâches</li>
                                <li><i class="fas fa-check"></i> Sauvegarde automatique dans le cloud</li>
                                <li><i class="fas fa-check"></i> Interface moderne et intuitive</li>
                                <li><i class="fas fa-check"></i> Support multi-comptes (Outlook & Gmail)</li>
                            </ul>
                        </div>
                        
                        <div class="about-footer">
                            <p>© 2024 EmailSortPro - Tous droits réservés</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================
    loadBackupSettings() {
        const defaultSettings = {
            enabled: true,
            autoBackup: true,
            backupInterval: 300000, // 5 minutes par défaut
            includeCategories: true,
            includeTasks: true,
            maxBackups: 10
        };
        
        // Charger depuis backupService si disponible
        if (window.backupService?.config) {
            return { ...defaultSettings, ...window.backupService.config };
        }
        
        // Sinon charger depuis localStorage
        try {
            const saved = localStorage.getItem('emailsortpro_backup_config');
            if (saved) {
                return { ...defaultSettings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur chargement config backup:', error);
        }
        
        return defaultSettings;
    }

    saveBackupSettings(settings) {
        this.backupSettings = settings;
        
        // Mettre à jour backupService si disponible
        if (window.backupService) {
            window.backupService.updateConfig(settings);
        } else {
            // Sauvegarder dans localStorage
            try {
                localStorage.setItem('emailsortpro_backup_config', JSON.stringify(settings));
            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde config backup:', error);
            }
        }
    }

    async performManualBackup() {
        console.log('[CategoriesPage] 🔄 Déclenchement backup manuel');
        
        if (!window.backupService) {
            this.showToast('❌ Service de backup non disponible', 'error');
            return;
        }
        
        // Mettre à jour l'UI
        const statusCard = document.querySelector('.backup-status-card');
        if (statusCard) {
            statusCard.querySelector('.status-info').innerHTML += 
                '<p class="status-progress"><i class="fas fa-spinner fa-spin"></i> Sauvegarde en cours...</p>';
        }
        
        const success = await window.backupService.backup();
        
        if (success) {
            this.showToast('✅ Sauvegarde réussie dans Documents', 'success');
        } else {
            this.showToast('❌ Échec de la sauvegarde', 'error');
        }
        
        // Rafraîchir la vue
        this.refreshCurrentView();
    }

    toggleBackup(enabled) {
        const settings = { ...this.backupSettings, enabled };
        this.saveBackupSettings(settings);
        
        if (enabled) {
            window.backupService?.initialize();
            this.showToast('✅ Sauvegarde automatique activée', 'success');
        } else {
            window.backupService?.stopAutoBackup();
            this.showToast('⏸️ Sauvegarde automatique désactivée', 'info');
        }
        
        this.refreshCurrentView();
    }

    changeBackupInterval(interval) {
        const settings = { ...this.backupSettings, backupInterval: parseInt(interval) };
        this.saveBackupSettings(settings);
        
        const minutes = Math.floor(interval / 60000);
        const message = minutes < 60 ? 
            `Intervalle changé: ${minutes} minutes` : 
            `Intervalle changé: ${Math.floor(minutes / 60)} heure(s)`;
        
        this.showToast(message, 'info');
    }

    toggleBackupContent(type, enabled) {
        const key = type === 'categories' ? 'includeCategories' : 'includeTasks';
        const settings = { ...this.backupSettings, [key]: enabled };
        this.saveBackupSettings(settings);
        
        this.showToast(`${type === 'categories' ? 'Catégories' : 'Tâches'}: ${enabled ? 'incluses' : 'exclues'}`, 'info');
    }

    changeMaxBackups(max) {
        const settings = { ...this.backupSettings, maxBackups: parseInt(max) };
        this.saveBackupSettings(settings);
        
        this.showToast(`Conservation de ${max} backups maximum`, 'info');
    }

    showRestoreModal() {
        // TODO: Implémenter le modal de restauration
        this.showToast('🚧 Fonctionnalité en développement', 'info');
    }

    openBackupFolder() {
        // Cette fonction ne peut pas ouvrir directement le dossier depuis le navigateur
        // On affiche donc les instructions
        const provider = window.app?.activeProvider || 'unknown';
        const path = provider === 'microsoft' ? 
            'OneDrive > Documents > EmailSortPro > Backups' : 
            'Google Drive > Documents > EmailSortPro > Backups';
        
        this.showToast(`📁 Ouvrez manuellement: ${path}`, 'info');
    }

    // ================================================
    // NAVIGATION ET ACTIONS
    // ================================================
    switchSettingsSection(section) {
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });
        
        // Afficher la section correspondante
        document.querySelectorAll('.settings-section').forEach(sect => {
            sect.classList.toggle('active', sect.id === `section-${section}`);
        });
    }

    switchToCategories() {
        if (window.pageManager) {
            window.pageManager.showPage('categories');
        } else {
            this.currentView = 'categories';
            this.refreshCurrentView();
        }
    }

    refreshCurrentView() {
        const container = document.querySelector('.settings-modern')?.parentElement || 
                        document.querySelector('.categories-modern')?.parentElement ||
                        document.querySelector('.main-content') ||
                        document.getElementById('pageContent');
        
        if (container) {
            this.render(container, this.currentView);
        }
    }

    initializeBackupEvents() {
        // Écouter les changements d'état du backup
        if (window.backupService) {
            setInterval(() => {
                const statusElement = document.querySelector('.backup-status-card');
                if (statusElement && this.currentView === 'settings') {
                    const status = window.backupService.getStatus();
                    const lastBackupElement = statusElement.querySelector('p:nth-child(3)');
                    if (lastBackupElement) {
                        lastBackupElement.innerHTML = `Dernière sauvegarde: <strong>${status.lastBackup || 'Jamais'}</strong>`;
                    }
                }
            }, 30000); // Mettre à jour toutes les 30 secondes
        }
    }

    // ================================================
    // MÉTHODES EXISTANTES POUR CATÉGORIES
    // ================================================
    renderCategories(categories, activeCategories) {
        const filtered = this.filterCategories(categories);
        
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
        
        const emailStats = this.calculateEmailStats();
        
        const categoryCards = Object.entries(filtered)
            .map(([id, category]) => this.renderCategoryCard(id, category, activeCategories, emailStats[id] || 0))
            .join('');
        
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

    renderCategoryCard(id, category, activeCategories) {
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

    // [Reste des méthodes existantes de CategoriesPageV21...]
    // (Copier toutes les autres méthodes depuis la version précédente)
    
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
        } else {
            taskPreselectedCategories.push(categoryId);
        }
        
        settings.taskPreselectedCategories = taskPreselectedCategories;
        this.saveSettings(settings);
        
        this.syncTaskPreselectedCategories(taskPreselectedCategories);
        
        this.updateCategoriesDisplay();
        
        const category = window.categoryManager?.getCategory(categoryId);
        const message = isPreselected ? 
            `☐ ${category?.name || categoryId} - Pré-sélection désactivée` : 
            `☑️ ${category?.name || categoryId} - Pré-sélection activée`;
        this.showToast(message);
    }

    syncTaskPreselectedCategories(categories) {
        console.log('[CategoriesPage] 🔄 === SYNCHRONISATION GLOBALE ===');
        console.log('[CategoriesPage] 📋 Catégories à synchroniser:', categories);
        
        if (window.categoryManager && typeof window.categoryManager.updateTaskPreselectedCategories === 'function') {
            window.categoryManager.updateTaskPreselectedCategories(categories);
        }
        
        if (window.emailScanner && typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
            window.emailScanner.updateTaskPreselectedCategories(categories);
        }
        
        if (window.pageManager && typeof window.pageManager.updateSettings === 'function') {
            window.pageManager.updateSettings({
                taskPreselectedCategories: categories
            });
        }
        
        if (window.minimalScanModule && typeof window.minimalScanModule.updateSettings === 'function') {
            window.minimalScanModule.updateSettings({
                taskPreselectedCategories: categories
            });
        }
        
        if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
            window.aiTaskAnalyzer.updatePreselectedCategories(categories);
        }
        
        this.dispatchSettingsChanged({
            type: 'taskPreselectedCategories',
            value: categories,
            settings: this.loadSettings()
        });
    }

    dispatchSettingsChanged(detail) {
        try {
            window.dispatchEvent(new CustomEvent('categorySettingsChanged', { 
                detail: {
                    ...detail,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                }
            }));
            
            window.dispatchEvent(new CustomEvent('settingsChanged', { 
                detail: {
                    ...detail,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error('[CategoriesPage] Erreur dispatch événements:', error);
        }
    }

    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
    }

    calculateEmailStats() {
        const emails = window.emailScanner?.getAllEmails() || [];
        const stats = {};
        
        emails.forEach(email => {
            const cat = email.category;
            
            if (cat === null || cat === undefined || cat === '') {
                email.category = 'other';
                stats.other = (stats.other || 0) + 1;
            } else {
                stats[cat] = (stats[cat] || 0) + 1;
            }
        });
        
        return stats;
    }

    getCategoryStats(categoryId) {
        if (categoryId === 'other') {
            const emails = window.emailScanner?.getAllEmails() || [];
            const otherEmails = emails.filter(email => {
                const cat = email.category;
                return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
            });
            
            return {
                keywords: 0,
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
                total += stats.keywords;
            }
        });
        
        return total;
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

    // [Continuer avec toutes les autres méthodes de la version précédente...]
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
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">${category.icon}</span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
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
                    
                    <div class="modal-content">
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
                            </div>
                        </div>
                        
                        <div class="tab-panel" id="tab-filters">
                            ${this.renderFiltersTab(filters)}
                        </div>
                        
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
            inputId = type.includes('exclude') ? 'exclude-domain' : 'include-domain';
        } else {
            inputId = type.includes('exclude') ? 'exclude-email' : 'include-email';
        }
        
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
                <button onclick="window.categoriesPageV22.removeItem('${type}', '${value}')">
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
            this.refreshCurrentView();
            
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
            this.refreshCurrentView();
            
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
            this.refreshCurrentView();
        }
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        this.editingCategoryId = null;
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
        this.showToast('ℹ️ La catégorie "Autre" est toujours visible', 'info');
    }

    buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        console.log('[CategoriesPage] 📌 Catégories pré-sélectionnées pour l\'affichage:', preselectedCategories);
        
        const tabs = [
            { 
                id: 'all', 
                name: 'Tous', 
                icon: '📧', 
                count: totalEmails,
                isPreselected: false 
            }
        ];
        
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                const isPreselected = preselectedCategories.includes(catId);
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count: count,
                    isPreselected: isPreselected
                });
            }
        });
        
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            console.log(`[CategoriesPage] 📌 Ajout catégorie "Autre" avec ${otherCount} emails`);
            tabs.push({
                id: 'other',
                name: 'Autre',
                icon: '📌',
                color: '#64748b',
                count: otherCount,
                isPreselected: false
            });
        }
        
        return tabs.map(tab => {
            const isCurrentCategory = this.currentCategory === tab.id;
            const baseClasses = `status-pill-harmonized-twolines ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''}`;
            
            return `
                <button class="${baseClasses}" 
                        onclick="window.categoriesPageV22.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}"
                        title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : (tab.id === 'other' ? 'Emails non catégorisés' : '')}">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                    </div>
                    ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                </button>
            `;
        }).join('');
    }

    // ================================================
    // STYLES MODERNES ÉTENDUS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesModernStylesV22')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesModernStylesV22';
        styles.textContent = `
            /* Base et variables - existant */
            .categories-modern,
            .settings-modern {
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
            
            /* Header moderne - existant */
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
            
            /* STYLES PARAMÈTRES */
            .settings-nav {
                display: flex;
                gap: 24px;
                margin-bottom: 32px;
                padding: 0 8px;
                border-bottom: 2px solid var(--border);
            }
            
            .nav-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 16px 0;
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                position: relative;
                transition: color 0.3s;
            }
            
            .nav-item:hover {
                color: var(--text);
            }
            
            .nav-item.active {
                color: var(--primary);
            }
            
            .nav-item.active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--primary);
                border-radius: 3px 3px 0 0;
            }
            
            .settings-content {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .settings-section {
                display: none;
            }
            
            .settings-section.active {
                display: block;
            }
            
            .section-card {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 16px;
                padding: 32px;
                margin-bottom: 24px;
                box-shadow: var(--shadow);
            }
            
            .section-card h2 {
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 32px 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .section-card h3 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 20px 0;
                color: var(--text);
            }
            
            /* Backup Status Card */
            .backup-status-card {
                background: var(--bg);
                border: 2px solid var(--border);
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 32px;
                display: flex;
                align-items: center;
                gap: 24px;
                transition: all 0.3s;
            }
            
            .backup-status-card.active {
                border-color: var(--success);
                background: #f0fdf4;
            }
            
            .backup-status-card.inactive {
                border-color: var(--warning);
                background: #fffbeb;
            }
            
            .status-icon {
                font-size: 48px;
                color: var(--success);
            }
            
            .backup-status-card.inactive .status-icon {
                color: var(--warning);
            }
            
            .status-info {
                flex: 1;
            }
            
            .status-info h3 {
                font-size: 20px;
                margin: 0 0 12px 0;
            }
            
            .status-info p {
                margin: 4px 0;
                color: var(--text-secondary);
            }
            
            .status-info strong {
                color: var(--text);
                font-weight: 600;
            }
            
            .status-progress {
                color: var(--primary) !important;
                font-weight: 600;
            }
            
            .status-actions {
                display: flex;
                gap: 12px;
            }
            
            /* Setting Groups */
            .setting-group {
                margin-bottom: 32px;
            }
            
            .setting-group:last-child {
                margin-bottom: 0;
            }
            
            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 0;
                border-bottom: 1px solid var(--border);
            }
            
            .setting-item:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            
            .setting-info {
                flex: 1;
            }
            
            .setting-info label {
                display: block;
                font-size: 16px;
                font-weight: 600;
                color: var(--text);
                margin-bottom: 4px;
            }
            
            .setting-description {
                font-size: 14px;
                color: var(--text-secondary);
            }
            
            .setting-select {
                padding: 8px 16px;
                border: 2px solid var(--border);
                border-radius: 8px;
                background: var(--surface);
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .setting-select:hover {
                border-color: var(--primary);
            }
            
            .setting-select:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            /* Toggle Switch */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 56px;
                height: 28px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #CBD5E1;
                transition: 0.3s;
                border-radius: 28px;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .toggle-switch input:checked + .toggle-slider {
                background-color: var(--primary);
            }
            
            .toggle-switch input:checked + .toggle-slider:before {
                transform: translateX(28px);
            }
            
            /* Checkbox Group */
            .checkbox-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 15px;
            }
            
            .checkbox-item input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            /* Backup Actions */
            .backup-actions {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;
            }
            
            .backup-info {
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 16px;
            }
            
            .backup-info p {
                margin: 0 0 8px 0;
                font-size: 14px;
                color: var(--text-secondary);
            }
            
            .backup-info code {
                display: block;
                background: var(--surface);
                padding: 8px 12px;
                border-radius: 6px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: 13px;
                color: var(--text);
            }
            
            /* Categories Mini Grid */
            .categories-mini-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 12px;
                margin-bottom: 24px;
            }
            
            .category-mini-card {
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
            }
            
            .category-mini-card:hover {
                border-color: var(--primary);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .mini-header {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .mini-icon {
                font-size: 20px;
            }
            
            .mini-name {
                font-size: 15px;
                font-weight: 600;
                color: var(--text);
            }
            
            .mini-actions {
                display: flex;
                gap: 4px;
            }
            
            .btn-mini {
                width: 32px;
                height: 32px;
                padding: 0;
                border: 1px solid var(--border);
                background: var(--surface);
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: var(--text-secondary);
                transition: all 0.2s;
            }
            
            .btn-mini:hover {
                border-color: var(--primary);
                color: var(--primary);
            }
            
            .btn-mini.active {
                background: var(--primary);
                border-color: var(--primary);
                color: white;
            }
            
            .categories-actions {
                display: flex;
                gap: 12px;
            }
            
            /* About Section */
            .about-content {
                text-align: center;
            }
            
            .app-logo {
                margin-bottom: 32px;
            }
            
            .logo-icon {
                font-size: 72px;
                margin-bottom: 16px;
            }
            
            .app-logo h3 {
                font-size: 28px;
                margin: 0 0 8px 0;
            }
            
            .version {
                font-size: 16px;
                color: var(--text-secondary);
            }
            
            .about-info p {
                font-size: 16px;
                line-height: 1.6;
                color: var(--text-secondary);
                margin-bottom: 32px;
            }
            
            .features-list {
                text-align: left;
                background: var(--bg);
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 32px;
            }
            
            .features-list h4 {
                font-size: 18px;
                margin: 0 0 16px 0;
            }
            
            .features-list ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            
            .features-list li {
                padding: 8px 0;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 15px;
            }
            
            .features-list i {
                color: var(--success);
            }
            
            .about-footer {
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid var(--border);
            }
            
            .about-footer p {
                margin: 0;
                font-size: 14px;
            }
            
            /* Tous les styles existants des catégories... */
            ${this.getExistingCategoriesStyles()}
            
            /* Responsive */
            @media (max-width: 768px) {
                .settings-nav {
                    flex-wrap: wrap;
                    gap: 16px;
                }
                
                .nav-item {
                    font-size: 14px;
                    padding: 12px 0;
                }
                
                .backup-status-card {
                    flex-direction: column;
                    text-align: center;
                }
                
                .backup-actions {
                    flex-direction: column;
                    width: 100%;
                }
                
                .backup-actions button {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    getExistingCategoriesStyles() {
        // Retourner tous les styles existants de la vue catégories
        return `
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
            
            /* Boutons */
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
            
            .btn-modern.primary:disabled {
                background: #9CA3AF;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
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
            
            /* Recherche et autres styles existants... */
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
            
            .meta-star {
                font-size: 12px;
                color: #F59E0B;
                font-weight: 600;
            }
            
            .meta-description {
                font-size: 11px;
                color: var(--text-secondary);
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
            
            .btn-minimal.config {
                color: #6B7280;
            }
            
            /* Modal et autres styles existants... */
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
                max-width: 900px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
                animation: slideUp 0.3s;
                border: 2px solid var(--border);
                overflow: hidden;
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
            
            /* Autres styles de modal, tabs, etc... */
        `;
    }
}

// ================================================
// INTÉGRATION GLOBALE
// ================================================

// Créer l'instance avec un nom unique
window.categoriesPageV22 = new CategoriesPageV22();

// Créer des alias pour maintenir la compatibilité
window.categoriesPage = window.categoriesPageV22;
window.categoriesPageV21 = window.categoriesPageV22;

// Intégration avec PageManager
if (window.pageManager?.pages) {
    // Pour la page settings/paramètres
    window.pageManager.pages.settings = (container) => {
        window.categoriesPageV22.render(container, 'settings');
    };
    
    // Pour la page categories
    window.pageManager.pages.categories = (container) => {
        window.categoriesPageV22.render(container, 'categories');
    };
}

// S'assurer que les méthodes sont accessibles
if (!window.categoriesPage.getTaskPreselectedCategories) {
    window.categoriesPage.getTaskPreselectedCategories = function() {
        return window.categoriesPageV22.getTaskPreselectedCategories();
    };
}

// Initialiser le service de backup si ce n'est pas déjà fait
if (window.backupService && !window.backupService.isInitialized) {
    setTimeout(() => {
        if (window.app && (window.app.isAuthenticated || window.app.activeProvider)) {
            window.backupService.initialize().then(() => {
                console.log('[CategoriesPage] ✅ BackupService initialisé');
            });
        }
    }, 2000);
}

console.log('[CategoriesPage] ✅ CategoriesPage v22.0 chargée - Vue Paramètres avec Backup intégré!');
