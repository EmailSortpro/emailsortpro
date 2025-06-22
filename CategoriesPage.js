// SettingsPage.js - Version Minimaliste et Moderne
console.log('[SettingsPage] 🚀 Chargement de la version minimaliste...');

// Nettoyer toute instance précédente
if (window.settingsPage) {
    console.log('[SettingsPage] 🧹 Nettoyage instance précédente...');
    delete window.settingsPage;
}

class SettingsPageMinimal {
    constructor() {
        this.currentTab = 'categories';
        this.backupManager = new BackupManager();
        this.editingCategoryId = null;
        this.currentModal = null;
        this.colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ];
        console.log('[SettingsPage] ✅ Interface minimaliste initialisée');
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
                <div class="settings-minimal">
                    <!-- Header épuré -->
                    <div class="settings-header-minimal">
                        <h1>Paramètres</h1>
                        <p>Configuration et sauvegarde</p>
                    </div>
                    
                    <!-- Navigation minimaliste -->
                    <div class="settings-nav">
                        <button class="nav-item active" data-tab="categories" onclick="window.settingsPage.switchTab('categories')">
                            <span class="nav-icon">⚙️</span>
                            <span class="nav-label">Catégories</span>
                        </button>
                        <button class="nav-item" data-tab="backup" onclick="window.settingsPage.switchTab('backup')">
                            <span class="nav-icon">💾</span>
                            <span class="nav-label">Sauvegarde</span>
                        </button>
                    </div>
                    
                    <!-- Contenu -->
                    <div class="settings-container">
                        <!-- Onglet Catégories -->
                        <div id="tab-categories" class="tab-panel active">
                            ${this.renderCategoriesTab()}
                        </div>
                        
                        <!-- Onglet Backup -->
                        <div id="tab-backup" class="tab-panel">
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
    // ONGLET CATÉGORIES MINIMALISTE
    // ================================================
    renderCategoriesTab() {
        const categories = window.categoryManager?.getCategories() || {};
        const stats = this.getCategoriesStats();
        
        return `
            <div class="categories-minimal">
                <!-- Stats compactes -->
                <div class="stats-compact">
                    <div class="stat-mini">
                        <span class="stat-value">${stats.total}</span>
                        <span class="stat-label">Catégories</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-value">${stats.custom}</span>
                        <span class="stat-label">Personnalisées</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-value">${stats.active}</span>
                        <span class="stat-label">Actives</span>
                    </div>
                </div>
                
                <!-- Actions principales -->
                <div class="actions-bar">
                    <button class="btn-minimal primary" onclick="window.settingsPage.showCreateCategoryModal()">
                        <span class="btn-icon">+</span>
                        Nouvelle catégorie
                    </button>
                    <button class="btn-minimal" onclick="window.settingsPage.exportCategories()">
                        <span class="btn-icon">↓</span>
                        Exporter
                    </button>
                </div>
                
                <!-- Liste des catégories compacte -->
                <div class="categories-list-minimal">
                    ${this.renderCategoriesList(categories)}
                </div>
            </div>
        `;
    }

