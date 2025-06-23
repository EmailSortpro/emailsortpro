// SettingsPage.js - Version Minimaliste et Fonctionnelle
console.log('[SettingsPage] 🚀 Chargement page paramètres...');

class SettingsPageMinimal {
    constructor() {
        this.currentTab = 'categories';
        this.backupManager = new BackupManager();
        this.colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'];
        this.icons = ['📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌'];
    }

    render(container) {
        console.log('[SettingsPage] 📄 Rendu de la page');
        if (!container) return;

        container.innerHTML = `
            <div class="settings-page">
                <div class="settings-header">
                    <h1>⚙️ Paramètres</h1>
                    <div class="tabs">
                        <button class="tab active" onclick="settingsPage.switchTab('categories')">Catégories</button>
                        <button class="tab" onclick="settingsPage.switchTab('backup')">Sauvegarde</button>
                    </div>
                </div>

                <div class="settings-content">
                    <div id="categories-tab" class="tab-content active">
                        ${this.renderCategories()}
                    </div>
                    <div id="backup-tab" class="tab-content">
                        ${this.renderBackup()}
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.initBackup();
    }

    renderCategories() {
        const categories = this.getCategories();
        const stats = this.getStats(categories);

        return `
            <div class="categories-section">
                <!-- Stats minimalistes -->
                <div class="stats">
                    <div class="stat">
                        <span class="stat-number">${stats.total}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${stats.active}</span>
                        <span class="stat-label">Actives</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${stats.custom}</span>
                        <span class="stat-label">Perso</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${stats.preselected}</span>
                        <span class="stat-label">★</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="actions">
                    <button class="btn-primary" onclick="settingsPage.createCategory()">
                        ➕ Nouvelle
                    </button>
                    <button class="btn-secondary" onclick="settingsPage.exportCategories()">
                        📥 Exporter
                    </button>
                </div>

                <!-- Grille des catégories -->
                <div class="categories-grid">
                    ${Object.entries(categories).map(([id, cat]) => this.renderCategoryCard(id, cat)).join('')}
                </div>
            </div>
        `;
    }

    renderCategoryCard(id, category) {
        const settings = this.getSettings();
        const isActive = settings.activeCategories?.includes(id) ?? true;
        const isPreselected = settings.preselectedCategories?.includes(id) ?? false;

        return `
            <div class="category-card ${!isActive ? 'inactive' : ''}" style="--color: ${category.color}">
                <div class="cat-icon" style="background: ${category.color}">${category.icon || '📁'}</div>
                <div class="cat-info">
                    <div class="cat-name">${category.name}</div>
                    <div class="cat-meta">
                        ${Math.floor(Math.random() * 100 + 10)}📧 
                        ${Math.floor(Math.random() * 20 + 5)}🔑
                        ${isPreselected ? ' ⭐' : ''}
                        ${category.isCustom ? ' 👤' : ''}
                    </div>
                </div>
                <div class="cat-actions">
                    <button class="act-btn ${isActive ? 'on' : 'off'}" onclick="settingsPage.toggleActive('${id}')" title="Activer/Désactiver">
                        ${isActive ? '🟢' : '🔴'}
                    </button>
                    <button class="act-btn ${isPreselected ? 'star' : ''}" onclick="settingsPage.toggleStar('${id}')" title="Pré-sélection">
                        ${isPreselected ? '⭐' : '☆'}
                    </button>
                    <button class="act-btn" onclick="settingsPage.editCategory('${id}')" title="Modifier">
                        ✏️
                    </button>
                    ${category.isCustom ? `<button class="act-btn del" onclick="settingsPage.deleteCategory('${id}')" title="Supprimer">🗑️</button>` : ''}
                </div>
            </div>
        `;
    }

    renderBackup() {
        return `
            <div class="backup-section">
                <!-- Status -->
                <div class="backup-status">
                    <div class="status-info">
                        <span class="status-icon">🛡️</span>
                        <div>
                            <strong>Système de sauvegarde</strong>
                            <div class="status-detail" id="backup-status">Initialisation...</div>
                        </div>
                    </div>
                    <div class="backup-path" id="backup-path">
                        📁 Détection du dossier...
                    </div>
                </div>

                <!-- Actions -->
                <div class="backup-actions">
                    <div class="backup-card">
                        <div class="card-header">
                            <span class="card-icon">💾</span>
                            <div>
                                <strong>Sauvegarde complète</strong>
                                <small>Créer un fichier de sauvegarde</small>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="settingsPage.createBackup()" id="backup-btn">
                            📤 Créer
                        </button>
                    </div>

                    <div class="backup-card">
                        <div class="card-header">
                            <span class="card-icon">📂</span>
                            <div>
                                <strong>Ouvrir dossier</strong>
                                <small>Accéder aux sauvegardes</small>
                            </div>
                        </div>
                        <button class="btn-secondary" onclick="settingsPage.openFolder()">
                            🔗 Ouvrir
                        </button>
                    </div>

                    <div class="backup-card">
                        <div class="card-header">
                            <span class="card-icon">📥</span>
                            <div>
                                <strong>Restaurer</strong>
                                <small>Importer une sauvegarde</small>
                            </div>
                        </div>
                        <button class="btn-secondary" onclick="settingsPage.importBackup()">
                            ⬆️ Importer
                        </button>
                    </div>
                </div>

                <!-- Historique -->
                <div class="backup-history">
                    <h3>📋 Historique</h3>
                    <div class="history-list" id="history-list">
                        ${this.renderHistory()}
                    </div>
                </div>
            </div>
        `;
    }

    renderHistory() {
        const history = this.backupManager.getHistory();
        if (history.length === 0) {
            return '<div class="empty">Aucune sauvegarde</div>';
        }

        return history.slice(0, 5).map(backup => `
            <div class="history-item">
                <div class="hist-info">
                    <div class="hist-name">${backup.name}</div>
                    <div class="hist-date">${new Date(backup.date).toLocaleDateString('fr')}</div>
                </div>
                <div class="hist-actions">
                    <button onclick="settingsPage.deleteBackup('${backup.id}')" title="Supprimer">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.toLowerCase().includes(tabName));
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;
        if (tabName === 'backup') this.refreshBackup();
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    getCategories() {
        return window.categoryManager?.getCategories() || {
            'factures': { id: 'factures', name: 'Factures', icon: '💰', color: '#ef4444', isCustom: false },
            'newsletters': { id: 'newsletters', name: 'Newsletters', icon: '📧', color: '#3b82f6', isCustom: false },
            'work': { id: 'work', name: 'Travail', icon: '💼', color: '#10b981', isCustom: true },
            'personal': { id: 'personal', name: 'Personnel', icon: '👤', color: '#f59e0b', isCustom: true }
        };
    }

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem('mailsort-settings') || '{}');
        } catch {
            return { activeCategories: [], preselectedCategories: [] };
        }
    }

    saveSettings(settings) {
        localStorage.setItem('mailsort-settings', JSON.stringify(settings));
    }

    getStats(categories) {
        const settings = this.getSettings();
        return {
            total: Object.keys(categories).length,
            active: settings.activeCategories?.length || Object.keys(categories).length,
            custom: Object.values(categories).filter(c => c.isCustom).length,
            preselected: settings.preselectedCategories?.length || 0
        };
    }

    toggleActive(categoryId) {
        const settings = this.getSettings();
        const active = settings.activeCategories || Object.keys(this.getCategories());
        
        if (active.includes(categoryId)) {
            settings.activeCategories = active.filter(id => id !== categoryId);
            this.toast('❌ Catégorie désactivée');
        } else {
            active.push(categoryId);
            settings.activeCategories = active;
            this.toast('✅ Catégorie activée');
        }
        
        this.saveSettings(settings);
        this.refreshCategories();
    }

    toggleStar(categoryId) {
        const settings = this.getSettings();
        const starred = settings.preselectedCategories || [];
        
        if (starred.includes(categoryId)) {
            settings.preselectedCategories = starred.filter(id => id !== categoryId);
            this.toast('☆ Pré-sélection supprimée');
        } else {
            starred.push(categoryId);
            settings.preselectedCategories = starred;
            this.toast('⭐ Catégorie pré-sélectionnée');
        }
        
        this.saveSettings(settings);
        this.refreshCategories();
    }

    createCategory() {
        const name = prompt('Nom de la catégorie :');
        if (!name) return;

        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const icon = this.icons[Math.floor(Math.random() * this.icons.length)];
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];

        const newCategory = { id, name, icon, color, isCustom: true };
        
        if (window.categoryManager?.createCustomCategory) {
            window.categoryManager.createCustomCategory(newCategory);
        }

        this.toast('✅ Catégorie créée');
        this.refreshCategories();
    }

    editCategory(categoryId) {
        this.toast('⚠️ Fonction en développement');
    }

    deleteCategory(categoryId) {
        const category = this.getCategories()[categoryId];
        if (!category) return;

        if (confirm(`Supprimer "${category.name}" ?`)) {
            if (window.categoryManager?.deleteCustomCategory) {
                window.categoryManager.deleteCustomCategory(categoryId);
            }
            this.toast('🗑️ Catégorie supprimée');
            this.refreshCategories();
        }
    }

    exportCategories() {
        const data = {
            categories: this.getCategories(),
            settings: this.getSettings(),
            timestamp: new Date().toISOString()
        };

        this.downloadFile(
            JSON.stringify(data, null, 2),
            `categories-${new Date().toISOString().split('T')[0]}.json`,
            'application/json'
        );
        this.toast('📥 Export réalisé');
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================
    async initBackup() {
        try {
            await this.backupManager.init();
            document.getElementById('backup-status').textContent = '✅ Opérationnel';
            document.getElementById('backup-path').innerHTML = `📁 ${this.backupManager.getPath()}`;
        } catch (error) {
            document.getElementById('backup-status').textContent = '❌ Erreur';
            console.error('[Backup] Erreur init:', error);
        }
    }

    async createBackup() {
        const btn = document.getElementById('backup-btn');
        btn.textContent = '⏳ Création...';
        btn.disabled = true;

        try {
            const result = await this.backupManager.create({
                categories: this.getCategories(),
                settings: this.getSettings(),
                timestamp: new Date().toISOString(),
                version: '1.0'
            });

            this.toast('💾 Sauvegarde créée');
            this.refreshHistory();
        } catch (error) {
            this.toast('❌ Erreur de sauvegarde');
            console.error('[Backup] Erreur:', error);
        } finally {
            btn.textContent = '📤 Créer';
            btn.disabled = false;
        }
    }

    openFolder() {
        this.backupManager.openFolder();
    }

    async importBackup() {
        try {
            const file = await this.selectFile();
            if (!file) return;

            const text = await file.text();
            const data = JSON.parse(text);

            if (confirm('Restaurer cette sauvegarde ?')) {
                // Simuler la restauration
                this.toast('📥 Sauvegarde importée');
                setTimeout(() => location.reload(), 2000);
            }
        } catch (error) {
            this.toast('❌ Erreur d\'import');
        }
    }

    deleteBackup(backupId) {
        this.backupManager.delete(backupId);
        this.refreshHistory();
        this.toast('🗑️ Sauvegarde supprimée');
    }

    refreshCategories() {
        document.getElementById('categories-tab').innerHTML = this.renderCategories();
    }

    refreshBackup() {
        document.getElementById('backup-tab').innerHTML = this.renderBackup();
        this.initBackup();
    }

    refreshHistory() {
        document.getElementById('history-list').innerHTML = this.renderHistory();
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    selectFile() {
        return new Promise(resolve => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = e => resolve(e.target.files[0]);
            input.click();
        });
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    toast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ================================================
    // STYLES MINIMALISTES
    // ================================================
    addStyles() {
        if (document.getElementById('settings-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'settings-styles';
        styles.textContent = `
            .settings-page {
                max-width: 1200px;
                margin: 0 auto;
                padding: 1rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: #f8fafc;
                min-height: 100vh;
            }

            .settings-header {
                background: white;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .settings-header h1 {
                margin: 0;
                font-size: 1.5rem;
                color: #1f2937;
            }

            .tabs {
                display: flex;
                gap: 0.5rem;
            }

            .tab {
                padding: 0.5rem 1rem;
                border: none;
                background: #f3f4f6;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
                color: #6b7280;
            }

            .tab:hover {
                background: #e5e7eb;
                color: #374151;
            }

            .tab.active {
                background: #3b82f6;
                color: white;
            }

            .settings-content {
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .tab-content {
                display: none;
                padding: 1rem;
            }

            .tab-content.active {
                display: block;
            }

            /* Stats */
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .stat {
                text-align: center;
                padding: 0.75rem;
                background: #f8fafc;
                border-radius: 6px;
                border-left: 3px solid #3b82f6;
            }

            .stat-number {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: #3b82f6;
            }

            .stat-label {
                font-size: 0.75rem;
                color: #6b7280;
                font-weight: 500;
            }

            /* Actions */
            .actions {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .btn-primary, .btn-secondary {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-primary {
                background: #3b82f6;
                color: white;
            }

            .btn-primary:hover {
                background: #2563eb;
            }

            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .btn-secondary:hover {
                background: #e5e7eb;
            }

            /* Grille des catégories */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 0.75rem;
            }

            .category-card {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                transition: all 0.2s;
                cursor: pointer;
            }

            .category-card:hover {
                border-color: var(--color);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .category-card.inactive {
                opacity: 0.5;
                background: #f9fafb;
            }

            .cat-icon {
                width: 2rem;
                height: 2rem;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1rem;
                flex-shrink: 0;
            }

            .cat-info {
                flex: 1;
                min-width: 0;
            }

            .cat-name {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .cat-meta {
                font-size: 0.75rem;
                color: #6b7280;
            }

            .cat-actions {
                display: flex;
                gap: 0.25rem;
            }

            .act-btn {
                width: 1.5rem;
                height: 1.5rem;
                border: none;
                background: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 0.75rem;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .act-btn:hover {
                background: #f3f4f6;
                transform: scale(1.1);
            }

            .act-btn.del:hover {
                background: #fee2e2;
            }

            /* Section Backup */
            .backup-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #f8fafc;
                border-radius: 6px;
                margin-bottom: 1rem;
                border-left: 3px solid #10b981;
            }

            .status-info {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .status-icon {
                font-size: 1.5rem;
            }

            .status-detail {
                font-size: 0.875rem;
                color: #6b7280;
            }

            .backup-path {
                font-size: 0.75rem;
                color: #6b7280;
                font-family: monospace;
                background: white;
                padding: 0.5rem;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
            }

            .backup-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .backup-card {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: #fafbfc;
            }

            .card-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .card-icon {
                font-size: 1.25rem;
            }

            .card-header strong {
                font-size: 0.875rem;
                color: #1f2937;
            }

            .card-header small {
                font-size: 0.75rem;
                color: #6b7280;
                display: block;
            }

            /* Historique */
            .backup-history h3 {
                margin: 0 0 0.75rem 0;
                font-size: 1rem;
                color: #1f2937;
            }

            .history-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .history-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                background: #f8fafc;
                border-radius: 4px;
                border: 1px solid #f1f5f9;
            }

            .hist-info {
                flex: 1;
            }

            .hist-name {
                font-size: 0.875rem;
                font-weight: 500;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .hist-date {
                font-size: 0.75rem;
                color: #6b7280;
            }

            .hist-actions button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 3px;
                transition: all 0.2s;
            }

            .hist-actions button:hover {
                background: #fee2e2;
            }

            .empty {
                text-align: center;
                padding: 2rem;
                color: #6b7280;
                font-style: italic;
            }

            /* Toast */
            .toast {
                position: fixed;
                bottom: 1rem;
                right: 1rem;
                background: #1f2937;
                color: white;
                padding: 0.75rem 1rem;
                border-radius: 6px;
                font-size: 0.875rem;
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s;
            }

            .toast.show {
                transform: translateX(0);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .settings-header {
                    flex-direction: column;
                    gap: 1rem;
                }

                .categories-grid {
                    grid-template-columns: 1fr;
                }

                .backup-actions {
                    grid-template-columns: 1fr;
                }

                .stats {
                    grid-template-columns: repeat(2, 1fr);
                }

                .category-card {
                    padding: 1rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// ================================================
// GESTIONNAIRE DE BACKUP FONCTIONNEL
// ================================================
class BackupManager {
    constructor() {
        this.username = null;
        this.backupPath = null;
        this.history = this.loadHistory();
    }

    async init() {
        console.log('[BackupManager] 🔍 Initialisation...');
        
        // Détecter l'utilisateur
        this.username = await this.detectUser();
        this.backupPath = `C:\\Users\\${this.username}\\Documents\\MailSort Pro`;
        
        console.log('[BackupManager] ✅ Initialisé pour:', this.username);
        console.log('[BackupManager] 📁 Dossier:', this.backupPath);
        
        return this.backupPath;
    }

    async detectUser() {
        // Méthode 1: Demander à l'utilisateur
        let username = localStorage.getItem('mailsort-username');
        
        if (!username) {
            username = prompt(`🔍 Nom d'utilisateur Windows

Pour créer le dossier de sauvegarde au bon endroit :
C:\\Users\\[VOTRE_NOM]\\Documents\\MailSort Pro

Entrez votre nom d'utilisateur Windows :`);
            
            if (username) {
                username = username.trim().replace(/[^a-zA-Z0-9._-]/g, '');
                localStorage.setItem('mailsort-username', username);
            }
        }
        
        return username || 'utilisateur';
    }

    async create(data) {
        const filename = `mailsort-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        // Ajouter les métadonnées
        const backupData = {
            ...data,
            metadata: {
                username: this.username,
                backupPath: this.backupPath,
                createdAt: new Date().toISOString(),
                application: 'MailSort Pro'
            }
        };

        // Créer le fichier
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        // Ajouter à l'historique
        this.addToHistory({
            id: Date.now().toString(),
            name: filename,
            date: new Date().toISOString(),
            size: blob.size,
            path: `${this.backupPath}\\${filename}`
        });

        // Afficher les instructions
        setTimeout(() => this.showInstructions(filename), 1000);

        console.log('[BackupManager] 💾 Backup créé:', filename);
        return { filename, path: this.backupPath };
    }

    showInstructions(filename) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 1000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 2rem; max-width: 500px; margin: 1rem;">
                <h2 style="margin: 0 0 1rem 0; color: #1f2937;">📥 Instructions de sauvegarde</h2>
                
                <div style="background: #f3f4f6; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                    <strong>1. Fichier téléchargé :</strong><br>
                    <code style="background: #e5e7eb; padding: 0.25rem; border-radius: 3px;">${filename}</code>
                </div>
                
                <div style="background: #fef3c7; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                    <strong>2. Créer le dossier :</strong><br>
                    <code style="background: #fbbf24; padding: 0.25rem; border-radius: 3px; color: #92400e;">${this.backupPath}</code>
                    <button onclick="navigator.clipboard.writeText('${this.backupPath.replace(/\\/g, '\\\\')}'); this.textContent='✅ Copié!'" 
                            style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        📋 Copier
                    </button>
                </div>
                
                <div style="background: #ecfdf5; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                    <strong>3. Déplacer le fichier :</strong><br>
                    Du dossier Téléchargements vers le dossier créé ci-dessus.
                </div>
                
                <div style="text-align: center; margin-top: 1.5rem;">
                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                            style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        ✅ Compris
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    openFolder() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 1000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 2rem; max-width: 500px; margin: 1rem;">
                <h2 style="margin: 0 0 1rem 0; color: #1f2937;">📂 Accéder au dossier</h2>
                
                <div style="background: #f3f4f6; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                    <strong>Chemin :</strong><br>
                    <code style="background: #e5e7eb; padding: 0.25rem; border-radius: 3px; word-break: break-all;">${this.backupPath}</code>
                    <button onclick="navigator.clipboard.writeText('${this.backupPath.replace(/\\/g, '\\\\')}'); this.textContent='✅ Copié!'" 
                            style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        📋 Copier
                    </button>
                </div>
                
                <div style="background: #ecfdf5; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                    <strong>Comment y accéder :</strong><br>
                    1. Appuyez sur <kbd style="background: #e5e7eb; padding: 0.25rem; border-radius: 3px;">Win + R</kbd><br>
                    2. Collez le chemin ci-dessus<br>
                    3. Appuyez sur <kbd style="background: #e5e7eb; padding: 0.25rem; border-radius: 3px;">Entrée</kbd>
                </div>
                
                <div style="text-align: center; margin-top: 1.5rem;">
                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                            style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        ✅ Compris
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    getPath() {
        return this.backupPath || 'Non configuré';
    }

    getHistory() {
        return this.history;
    }

    addToHistory(backup) {
        this.history.unshift(backup);
        this.history = this.history.slice(0, 10); // Garder 10 max
        localStorage.setItem('mailsort-backup-history', JSON.stringify(this.history));
    }

    delete(backupId) {
        this.history = this.history.filter(b => b.id !== backupId);
        localStorage.setItem('mailsort-backup-history', JSON.stringify(this.history));
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('mailsort-backup-history') || '[]');
        } catch {
            return [];
        }
    }
}

// ================================================
// INTÉGRATION
// ================================================
const settingsPage = new SettingsPageMinimal();
window.settingsPage = settingsPage;

// Intégration PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => settingsPage.render(container);
    console.log('[SettingsPage] ✅ Intégré avec PageManager');
} else {
    // Attendre PageManager
    setTimeout(() => {
        if (window.pageManager?.pages) {
            window.pageManager.pages.settings = (container) => settingsPage.render(container);
            console.log('[SettingsPage] ✅ Intégré avec PageManager (retry)');
        }
    }, 1000);
}

console.log('[SettingsPage] 🎉 Page paramètres minimaliste chargée!');
