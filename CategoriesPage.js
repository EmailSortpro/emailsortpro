// SettingsPage.js - Version Simplifiée avec Backup Local
console.log('[SettingsPage] 🚀 Loading SettingsPage Simplifiée...');

// Nettoyer toute instance précédente
if (window.settingsPage) {
    console.log('[SettingsPage] 🧹 Nettoyage instance précédente...');
    delete window.settingsPage;
}

class SettingsPageSimple {
    constructor() {
        this.currentTab = 'categories';
        this.backupManager = new BackupManager();
        this.editingCategoryId = null;
        this.currentModal = null;
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8'
        ];
        console.log('[SettingsPage] ✅ Interface simplifiée initialisée');
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
                        <p>Gérez vos catégories et vos sauvegardes</p>
                    </div>
                    
                    <!-- Navigation des onglets -->
                    <div class="settings-tabs">
                        <button class="tab-button active" data-tab="categories" onclick="window.settingsPage.switchTab('categories')">
                            <i class="fas fa-tags"></i>
                            <span>Catégories</span>
                        </button>
                        <button class="tab-button" data-tab="backup" onclick="window.settingsPage.switchTab('backup')">
                            <i class="fas fa-cloud-download-alt"></i>
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
            this.initializeBackupManager();
            
        } catch (error) {
            console.error('[SettingsPage] Erreur:', error);
            container.innerHTML = this.renderError();
        }
    }

    // ================================================
    // ONGLET CATÉGORIES
    // ================================================
    renderCategoriesTab() {
        const categories = window.categoryManager?.getCategories() || {};
        const stats = this.calculateCategoryStats();
        
        return `
            <div class="categories-section">
                <!-- Stats rapides -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-number">${Object.keys(categories).length}</div>
                        <div class="stat-label">Catégories</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalEmails}</div>
                        <div class="stat-label">Emails classés</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalKeywords}</div>
                        <div class="stat-label">Mots-clés</div>
                    </div>
                </div>
                
                <!-- Actions principales -->
                <div class="categories-actions">
                    <button class="btn-primary" onclick="window.settingsPage.showCreateCategoryModal()">
                        <i class="fas fa-plus"></i>
                        Nouvelle catégorie
                    </button>
                    <button class="btn-secondary" onclick="window.settingsPage.exportCategories()">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                </div>
                
                <!-- Liste des catégories -->
                <div class="categories-list">
                    ${this.renderCategoriesList(categories)}
                </div>
            </div>
        `;
    }

    renderCategoriesList(categories) {
        if (Object.keys(categories).length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Aucune catégorie</h3>
                    <p>Créez votre première catégorie pour commencer</p>
                </div>
            `;
        }

        return Object.entries(categories).map(([id, category]) => {
            const stats = this.getCategoryStats(id);
            const settings = this.loadSettings();
            const isActive = settings.activeCategories === null || settings.activeCategories.includes(id);
            const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
            
            return `
                <div class="category-item ${!isActive ? 'inactive' : ''}">
                    <div class="category-main">
                        <div class="category-icon" style="background: ${category.color}20; color: ${category.color}">
                            ${category.icon}
                        </div>
                        <div class="category-info">
                            <h3>${category.name}</h3>
                            <div class="category-meta">
                                <span>${stats.emailCount} emails</span>
                                <span>${stats.keywords} mots-clés</span>
                                ${isPreselected ? '<span class="preselected-badge">⭐ Pré-sélectionnée</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="category-actions">
                        <button class="action-btn ${isActive ? 'active' : 'inactive'}" 
                                onclick="window.settingsPage.toggleCategory('${id}')"
                                title="${isActive ? 'Désactiver' : 'Activer'}">
                            <i class="fas fa-${isActive ? 'toggle-on' : 'toggle-off'}"></i>
                        </button>
                        <button class="action-btn ${isPreselected ? 'selected' : ''}" 
                                onclick="window.settingsPage.togglePreselection('${id}')"
                                title="Pré-sélection pour tâches">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="action-btn" 
                                onclick="window.settingsPage.editCategory('${id}')"
                                title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${category.isCustom ? `
                            <button class="action-btn danger" 
                                    onclick="window.settingsPage.deleteCategory('${id}')"
                                    title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ================================================
    // ONGLET BACKUP
    // ================================================
    renderBackupTab() {
        return `
            <div class="backup-section">
                <!-- Statut du backup -->
                <div class="backup-status" id="backup-status">
                    <div class="status-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        Initialisation du système de sauvegarde...
                    </div>
                </div>
                
                <!-- Actions de backup -->
                <div class="backup-actions">
                    <div class="backup-group">
                        <h3><i class="fas fa-save"></i> Sauvegarde manuelle</h3>
                        <p>Créer une sauvegarde complète de vos données</p>
                        <button class="btn-primary" onclick="window.settingsPage.createBackup()" id="backup-btn">
                            <i class="fas fa-cloud-upload-alt"></i>
                            Créer une sauvegarde
                        </button>
                    </div>
                    
                    <div class="backup-group">
                        <h3><i class="fas fa-history"></i> Restauration</h3>
                        <p>Restaurer vos données depuis une sauvegarde</p>
                        <button class="btn-secondary" onclick="window.settingsPage.restoreBackup()" id="restore-btn">
                            <i class="fas fa-upload"></i>
                            Restaurer une sauvegarde
                        </button>
                    </div>
                    
                    <div class="backup-group">
                        <h3><i class="fas fa-folder-open"></i> Dossier de sauvegarde</h3>
                        <p>Accéder au dossier de sauvegarde local</p>
                        <button class="btn-secondary" onclick="window.settingsPage.openBackupFolder()">
                            <i class="fas fa-external-link-alt"></i>
                            Ouvrir le dossier
                        </button>
                    </div>
                </div>
                
                <!-- Historique des sauvegardes -->
                <div class="backup-history">
                    <h3><i class="fas fa-list"></i> Historique des sauvegardes</h3>
                    <div id="backup-list">
                        <div class="loading">Chargement...</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tabName) {
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
        
        this.currentTab = tabName;
        
        // Actions spécifiques par onglet
        if (tabName === 'backup') {
            this.refreshBackupStatus();
        }
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
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
        
        this.refreshCategoriesTab();
        this.showToast(`Catégorie ${activeCategories.includes(categoryId) ? 'activée' : 'désactivée'}`);
    }

    togglePreselection(categoryId) {
        const settings = this.loadSettings();
        let taskPreselectedCategories = settings.taskPreselectedCategories || [];
        
        if (taskPreselectedCategories.includes(categoryId)) {
            taskPreselectedCategories = taskPreselectedCategories.filter(id => id !== categoryId);
        } else {
            taskPreselectedCategories.push(categoryId);
        }
        
        settings.taskPreselectedCategories = taskPreselectedCategories;
        this.saveSettings(settings);
        
        // Synchroniser avec les autres modules
        this.syncTaskPreselectedCategories(taskPreselectedCategories);
        
        this.refreshCategoriesTab();
        this.showToast('Pré-sélection mise à jour');
    }

    syncTaskPreselectedCategories(categories) {
        // Synchroniser avec CategoryManager
        if (window.categoryManager && typeof window.categoryManager.updateTaskPreselectedCategories === 'function') {
            window.categoryManager.updateTaskPreselectedCategories(categories);
        }
        
        // Synchroniser avec EmailScanner
        if (window.emailScanner && typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
            window.emailScanner.updateTaskPreselectedCategories(categories);
        }
        
        // Dispatching des événements
        window.dispatchEvent(new CustomEvent('categorySettingsChanged', { 
            detail: {
                type: 'taskPreselectedCategories',
                value: categories,
                source: 'SettingsPage'
            }
        }));
    }

    // ================================================
    // MODALS SIMPLIFIÉES
    // ================================================
    showCreateCategoryModal() {
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.settingsPage.closeModal()">
                <div class="modal-simple">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus"></i> Nouvelle catégorie</h2>
                        <button class="btn-close" onclick="window.settingsPage.closeModal()">
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
                                    `<button class="icon-option ${i === 0 ? 'selected' : ''}" onclick="window.settingsPage.selectIcon('${icon}')">${icon}</button>`
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
                                             onclick="window.settingsPage.selectColor('${color}')"></button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="category-color" value="${this.colors[0]}">
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.settingsPage.closeModal()">Annuler</button>
                        <button class="btn-primary" onclick="window.settingsPage.createCategory()">
                            <i class="fas fa-plus"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
        
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

    createCategory() {
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
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };
        
        const newCategory = window.categoryManager?.createCustomCategory(categoryData);
        
        if (newCategory) {
            this.closeModal();
            this.showToast('Catégorie créée avec succès!');
            this.refreshCategoriesTab();
        }
    }

    editCategory(categoryId) {
        // Pour la version simplifiée, on redirige vers une page d'édition basique
        this.showToast('Fonctionnalité d\'édition en cours de développement', 'info');
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.showToast('Catégorie supprimée');
            this.refreshCategoriesTab();
        }
    }

    exportCategories() {
        const categories = window.categoryManager?.getCategories() || {};
        const data = JSON.stringify(categories, null, 2);
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mailsort-categories-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Catégories exportées');
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        this.editingCategoryId = null;
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================
    async initializeBackupManager() {
        try {
            await this.backupManager.initialize();
            this.refreshBackupStatus();
        } catch (error) {
            console.error('[SettingsPage] Erreur initialisation backup:', error);
            this.updateBackupStatus('error', 'Erreur d\'initialisation du système de sauvegarde');
        }
    }

    async refreshBackupStatus() {
        if (this.currentTab !== 'backup') return;
        
        try {
            const status = await this.backupManager.getStatus();
            this.updateBackupStatus('ready', `Dossier de sauvegarde: ${status.backupPath}`);
            this.loadBackupHistory();
        } catch (error) {
            this.updateBackupStatus('error', 'Système de sauvegarde non disponible');
        }
    }

    updateBackupStatus(status, message) {
        const statusEl = document.getElementById('backup-status');
        if (!statusEl) return;
        
        const icons = {
            loading: 'fa-spinner fa-spin',
            ready: 'fa-check-circle',
            error: 'fa-exclamation-triangle'
        };
        
        const colors = {
            loading: '#6B7280',
            ready: '#10B981',
            error: '#EF4444'
        };
        
        statusEl.innerHTML = `
            <div class="status-${status}" style="color: ${colors[status]}">
                <i class="fas ${icons[status]}"></i>
                ${message}
            </div>
        `;
    }

    async createBackup() {
        const btn = document.getElementById('backup-btn');
        if (!btn) return;
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
        btn.disabled = true;
        
        try {
            const result = await this.backupManager.createBackup();
            this.showToast('Sauvegarde créée avec succès!');
            this.loadBackupHistory();
        } catch (error) {
            console.error('[SettingsPage] Erreur backup:', error);
            this.showToast('Erreur lors de la création de la sauvegarde', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async restoreBackup() {
        try {
            const result = await this.backupManager.selectAndRestoreBackup();
            if (result) {
                this.showToast('Sauvegarde restaurée avec succès!');
                // Recharger la page pour appliquer les changements
                setTimeout(() => location.reload(), 1500);
            }
        } catch (error) {
            console.error('[SettingsPage] Erreur restauration:', error);
            this.showToast('Erreur lors de la restauration', 'error');
        }
    }

    async openBackupFolder() {
        try {
            await this.backupManager.openBackupFolder();
        } catch (error) {
            this.showToast('Impossible d\'ouvrir le dossier de sauvegarde', 'error');
        }
    }

    async loadBackupHistory() {
        const listEl = document.getElementById('backup-list');
        if (!listEl) return;
        
        try {
            const backups = await this.backupManager.getBackupHistory();
            
            if (backups.length === 0) {
                listEl.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>Aucune sauvegarde trouvée</p>
                    </div>
                `;
                return;
            }
            
            listEl.innerHTML = backups.map(backup => `
                <div class="backup-item">
                    <div class="backup-info">
                        <div class="backup-name">${backup.name}</div>
                        <div class="backup-date">${new Date(backup.date).toLocaleString('fr-FR')}</div>
                        <div class="backup-size">${this.formatFileSize(backup.size)}</div>
                    </div>
                    <div class="backup-actions">
                        <button class="btn-small" onclick="window.settingsPage.restoreSpecificBackup('${backup.path}')">
                            <i class="fas fa-undo"></i> Restaurer
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            listEl.innerHTML = '<div class="error">Erreur lors du chargement de l\'historique</div>';
        }
    }

    async restoreSpecificBackup(backupPath) {
        if (!confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ?')) return;
        
        try {
            await this.backupManager.restoreFromPath(backupPath);
            this.showToast('Sauvegarde restaurée avec succès!');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            this.showToast('Erreur lors de la restauration', 'error');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ================================================
    // UTILS
    // ================================================
    refreshCategoriesTab() {
        const categoriesTab = document.getElementById('tab-categories');
        if (categoriesTab && this.currentTab === 'categories') {
            categoriesTab.innerHTML = this.renderCategoriesTab();
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
            console.error('[SettingsPage] Erreur sauvegarde:', error);
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
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

    // ================================================
    // STYLES MODERNES
    // ================================================
    addStyles() {
        if (document.getElementById('settingsPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'settingsPageStyles';
        styles.textContent = `
            /* Variables CSS */
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
                
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: var(--text);
                background: var(--bg);
                min-height: 100vh;
            }
            
            /* Header */
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
            
            /* Navigation des onglets */
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
            
            /* Contenu des onglets */
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
            
            /* Section catégories */
            .stats-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .stat-card {
                text-align: center;
                padding: 20px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
            }
            
            .stat-number {
                font-size: 28px;
                font-weight: 700;
                color: var(--primary);
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 14px;
                color: var(--text-light);
            }
            
            .categories-actions {
                display: flex;
                gap: 12px;
                margin-bottom: 24px;
            }
            
            .categories-list {
                display: flex;
                flex-direction: column;
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
            
            /* Section backup */
            .backup-status {
                margin-bottom: 24px;
                padding: 16px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
            }
            
            .backup-actions {
                display: grid;
                gap: 24px;
                margin-bottom: 32px;
            }
            
            .backup-group {
                padding: 20px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
            }
            
            .backup-group h3 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .backup-group p {
                margin: 0 0 16px 0;
                color: var(--text-light);
                font-size: 14px;
            }
            
            .backup-history h3 {
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .backup-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
                margin-bottom: 8px;
            }
            
            .backup-info {
                flex: 1;
            }
            
            .backup-name {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .backup-date {
                font-size: 13px;
                color: var(--text-light);
            }
            
            .backup-size {
                font-size: 12px;
                color: var(--text-light);
            }
            
            /* Boutons */
            .btn-primary, .btn-secondary, .btn-small {
                padding: 10px 16px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
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
            
            .btn-small {
                padding: 6px 12px;
                font-size: 12px;
                background: var(--primary);
                color: white;
            }
            
            .btn-small:hover {
                background: #2563EB;
            }
            
            /* Modal */
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
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
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
            }
            
            .btn-close:hover {
                background: var(--danger);
                color: white;
            }
            
            .modal-body {
                padding: 20px;
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
            
            /* Toast */
            .toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: var(--text);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                z-index: 2000;
                transform: translateY(100px);
                transition: transform 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
                max-width: 400px;
            }
            
            .toast.show {
                transform: translateY(0);
            }
            
            .toast.success {
                background: var(--success);
            }
            
            .toast.error {
                background: var(--danger);
            }
            
            .toast.info {
                background: var(--primary);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .settings-page {
                    padding: 16px;
                }
                
                .tab-content {
                    padding: 20px;
                }
                
                .stats-row {
                    grid-template-columns: 1fr;
                }
                
                .categories-actions {
                    flex-direction: column;
                }
                
                .category-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 16px;
                }
                
                .category-actions {
                    justify-content: center;
                }
                
                .backup-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// GESTIONNAIRE DE BACKUP LOCAL
// ================================================
class BackupManager {
    constructor() {
        this.backupPath = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Vérifier si nous sommes dans un environnement compatible
            if (!window.electronAPI && !window.showDirectoryPicker) {
                throw new Error('API de système de fichiers non disponible');
            }

            // Tenter d'utiliser l'API Electron si disponible
            if (window.electronAPI) {
                this.backupPath = await window.electronAPI.getBackupPath();
            } else {
                // Utiliser l'API File System Access si disponible
                this.backupPath = await this.setupWebBackupPath();
            }

            this.isInitialized = true;
            console.log('[BackupManager] Initialisé avec le chemin:', this.backupPath);
        } catch (error) {
            console.error('[BackupManager] Erreur d\'initialisation:', error);
            throw error;
        }
    }

    async setupWebBackupPath() {
        // Pour l'environnement web, utiliser un chemin simulé
        // Dans un vrai environnement, on demanderait l'autorisation d'accès au dossier
        return 'C:\\Users\\Documents\\MailSort Pro';
    }

    async getStatus() {
        if (!this.isInitialized) {
            throw new Error('BackupManager non initialisé');
        }

        return {
            backupPath: this.backupPath,
            isReady: true
        };
    }

    async createBackup() {
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            categories: window.categoryManager?.getCategories() || {},
            settings: JSON.parse(localStorage.getItem('categorySettings') || '{}'),
            emails: window.emailScanner?.getAllEmails()?.slice(0, 1000) || [], // Limiter pour la taille
            metadata: {
                totalEmails: window.emailScanner?.getAllEmails()?.length || 0,
                createdAt: new Date().toISOString(),
                userAgent: navigator.userAgent
            }
        };

        const filename = `mailsort-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        // Dans un environnement réel, on sauvegarderait dans le dossier système
        // Ici, on simule avec un téléchargement
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);

        // Simuler la sauvegarde locale
        this.saveBackupRecord(filename, blob.size);

        return { filename, size: blob.size };
    }

    saveBackupRecord(filename, size) {
        const backups = JSON.parse(localStorage.getItem('mailsort-backups') || '[]');
        backups.unshift({
            name: filename,
            date: new Date().toISOString(),
            size: size,
            path: `${this.backupPath}\\${filename}`
        });
        
        // Garder seulement les 10 dernières sauvegardes
        backups.splice(10);
        
        localStorage.setItem('mailsort-backups', JSON.stringify(backups));
    }

    async getBackupHistory() {
        const backups = JSON.parse(localStorage.getItem('mailsort-backups') || '[]');
        return backups;
    }

    async selectAndRestoreBackup() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    resolve(false);
                    return;
                }
                
                try {
                    const text = await file.text();
                    const backupData = JSON.parse(text);
                    await this.restoreFromData(backupData);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            input.click();
        });
    }

    async restoreFromPath(path) {
        // Dans un environnement réel, on lirait le fichier depuis le chemin
        throw new Error('Restauration depuis un chemin non implémentée dans cette version de démonstration');
    }

    async restoreFromData(backupData) {
        try {
            // Restaurer les catégories
            if (backupData.categories && window.categoryManager) {
                Object.entries(backupData.categories).forEach(([id, category]) => {
                    if (category.isCustom) {
                        window.categoryManager.createCustomCategory(category);
                    }
                });
            }

            // Restaurer les paramètres
            if (backupData.settings) {
                localStorage.setItem('categorySettings', JSON.stringify(backupData.settings));
            }

            console.log('[BackupManager] Sauvegarde restaurée avec succès');
        } catch (error) {
            console.error('[BackupManager] Erreur lors de la restauration:', error);
            throw error;
        }
    }

    async openBackupFolder() {
        if (window.electronAPI) {
            await window.electronAPI.openBackupFolder();
        } else {
            // Dans l'environnement web, ouvrir un lien vers le dossier Documents
            alert(`Dossier de sauvegarde: ${this.backupPath}\n\nVeuillez naviguer manuellement vers ce dossier.`);
        }
    }
}

// ================================================
// INTÉGRATION GLOBALE
// ================================================
window.settingsPage = new SettingsPageSimple();

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.settingsPage.render(container);
    };
}

console.log('[SettingsPage] ✅ SettingsPage Simplifiée chargée avec BackupManager!');