    renderCategoriesList(categories) {
        if (Object.keys(categories).length === 0) {
            return `
                <div class="empty-state-minimal">
                    <span class="empty-icon">📂</span>
                    <p>Aucune catégorie configurée</p>
                </div>
            `;
        }

        return Object.entries(categories).map(([id, category]) => {
            const settings = this.loadSettings();
            const isActive = settings.activeCategories === null || settings.activeCategories.includes(id);
            const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
            
            return `
                <div class="category-row ${!isActive ? 'inactive' : ''}">
                    <div class="category-identity">
                        <span class="category-badge" style="background: ${category.color}20; color: ${category.color}">
                            ${category.icon}
                        </span>
                        <span class="category-name">${category.name}</span>
                        ${isPreselected ? '<span class="preselected-dot" title="Pré-sélectionnée">•</span>' : ''}
                    </div>
                    
                    <div class="category-actions-minimal">
                        <button class="action-minimal ${isActive ? 'active' : ''}" 
                                onclick="window.settingsPage.toggleCategory('${id}')"
                                title="${isActive ? 'Désactiver' : 'Activer'}">
                            <span>${isActive ? '✓' : '○'}</span>
                        </button>
                        <button class="action-minimal ${isPreselected ? 'starred' : ''}" 
                                onclick="window.settingsPage.togglePreselection('${id}')"
                                title="Pré-sélection">
                            <span>⭐</span>
                        </button>
                        <button class="action-minimal" 
                                onclick="window.settingsPage.editCategory('${id}')"
                                title="Modifier">
                            <span>✏️</span>
                        </button>
                        ${category.isCustom ? `
                            <button class="action-minimal danger" 
                                    onclick="window.settingsPage.deleteCategory('${id}')"
                                    title="Supprimer">
                                <span>×</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ================================================
    // ONGLET BACKUP MINIMALISTE ET MODERNE
    // ================================================
    renderBackupTab() {
        return `
            <div class="backup-minimal">
                <!-- Statut système -->
                <div class="backup-status-card">
                    <div class="status-icon" id="backup-status-icon">
                        <span class="spinner">⟳</span>
                    </div>
                    <div class="status-info">
                        <h3>Système de sauvegarde</h3>
                        <p id="backup-status-text">Initialisation...</p>
                    </div>
                </div>
                
                <!-- Actions principales -->
                <div class="backup-actions-grid">
                    <!-- Sauvegarde -->
                    <div class="action-card">
                        <div class="card-icon">💾</div>
                        <h4>Sauvegarder</h4>
                        <p>Créer une sauvegarde complète</p>
                        <button class="btn-minimal primary full" onclick="window.settingsPage.createBackup()" id="backup-btn">
                            Sauvegarder maintenant
                        </button>
                    </div>
                    
                    <!-- Restaurer -->
                    <div class="action-card">
                        <div class="card-icon">📥</div>
                        <h4>Restaurer</h4>
                        <p>Importer une sauvegarde</p>
                        <button class="btn-minimal full" onclick="window.settingsPage.importBackup()">
                            Choisir un fichier
                        </button>
                    </div>
                </div>
                
                <!-- Options avancées -->
                <div class="advanced-section">
                    <div class="section-header" onclick="window.settingsPage.toggleAdvanced()">
                        <h3>Options avancées</h3>
                        <span class="toggle-icon" id="advanced-toggle">›</span>
                    </div>
                    
                    <div class="advanced-content" id="advanced-content" style="display: none;">
                        <div class="option-row">
                            <label class="option-label">
                                <input type="checkbox" id="backup-emails" checked>
                                <span>Inclure les emails (max 1000)</span>
                            </label>
                        </div>
                        
                        <div class="option-row">
                            <label class="option-label">
                                <input type="checkbox" id="backup-tasks" checked>
                                <span>Inclure les tâches</span>
                            </label>
                        </div>
                        
                        <div class="danger-section">
                            <button class="btn-minimal danger" onclick="window.settingsPage.resetAll()">
                                Réinitialiser toutes les données
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Historique minimaliste -->
                <div class="history-section">
                    <h3>Historique récent</h3>
                    <div class="history-list" id="backup-history">
                        <div class="history-placeholder">
                            <span class="spinner">⟳</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tabName) {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });
        
        this.currentTab = tabName;
        
        if (tabName === 'backup') {
            this.refreshBackupStatus();
            this.loadBackupHistory();
        }
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    getCategoriesStats() {
        const categories = window.categoryManager?.getCategories() || {};
        const settings = this.loadSettings();
        
        const total = Object.keys(categories).length;
        const custom = Object.values(categories).filter(cat => cat.isCustom).length;
        const active = settings.activeCategories === null ? 
            total : settings.activeCategories.length;
        
        return { total, custom, active };
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
        
        this.refreshCategoriesTab();
        this.showToast('Catégorie mise à jour');
    }

    togglePreselection(categoryId) {
        const settings = this.loadSettings();
        let preselected = settings.taskPreselectedCategories || [];
        
        if (preselected.includes(categoryId)) {
            preselected = preselected.filter(id => id !== categoryId);
        } else {
            preselected.push(categoryId);
        }
        
        settings.taskPreselectedCategories = preselected;
        this.saveSettings(settings);
        
        this.syncTaskPreselectedCategories(preselected);
        this.refreshCategoriesTab();
        this.showToast('Pré-sélection mise à jour');
    }

    syncTaskPreselectedCategories(categories) {
        if (window.categoryManager?.updateTaskPreselectedCategories) {
            window.categoryManager.updateTaskPreselectedCategories(categories);
        }
        
        if (window.emailScanner?.updateTaskPreselectedCategories) {
            window.emailScanner.updateTaskPreselectedCategories(categories);
        }
        
        window.dispatchEvent(new CustomEvent('categorySettingsChanged', { 
            detail: { type: 'taskPreselectedCategories', value: categories }
        }));
    }

    // ================================================
    // MODAL CRÉATION CATÉGORIE MINIMALISTE
    // ================================================
    showCreateCategoryModal() {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'modal-minimal';
        modal.innerHTML = `
            <div class="modal-content-minimal">
                <div class="modal-header-minimal">
                    <h2>Nouvelle catégorie</h2>
                    <button class="modal-close" onclick="window.settingsPage.closeModal()">×</button>
                </div>
                
                <div class="modal-body-minimal">
                    <div class="form-field">
                        <label>Nom</label>
                        <input type="text" id="category-name" placeholder="Ex: Factures" autofocus>
                    </div>
                    
                    <div class="form-field">
                        <label>Icône</label>
                        <div class="icon-grid">
                            ${['📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌'].map((icon, i) => 
                                `<button class="icon-choice ${i === 0 ? 'selected' : ''}" onclick="window.settingsPage.selectIcon(this, '${icon}')">${icon}</button>`
                            ).join('')}
                        </div>
                        <input type="hidden" id="category-icon" value="📁">
                    </div>
                    
                    <div class="form-field">
                        <label>Couleur</label>
                        <div class="color-grid">
                            ${this.colors.map((color, i) => 
                                `<button class="color-choice ${i === 0 ? 'selected' : ''}" 
                                         style="background: ${color}"
                                         onclick="window.settingsPage.selectColor(this, '${color}')"></button>`
                            ).join('')}
                        </div>
                        <input type="hidden" id="category-color" value="${this.colors[0]}">
                    </div>
                </div>
                
                <div class="modal-footer-minimal">
                    <button class="btn-minimal" onclick="window.settingsPage.closeModal()">Annuler</button>
                    <button class="btn-minimal primary" onclick="window.settingsPage.createCategory()">Créer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        setTimeout(() => document.getElementById('category-name')?.focus(), 100);
    }

    selectIcon(button, icon) {
        document.querySelectorAll('.icon-choice').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        document.getElementById('category-icon').value = icon;
    }

    selectColor(button, color) {
        document.querySelectorAll('.color-choice').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        document.getElementById('category-color').value = color;
    }

    createCategory() {
        const name = document.getElementById('category-name')?.value?.trim();
        const icon = document.getElementById('category-icon')?.value || '📁';
        const color = document.getElementById('category-color')?.value || this.colors[0];
        
        if (!name) {
            this.showToast('Nom requis', 'error');
            return;
        }
        
        const categoryData = {
            name,
            icon,
            color,
            priority: 30,
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };
        
        if (window.categoryManager?.createCustomCategory(categoryData)) {
            this.closeModal();
            this.showToast('Catégorie créée');
            this.refreshCategoriesTab();
        }
    }

    // ================================================
    // MODAL ÉDITION SIMPLIFIÉE
    // ================================================
    editCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        const modal = document.createElement('div');
        modal.className = 'modal-minimal wide';
        modal.innerHTML = `
            <div class="modal-content-minimal">
                <div class="modal-header-minimal">
                    <h2>${category.icon} ${category.name}</h2>
                    <button class="modal-close" onclick="window.settingsPage.closeModal()">×</button>
                </div>
                
                <div class="modal-body-minimal">
                    <div class="keywords-editor">
                        ${this.renderKeywordEditor('absolute', 'Mots-clés absolus', keywords.absolute, '#EF4444')}
                        ${this.renderKeywordEditor('strong', 'Mots-clés forts', keywords.strong, '#F59E0B')}
                        ${this.renderKeywordEditor('weak', 'Mots-clés faibles', keywords.weak, '#3B82F6')}
                        ${this.renderKeywordEditor('exclusions', 'Exclusions', keywords.exclusions, '#8B5CF6')}
                    </div>
                </div>
                
                <div class="modal-footer-minimal">
                    ${category.isCustom ? `<button class="btn-minimal danger" onclick="window.settingsPage.confirmDelete('${categoryId}')">Supprimer</button>` : ''}
                    <button class="btn-minimal" onclick="window.settingsPage.closeModal()">Annuler</button>
                    <button class="btn-minimal primary" onclick="window.settingsPage.saveCategory()">Enregistrer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
    }

    renderKeywordEditor(type, label, keywords, color) {
        return `
            <div class="keyword-group">
                <div class="keyword-header">
                    <label style="color: ${color}">${label}</label>
                    <span class="keyword-count">${keywords.length}</span>
                </div>
                <div class="keyword-input-row">
                    <input type="text" 
                           id="${type}-input" 
                           placeholder="Ajouter..."
                           onkeypress="if(event.key === 'Enter') window.settingsPage.addKeyword('${type}', '${color}')">
                    <button class="btn-add" style="background: ${color}" onclick="window.settingsPage.addKeyword('${type}', '${color}')">+</button>
                </div>
                <div class="keywords-chips" id="${type}-list">
                    ${keywords.map(kw => `
                        <span class="keyword-chip" style="background: ${color}20; color: ${color}">
                            ${kw}
                            <button onclick="window.settingsPage.removeKeyword('${type}', '${kw}')">×</button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    addKeyword(type, color) {
        const input = document.getElementById(`${type}-input`);
        if (!input?.value.trim()) return;
        
        const keyword = input.value.trim().toLowerCase();
        const list = document.getElementById(`${type}-list`);
        
        // Vérifier les doublons
        if (list.querySelector(`[data-keyword="${keyword}"]`)) {
            this.showToast('Mot-clé existant', 'error');
            return;
        }
        
        list.insertAdjacentHTML('beforeend', `
            <span class="keyword-chip" style="background: ${color}20; color: ${color}" data-keyword="${keyword}">
                ${keyword}
                <button onclick="window.settingsPage.removeKeyword('${type}', '${keyword}')">×</button>
            </span>
        `);
        
        input.value = '';
        this.updateKeywordCount(type);
    }

    removeKeyword(type, keyword) {
        const chip = document.querySelector(`#${type}-list [data-keyword="${keyword}"]`);
        if (chip) {
            chip.remove();
            this.updateKeywordCount(type);
        }
    }

    updateKeywordCount(type) {
        const count = document.querySelectorAll(`#${type}-list .keyword-chip`).length;
        const counter = document.querySelector(`#${type}-list`).parentElement.querySelector('.keyword-count');
        if (counter) counter.textContent = count;
    }

    saveCategory() {
        if (!this.editingCategoryId) return;
        
        const keywords = {
            absolute: this.collectKeywords('absolute-list'),
            strong: this.collectKeywords('strong-list'),
            weak: this.collectKeywords('weak-list'),
            exclusions: this.collectKeywords('exclusions-list')
        };
        
        window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
        
        this.closeModal();
        this.showToast('Catégorie mise à jour');
        this.refreshCategoriesTab();
    }

    collectKeywords(listId) {
        const keywords = [];
        document.querySelectorAll(`#${listId} .keyword-chip`).forEach(chip => {
            const kw = chip.getAttribute('data-keyword');
            if (kw) keywords.push(kw);
        });
        return keywords;
    }

    confirmDelete(categoryId) {
        if (confirm('Supprimer cette catégorie ?')) {
            this.deleteCategory(categoryId);
        }
    }

    deleteCategory(categoryId) {
        window.categoryManager?.deleteCustomCategory(categoryId);
        this.closeModal();
        this.showToast('Catégorie supprimée');
        this.refreshCategoriesTab();
    }

    exportCategories() {
        const categories = window.categoryManager?.getCategories() || {};
        const customCategories = {};
        
        Object.entries(categories).forEach(([id, cat]) => {
            if (cat.isCustom) customCategories[id] = cat;
        });
        
        if (Object.keys(customCategories).length === 0) {
            this.showToast('Aucune catégorie personnalisée', 'error');
            return;
        }
        
        const data = {
            timestamp: new Date().toISOString(),
            categories: customCategories
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mailsort-categories-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Catégories exportées');
    }

    // ================================================
    // GESTION BACKUP
    // ================================================
    async initializeBackupManager() {
        try {
            await this.backupManager.initialize();
            this.refreshBackupStatus();
        } catch (error) {
            console.error('[SettingsPage] Erreur init backup:', error);
            this.updateBackupStatus('error', 'Mode téléchargement uniquement');
        }
    }

    async refreshBackupStatus() {
        const statusIcon = document.getElementById('backup-status-icon');
        const statusText = document.getElementById('backup-status-text');
        
        if (!statusIcon || !statusText) return;
        
        if (this.backupManager.isInitialized) {
            statusIcon.innerHTML = '<span class="status-ok">✓</span>';
            statusText.textContent = 'Système prêt - Mode téléchargement';
        } else {
            statusIcon.innerHTML = '<span class="status-error">!</span>';
            statusText.textContent = 'Erreur d\'initialisation';
        }
    }

    async createBackup() {
        const btn = document.getElementById('backup-btn');
        if (!btn) return;
        
        const originalText = btn.textContent;
        btn.textContent = 'Création...';
        btn.disabled = true;
        
        try {
            const includeEmails = document.getElementById('backup-emails')?.checked ?? true;
            const includeTasks = document.getElementById('backup-tasks')?.checked ?? true;
            
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                categories: window.categoryManager?.getCategories() || {},
                settings: this.loadSettings()
            };
            
            if (includeEmails) {
                const emails = window.emailScanner?.getAllEmails() || [];
                backupData.emails = emails.slice(0, 1000);
            }
            
            if (includeTasks && window.taskManager) {
                backupData.tasks = window.taskManager.getAllTasks();
            }
            
            const filename = `mailsort-backup-${new Date().toISOString().split('T')[0]}.json`;
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            
            this.downloadFile(blob, filename);
            this.saveBackupRecord(filename, blob.size);
            this.showToast('Sauvegarde créée');
            this.loadBackupHistory();
            
        } catch (error) {
            console.error('[SettingsPage] Erreur backup:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async importBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!this.validateBackup(data)) {
                    this.showToast('Fichier invalide', 'error');
                    return;
                }
                
                if (!confirm('Remplacer les données actuelles ?')) return;
                
                await this.restoreBackup(data);
                this.showToast('Import réussi');
                setTimeout(() => location.reload(), 1500);
                
            } catch (error) {
                console.error('[SettingsPage] Erreur import:', error);
                this.showToast('Erreur d\'import', 'error');
            }
        };
        
        input.click();
    }

    validateBackup(data) {
        return data && data.timestamp && (data.categories || data.settings);
    }

    async restoreBackup(data) {
        if (data.categories) {
            Object.entries(data.categories).forEach(([id, cat]) => {
                if (cat.isCustom && window.categoryManager) {
                    window.categoryManager.deleteCustomCategory(id);
                    window.categoryManager.createCustomCategory(cat);
                }
            });
        }
        
        if (data.settings) {
            this.saveSettings(data.settings);
        }
        
        if (data.tasks && window.taskManager) {
            data.tasks.forEach(task => {
                window.taskManager.addTask(task.title, task.content, task.category);
            });
        }
    }

    saveBackupRecord(filename, size) {
        const backups = JSON.parse(localStorage.getItem('mailsort-backups') || '[]');
        backups.unshift({
            name: filename,
            date: new Date().toISOString(),
            size: size,
            id: Date.now()
        });
        backups.splice(10); // Garder 10 derniers
        localStorage.setItem('mailsort-backups', JSON.stringify(backups));
    }

    loadBackupHistory() {
        const container = document.getElementById('backup-history');
        if (!container) return;
        
        const backups = JSON.parse(localStorage.getItem('mailsort-backups') || '[]');
        
        if (backups.length === 0) {
            container.innerHTML = '<p class="history-empty">Aucune sauvegarde</p>';
            return;
        }
        
        container.innerHTML = backups.slice(0, 5).map(backup => `
            <div class="history-item">
                <div class="history-info">
                    <span class="history-name">${backup.name}</span>
                    <span class="history-date">${new Date(backup.date).toLocaleString('fr-FR')}</span>
                </div>
                <button class="history-delete" onclick="window.settingsPage.deleteBackupRecord(${backup.id})">×</button>
            </div>
        `).join('');
    }

    deleteBackupRecord(id) {
        const backups = JSON.parse(localStorage.getItem('mailsort-backups') || '[]');
        const filtered = backups.filter(b => b.id !== id);
        localStorage.setItem('mailsort-backups', JSON.stringify(filtered));
        this.loadBackupHistory();
    }

    toggleAdvanced() {
        const content = document.getElementById('advanced-content');
        const toggle = document.getElementById('advanced-toggle');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '⌄';
        } else {
            content.style.display = 'none';
            toggle.textContent = '›';
        }
    }

    async resetAll() {
        if (!confirm('⚠️ Supprimer TOUTES les données ?')) return;
        
        const confirmText = prompt('Tapez "RESET" pour confirmer :');
        if (confirmText !== 'RESET') return;
        
        localStorage.clear();
        sessionStorage.clear();
        
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.entries(categories).forEach(([id, cat]) => {
                if (cat.isCustom) {
                    window.categoryManager.deleteCustomCategory(id);
                }
            });
        }
        
        this.showToast('Réinitialisation complète');
        setTimeout(() => location.reload(), 1500);
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
            this.editingCategoryId = null;
        }
    }

    refreshCategoriesTab() {
        const tab = document.getElementById('tab-categories');
        if (tab && this.currentTab === 'categories') {
            tab.innerHTML = this.renderCategoriesTab();
        }
    }

    loadSettings() {
        try {
            return JSON.parse(localStorage.getItem('categorySettings') || '{}');
        } catch {
            return {};
        }
    }

    saveSettings(settings) {
        localStorage.setItem('categorySettings', JSON.stringify(settings));
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-minimal ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    renderError() {
        return `
            <div class="error-state-minimal">
                <span>⚠️</span>
                <p>Erreur de chargement</p>
                <button class="btn-minimal" onclick="location.reload()">Recharger</button>
            </div>
        `;
    }

    // ================================================
    // STYLES MINIMALISTES ET MODERNES
    // ================================================
    addStyles() {
        if (document.getElementById('settingsMinimalStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'settingsMinimalStyles';
        styles.textContent = `
            /* Reset et variables */
            .settings-minimal * {
                box-sizing: border-box;
            }
            
            .settings-minimal {
                --bg: #fafafa;
                --surface: #ffffff;
                --border: #e0e0e0;
                --text: #212121;
                --text-light: #757575;
                --primary: #2196F3;
                --success: #4CAF50;
                --warning: #FF9800;
                --danger: #F44336;
                --radius: 8px;
                
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: var(--text);
                line-height: 1.5;
                padding: 24px;
                max-width: 900px;
                margin: 0 auto;
            }
            
            /* Header */
            .settings-header-minimal {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .settings-header-minimal h1 {
                font-size: 28px;
                font-weight: 300;
                margin: 0 0 4px 0;
                letter-spacing: -0.5px;
            }
            
            .settings-header-minimal p {
                color: var(--text-light);
                font-size: 14px;
                margin: 0;
            }
            
            /* Navigation */
            .settings-nav {
                display: flex;
                gap: 2px;
                background: var(--border);
                padding: 2px;
                border-radius: var(--radius);
                margin-bottom: 24px;
            }
            
            .nav-item {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 10px;
                border: none;
                background: transparent;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                color: var(--text-light);
            }
            
            .nav-item:hover {
                background: rgba(0, 0, 0, 0.05);
            }
            
            .nav-item.active {
                background: var(--surface);
                color: var(--text);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .nav-icon {
                font-size: 16px;
            }
            
            /* Container */
            .settings-container {
                background: var(--surface);
                border-radius: var(--radius);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .tab-panel {
                display: none;
                padding: 24px;
            }
            
            .tab-panel.active {
                display: block;
            }
            
            /* Stats compactes */
            .stats-compact {
                display: flex;
                gap: 24px;
                margin-bottom: 24px;
                padding-bottom: 24px;
                border-bottom: 1px solid var(--border);
            }
            
            .stat-mini {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 300;
                color: var(--primary);
            }
            
            .stat-label {
                font-size: 12px;
                color: var(--text-light);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* Actions bar */
            .actions-bar {
                display: flex;
                gap: 12px;
                margin-bottom: 24px;
            }
            
            /* Boutons minimalistes */
            .btn-minimal {
                padding: 8px 16px;
                border: 1px solid var(--border);
                background: var(--surface);
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: var(--text);
            }
            
            .btn-minimal:hover {
                border-color: var(--primary);
                background: var(--bg);
            }
            
            .btn-minimal.primary {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }
            
            .btn-minimal.primary:hover {
                background: #1976D2;
            }
            
            .btn-minimal.danger {
                color: var(--danger);
                border-color: var(--danger);
            }
            
            .btn-minimal.danger:hover {
                background: var(--danger);
                color: white;
            }
            
            .btn-minimal.full {
                width: 100%;
                justify-content: center;
            }
            
            .btn-minimal:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-icon {
                font-size: 16px;
            }
            
            /* Liste catégories minimaliste */
            .categories-list-minimal {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .category-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                background: var(--bg);
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .category-row:hover {
                background: var(--border);
            }
            
            .category-row.inactive {
                opacity: 0.5;
            }
            
            .category-identity {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .category-badge {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .category-name {
                font-size: 14px;
                font-weight: 500;
            }
            
            .preselected-dot {
                color: var(--warning);
                font-size: 16px;
            }
            
            .category-actions-minimal {
                display: flex;
                gap: 4px;
            }
            
            .action-minimal {
                width: 32px;
                height: 32px;
                border: 1px solid var(--border);
                background: var(--surface);
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 14px;
            }
            
            .action-minimal:hover {
                border-color: var(--primary);
                background: var(--primary);
                color: white;
            }
            
            .action-minimal.active {
                background: var(--success);
                color: white;
                border-color: var(--success);
            }
            
            .action-minimal.starred {
                color: var(--warning);
            }
            
            .action-minimal.danger:hover {
                background: var(--danger);
                border-color: var(--danger);
            }
            
            /* Empty state */
            .empty-state-minimal {
                text-align: center;
                padding: 48px 24px;
                color: var(--text-light);
            }
            
            .empty-icon {
                font-size: 48px;
                display: block;
                margin-bottom: 12px;
                opacity: 0.3;
            }
            
            /* Backup section */
            .backup-status-card {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 20px;
                background: var(--bg);
                border-radius: var(--radius);
                margin-bottom: 24px;
            }
            
            .status-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: var(--border);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .spinner {
                animation: spin 2s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .status-ok {
                color: var(--success);
            }
            
            .status-error {
                color: var(--danger);
            }
            
            .status-info h3 {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 500;
            }
            
            .status-info p {
                margin: 0;
                font-size: 14px;
                color: var(--text-light);
            }
            
            /* Actions grid */
            .backup-actions-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 32px;
            }
            
            .action-card {
                padding: 24px;
                background: var(--bg);
                border-radius: var(--radius);
                text-align: center;
            }
            
            .card-icon {
                font-size: 32px;
                margin-bottom: 12px;
            }
            
            .action-card h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 500;
            }
            
            .action-card p {
                margin: 0 0 16px 0;
                font-size: 13px;
                color: var(--text-light);
            }
            
            /* Advanced section */
            .advanced-section {
                margin-bottom: 32px;
            }
            
            .section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                background: var(--bg);
                border-radius: var(--radius);
                cursor: pointer;
                user-select: none;
            }
            
            .section-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 500;
            }
            
            .toggle-icon {
                font-size: 16px;
                transition: transform 0.2s;
            }
            
            .advanced-content {
                margin-top: 12px;
                padding: 16px;
                background: var(--bg);
                border-radius: var(--radius);
            }
            
            .option-row {
                margin-bottom: 12px;
            }
            
            .option-label {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .option-label input {
                cursor: pointer;
            }
            
            .danger-section {
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid var(--border);
            }
            
            /* History */
            .history-section h3 {
                font-size: 14px;
                font-weight: 500;
                margin: 0 0 12px 0;
            }
            
            .history-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .history-placeholder {
                text-align: center;
                padding: 24px;
                color: var(--text-light);
            }
            
            .history-empty {
                text-align: center;
                color: var(--text-light);
                font-size: 13px;
                padding: 24px;
            }
            
            .history-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: var(--bg);
                border-radius: 6px;
                font-size: 13px;
            }
            
            .history-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .history-name {
                font-weight: 500;
            }
            
            .history-date {
                color: var(--text-light);
                font-size: 11px;
            }
            
            .history-delete {
                width: 24px;
                height: 24px;
                border: none;
                background: transparent;
                cursor: pointer;
                color: var(--text-light);
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .history-delete:hover {
                background: var(--danger);
                color: white;
            }
            
            /* Modal minimaliste */
            .modal-minimal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-content-minimal {
                background: var(--surface);
                border-radius: var(--radius);
                width: 100%;
                max-width: 480px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
            
            .modal-minimal.wide .modal-content-minimal {
                max-width: 720px;
            }
            
            .modal-header-minimal {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px;
                border-bottom: 1px solid var(--border);
            }
            
            .modal-header-minimal h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
            }
            
            .modal-close {
                width: 32px;
                height: 32px;
                border: none;
                background: transparent;
                font-size: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                color: var(--text-light);
            }
            
            .modal-close:hover {
                background: var(--bg);
            }
            
            .modal-body-minimal {
                padding: 20px;
            }
            
            .modal-footer-minimal {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                padding: 20px;
                border-top: 1px solid var(--border);
            }
            
            /* Form fields */
            .form-field {
                margin-bottom: 20px;
            }
            
            .form-field label {
                display: block;
                margin-bottom: 8px;
                font-size: 13px;
                font-weight: 500;
                color: var(--text-light);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .form-field input[type="text"] {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .form-field input[type="text"]:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
            }
            
            /* Icon grid */
            .icon-grid {
                display: grid;
                grid-template-columns: repeat(10, 1fr);
                gap: 4px;
            }
            
            .icon-choice {
                width: 36px;
                height: 36px;
                border: 1px solid var(--border);
                background: var(--surface);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: all 0.2s;
            }
            
            .icon-choice:hover {
                border-color: var(--primary);
            }
            
            .icon-choice.selected {
                border-color: var(--primary);
                background: rgba(33, 150, 243, 0.1);
            }
            
            /* Color grid */
            .color-grid {
                display: grid;
                grid-template-columns: repeat(10, 1fr);
                gap: 4px;
            }
            
            .color-choice {
                width: 36px;
                height: 36px;
                border: 2px solid transparent;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .color-choice:hover {
                transform: scale(1.1);
            }
            
            .color-choice.selected {
                border-color: var(--text);
            }
            
            /* Keywords editor */
            .keywords-editor {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            .keyword-group {
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 16px;
            }
            
            .keyword-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .keyword-header label {
                font-size: 14px;
                font-weight: 500;
            }
            
            .keyword-count {
                font-size: 12px;
                padding: 2px 8px;
                background: var(--bg);
                border-radius: 12px;
            }
            
            .keyword-input-row {
                display: flex;
                gap: 4px;
                margin-bottom: 12px;
            }
            
            .keyword-input-row input {
                flex: 1;
                padding: 6px 10px;
                border: 1px solid var(--border);
                border-radius: 4px;
                font-size: 13px;
            }
            
            .keyword-input-row input:focus {
                outline: none;
                border-color: var(--primary);
            }
            
            .btn-add {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .keywords-chips {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                min-height: 32px;
            }
            
            .keyword-chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .keyword-chip button {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                padding: 0;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 2px;
            }
            
            .keyword-chip button:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            
            /* Toast */
            .toast-minimal {
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 12px 20px;
                background: var(--text);
                color: white;
                border-radius: 6px;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                transform: translateY(100px);
                transition: transform 0.3s;
                z-index: 2000;
            }
            
            .toast-minimal.show {
                transform: translateY(0);
            }
            
            .toast-minimal.success {
                background: var(--success);
            }
            
            .toast-minimal.error {
                background: var(--danger);
            }
            
            /* Error state */
            .error-state-minimal {
                text-align: center;
                padding: 48px;
                color: var(--text-light);
            }
            
            .error-state-minimal span {
                display: block;
                font-size: 48px;
                margin-bottom: 12px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .settings-minimal {
                    padding: 16px;
                }
                
                .backup-actions-grid {
                    grid-template-columns: 1fr;
                }
                
                .keywords-editor {
                    grid-template-columns: 1fr;
                }
                
                .stats-compact {
                    justify-content: space-around;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// BACKUP MANAGER SIMPLIFIÉ
// ================================================
class BackupManager {
    constructor() {
        this.isInitialized = false;
    }

    async initialize() {
        // Version simplifiée - toujours prêt
        this.isInitialized = true;
        console.log('[BackupManager] ✅ Initialisé en mode simple');
    }
}

// ================================================
// EXPORT GLOBAL
// ================================================
window.settingsPage = new SettingsPageMinimal();

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.settingsPage.render(container);
    };
}

console.log('[SettingsPage] ✅ Version minimaliste chargée!');
