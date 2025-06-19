// Extension pour CategoriesPage.js - Ajout onglet Paramètres avec sauvegarde externe
// À intégrer dans le CategoriesPage.js existant

// ================================================
// AJOUT DANS LA CLASSE EXISTANTE CategoriesPageManager
// ================================================

// Ajouter ces propriétés au constructor existant :
/*
// SYSTÈME DE SAUVEGARDE EXTERNE (à ajouter aux propriétés existantes)
this.externalBackupHandle = null;
this.backupFolderConfigured = false;
this.useDefaultBackup = true;
this.lastExternalBackup = null;
this.backupTimer = null;
this.activeTab = 'categories'; // 'categories' ou 'settings'
*/

// ================================================
// MODIFICATION DE LA MÉTHODE RENDER EXISTANTE
// ================================================
function renderCategoriesPageWithSettings() {
    const container = document.querySelector('#page-content') || document.body;
    
    container.innerHTML = `
        <div class="categories-page">
            <!-- Header existant conservé -->
            <div class="page-header">
                <h1><i class="fas fa-tags"></i> Gestion des catégories</h1>
                <p class="page-description">Organisez vos catégories et paramètres</p>
            </div>

            <!-- NOUVEAUX ONGLETS -->
            <div class="tabs-container">
                <div class="tabs-nav">
                    <button class="tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" data-tab="categories">
                        <i class="fas fa-tags"></i>
                        Catégories
                    </button>
                    <button class="tab-btn ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                        <i class="fas fa-cog"></i>
                        Paramètres & Sauvegarde
                    </button>
                </div>

                <!-- CONTENU ONGLET CATÉGORIES (format original conservé) -->
                <div class="tab-content ${this.activeTab === 'categories' ? 'active' : ''}" id="categories-tab">
                    ${this.renderOriginalCategoriesContent()}
                </div>

                <!-- CONTENU ONGLET PARAMÈTRES (nouveau) -->
                <div class="tab-content ${this.activeTab === 'settings' ? 'active' : ''}" id="settings-tab">
                    ${this.renderSettingsContent()}
                </div>
            </div>
        </div>

        <style>
        .categories-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .page-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }

        .page-header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .page-description {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
        }

        .tabs-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        .tabs-nav {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }

        .tab-btn {
            flex: 1;
            padding: 20px;
            border: none;
            background: transparent;
            color: #6c757d;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s ease;
            border-bottom: 3px solid transparent;
        }

        .tab-btn:hover {
            color: #495057;
            background: rgba(0, 123, 255, 0.05);
        }

        .tab-btn.active {
            color: #007bff;
            background: white;
            border-bottom-color: #007bff;
        }

        .tab-content {
            display: none;
            padding: 30px;
            min-height: 400px;
        }

        .tab-content.active {
            display: block;
        }

        /* Styles pour l'onglet paramètres */
        .settings-section {
            margin-bottom: 30px;
        }

        .settings-section-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #007bff;
        }

        .settings-section-header h3 {
            margin: 0 0 8px 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
        }

        .settings-section-header p {
            margin: 0;
            color: #6c757d;
            font-size: 14px;
        }

        .backup-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 30px;
        }

        .backup-card {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
            position: relative;
        }

        .backup-card:hover {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        .backup-card.default {
            border-left: 4px solid #28a745;
        }

        .backup-card.custom {
            border-left: 4px solid #007bff;
        }

        .backup-card h4 {
            margin: 0 0 12px 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
        }

        .backup-card p {
            margin: 0 0 15px 0;
            color: #6c757d;
            font-size: 14px;
            line-height: 1.5;
        }

        .backup-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .backup-status-indicator {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #28a745;
        }

        .backup-status-indicator.optional {
            background: #ffc107;
        }

        .btn {
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #007bff;
            color: white;
        }

        .btn-primary:hover {
            background: #0056b3;
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .btn-success:hover {
            background: #1e7e34;
        }

        .btn-warning {
            background: #ffc107;
            color: #212529;
        }

        .btn-warning:hover {
            background: #e0a800;
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .btn-secondary:hover {
            background: #545b62;
        }

        .backup-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin-top: 15px;
            font-size: 13px;
            color: #6c757d;
        }

        .backup-info.success {
            background: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
        }

        .backup-info.warning {
            background: #fff3cd;
            border-color: #ffeaa7;
            color: #856404;
        }

        .import-export-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
        }

        .import-export-section h4 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .import-export-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.success {
            background: #28a745;
        }

        .notification.error {
            background: #dc3545;
        }

        .notification.warning {
            background: #ffc107;
            color: #212529;
        }

        .notification.info {
            background: #17a2b8;
        }

        @media (max-width: 768px) {
            .backup-grid,
            .import-export-actions {
                grid-template-columns: 1fr;
            }

            .tabs-nav {
                flex-direction: column;
            }

            .tab-btn {
                border-bottom: none;
                border-right: 3px solid transparent;
            }

            .tab-btn.active {
                border-bottom: none;
                border-right-color: #007bff;
            }
        }
        </style>
    `;
}

// ================================================
// CONTENU ONGLET CATÉGORIES (FORMAT ORIGINAL)
// ================================================
function renderOriginalCategoriesContent() {
    return `
        <div class="categories-content">
            <div class="categories-header">
                <h3><i class="fas fa-tags"></i> Vos catégories</h3>
                <div class="categories-controls">
                    <div class="search-container">
                        <input type="text" id="category-search" placeholder="Rechercher une catégorie..." value="${this.searchTerm || ''}">
                        <i class="fas fa-search"></i>
                    </div>
                    <select id="category-filter">
                        <option value="all">Toutes les catégories</option>
                        <option value="default">Catégories par défaut</option>
                        <option value="custom">Catégories personnalisées</option>
                    </select>
                    <button id="add-category-btn" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        Ajouter une catégorie
                    </button>
                </div>
            </div>

            <div class="categories-list">
                <!-- Ici le contenu original des catégories -->
                <div class="category-placeholder">
                    <i class="fas fa-tags"></i>
                    <h4>Gestion des catégories</h4>
                    <p>Cette section contient votre interface de gestion des catégories existante.</p>
                    <p><em>Intégrez ici votre code de gestion des catégories existant.</em></p>
                </div>
            </div>

            <div class="categories-pagination">
                <!-- Pagination existante -->
            </div>
        </div>
    `;
}

// ================================================
// CONTENU ONGLET PARAMÈTRES (NOUVEAU)
// ================================================
function renderSettingsContent() {
    return `
        <div class="settings-content">
            <!-- SECTION SAUVEGARDE EXTERNE -->
            <div class="settings-section">
                <div class="settings-section-header">
                    <h3><i class="fas fa-shield-alt"></i> Sauvegarde externe</h3>
                    <p>Protégez vos données avec un système de sauvegarde externe automatique</p>
                </div>

                <div class="backup-grid">
                    <!-- SAUVEGARDE PAR DÉFAUT -->
                    <div class="backup-card default">
                        <div class="backup-status-indicator"></div>
                        <h4><i class="fas fa-download"></i> Sauvegarde automatique</h4>
                        <p>Sauvegarde automatique dans votre dossier Téléchargements. 
                           <strong>Toujours active</strong> et ne nécessite aucune configuration.</p>
                        <div class="backup-actions">
                            <button id="manual-default-backup-btn" class="btn btn-success">
                                <i class="fas fa-save"></i>
                                Sauvegarder maintenant
                            </button>
                        </div>
                        <div class="backup-info success">
                            <i class="fas fa-check-circle"></i>
                            <strong>Actif :</strong> Fichiers créés toutes les 10 minutes.
                            Recherchez "EmailSortPro-" dans vos téléchargements.
                        </div>
                    </div>

                    <!-- SAUVEGARDE PERSONNALISÉE -->
                    <div class="backup-card custom">
                        <div class="backup-status-indicator ${this.backupFolderConfigured ? '' : 'optional'}"></div>
                        <h4><i class="fas fa-folder-open"></i> Dossier personnalisé</h4>
                        <p>Choisissez un dossier permanent pour un accès direct à vos fichiers de sauvegarde.</p>
                        <div class="backup-actions">
                            ${this.backupFolderConfigured ? `
                                <button id="manual-custom-backup-btn" class="btn btn-success">
                                    <i class="fas fa-save"></i>
                                    Sauvegarder maintenant
                                </button>
                                <button id="reconfigure-custom-btn" class="btn btn-warning">
                                    <i class="fas fa-folder"></i>
                                    Changer de dossier
                                </button>
                            ` : `
                                <button id="setup-custom-btn" class="btn btn-primary">
                                    <i class="fas fa-folder-plus"></i>
                                    Configurer un dossier
                                </button>
                            `}
                        </div>
                        <div class="backup-info ${this.backupFolderConfigured ? 'success' : 'warning'}">
                            ${this.backupFolderConfigured ? `
                                <i class="fas fa-check-circle"></i>
                                <strong>Configuré :</strong> Dossier personnalisé actif.
                                Dernière sauvegarde : ${this.getLastBackupTime()}
                            ` : `
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>Optionnel :</strong> Configurez pour un accès direct aux fichiers.
                            `}
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION IMPORT/EXPORT -->
            <div class="settings-section">
                <div class="settings-section-header">
                    <h3><i class="fas fa-exchange-alt"></i> Import / Export manuel</h3>
                    <p>Importez ou exportez vos données manuellement pour transfert ou sauvegarde ponctuelle</p>
                </div>

                <div class="import-export-section">
                    <h4><i class="fas fa-tools"></i> Outils de transfert</h4>
                    <div class="import-export-actions">
                        <button id="export-all-btn" class="btn btn-primary">
                            <i class="fas fa-download"></i>
                            Exporter toutes les données
                        </button>
                        <button id="import-all-btn" class="btn btn-secondary">
                            <i class="fas fa-upload"></i>
                            Importer des données
                        </button>
                        <button id="export-categories-only-btn" class="btn btn-primary">
                            <i class="fas fa-tags"></i>
                            Exporter catégories uniquement
                        </button>
                        <button id="import-categories-only-btn" class="btn btn-secondary">
                            <i class="fas fa-tags"></i>
                            Importer catégories uniquement
                        </button>
                    </div>
                    <div class="backup-info">
                        <i class="fas fa-info-circle"></i>
                        <strong>Utilisation :</strong> Export pour sauvegarder ou transférer vers un autre appareil. 
                        Import pour restaurer des données depuis un fichier de sauvegarde.
                    </div>
                </div>
            </div>

            <!-- SECTION STATUT -->
            <div class="settings-section">
                <div class="settings-section-header">
                    <h3><i class="fas fa-info-circle"></i> Statut du système</h3>
                    <p>Informations sur vos données et sauvegardes</p>
                </div>

                <div class="status-grid">
                    <div class="status-card">
                        <h4><i class="fas fa-tags"></i> Catégories</h4>
                        <div class="status-value">${this.getCategoriesCount()} catégories</div>
                        <small>dont ${this.getCustomCategoriesCount()} personnalisées</small>
                    </div>
                    <div class="status-card">
                        <h4><i class="fas fa-tasks"></i> Tâches</h4>
                        <div class="status-value">${this.getTasksCount()} tâches</div>
                        <small>dans le système</small>
                    </div>
                    <div class="status-card">
                        <h4><i class="fas fa-database"></i> Taille des données</h4>
                        <div class="status-value">${this.getDataSize()}</div>
                        <small>espace utilisé</small>
                    </div>
                    <div class="status-card">
                        <h4><i class="fas fa-clock"></i> Dernière sauvegarde</h4>
                        <div class="status-value">${this.getLastBackupTime()}</div>
                        <small>sauvegarde automatique</small>
                    </div>
                </div>
            </div>
        </div>

        <style>
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .status-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .status-card:hover {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        .status-card h4 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
        }

        .status-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 5px;
        }

        .status-card small {
            color: #6c757d;
            font-size: 12px;
        }
        </style>
    `;
}

// ================================================
// MÉTHODES DE SAUVEGARDE EXTERNE
// ================================================

// Sauvegarde hybride (défaut + personnalisé)
async function performHybridBackup(trigger = 'auto') {
    try {
        const timestamp = new Date().toISOString();
        
        // Collecter toutes les données
        const fullBackup = {
            version: '1.0',
            exportDate: timestamp,
            source: 'EmailSortPro-Categories',
            trigger: trigger,
            data: {
                categories: this.collectCategoriesData(),
                tasks: this.collectTasksData(),
                settings: this.collectSettingsData()
            }
        };

        let successCount = 0;

        // 1. SAUVEGARDE PAR DÉFAUT (Téléchargements)
        try {
            await this.performDefaultBackup(fullBackup, trigger);
            successCount++;
        } catch (error) {
            console.warn('[Categories] Erreur sauvegarde par défaut:', error);
        }

        // 2. SAUVEGARDE PERSONNALISÉE (si configurée)
        if (this.backupFolderConfigured && this.externalBackupHandle) {
            try {
                await this.performCustomBackup(fullBackup);
                successCount++;
            } catch (error) {
                console.warn('[Categories] Erreur sauvegarde personnalisée:', error);
                this.backupFolderConfigured = false;
            }
        }

        this.lastExternalBackup = new Date();
        localStorage.setItem('emailsortpro_last_categories_backup', timestamp);

        if (trigger === 'manual') {
            this.showNotification(`✅ Sauvegarde réussie sur ${successCount} emplacements !`, 'success');
        }

        return true;

    } catch (error) {
        console.error('[Categories] Erreur sauvegarde:', error);
        if (trigger === 'manual') {
            this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
        }
        return false;
    }
}

// Sauvegarde par défaut (téléchargements)
async function performDefaultBackup(fullBackup, trigger) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    let filename;
    if (trigger === 'manual') {
        filename = `EmailSortPro-Categories-Manuel-${dateStr}_${timeStr}.json`;
    } else {
        filename = `EmailSortPro-Categories-Auto-${dateStr}_${timeStr}.json`;
    }

    return this.downloadBackupFile(fullBackup, filename);
}

// Configuration dossier personnalisé
async function configureCustomBackup() {
    try {
        if (!window.showDirectoryPicker) {
            this.showNotification('Votre navigateur ne supporte pas l\'accès aux dossiers', 'error');
            return false;
        }

        const directoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'documents',
            id: 'emailsortpro-categories-backup'
        });

        let backupFolderHandle;
        try {
            backupFolderHandle = await directoryHandle.getDirectoryHandle('EmailSortPro-Categories');
        } catch {
            backupFolderHandle = await directoryHandle.getDirectoryHandle('EmailSortPro-Categories', { create: true });
        }

        await this.testWriteAccess(backupFolderHandle);

        this.externalBackupHandle = backupFolderHandle;
        this.backupFolderConfigured = true;
        await this.saveBackupHandle(backupFolderHandle);

        await this.performHybridBackup('custom-setup');

        this.showNotification('✅ Dossier personnalisé configuré avec succès !', 'success');
        this.switchTab('settings'); // Recharger l'onglet paramètres

        return true;

    } catch (error) {
        if (error.name === 'AbortError') {
            this.showNotification('Configuration annulée', 'info');
        } else {
            this.showNotification('Erreur lors de la configuration', 'error');
        }
        return false;
    }
}

// ================================================
// GESTION DES ONGLETS
// ================================================
function switchTab(tabName) {
    this.activeTab = tabName;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Mettre à jour le contenu
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function attachTabEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            this.switchTab(btn.dataset.tab);
        });
    });
}

// ================================================
// ÉVÉNEMENTS SAUVEGARDE
// ================================================
function attachBackupEvents() {
    // Sauvegarde manuelle par défaut
    document.getElementById('manual-default-backup-btn')?.addEventListener('click', () => {
        this.performHybridBackup('manual-default');
    });

    // Configuration dossier personnalisé
    document.getElementById('setup-custom-btn')?.addEventListener('click', () => {
        this.configureCustomBackup();
    });

    // Reconfiguration
    document.getElementById('reconfigure-custom-btn')?.addEventListener('click', () => {
        this.configureCustomBackup();
    });

    // Sauvegarde personnalisée
    document.getElementById('manual-custom-backup-btn')?.addEventListener('click', () => {
        this.performHybridBackup('manual-custom');
    });

    // Export complet
    document.getElementById('export-all-btn')?.addEventListener('click', () => {
        this.exportAllData();
    });

    // Import complet
    document.getElementById('import-all-btn')?.addEventListener('click', () => {
        this.importAllData();
    });

    // Export catégories seulement
    document.getElementById('export-categories-only-btn')?.addEventListener('click', () => {
        this.exportCategoriesOnly();
    });

    // Import catégories seulement
    document.getElementById('import-categories-only-btn')?.addEventListener('click', () => {
        this.importCategoriesOnly();
    });
}

// ================================================
// MÉTHODES UTILITAIRES
// ================================================
function collectCategoriesData() {
    try {
        return {
            all: window.categoryManager?.getCategories() || [],
            custom: window.categoryManager?.getCustomCategories() || [],
            keywords: window.categoryManager?.getAllKeywords() || {}
        };
    } catch (error) {
        return { all: [], custom: [], keywords: {} };
    }
}

function collectTasksData() {
    try {
        const tasks = window.taskManager?.getAllTasks() || [];
        return {
            all: tasks,
            count: tasks.length
        };
    } catch (error) {
        return { all: [], count: 0 };
    }
}

function collectSettingsData() {
    const settings = {};
    ['emailsortpro_settings', 'categorySettings'].forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                settings[key] = JSON.parse(value);
            } catch {
                settings[key] = value;
            }
        }
    });
    return settings;
}

function getCategoriesCount() {
    return window.categoryManager?.getCategories()?.length || 0;
}

function getCustomCategoriesCount() {
    return window.categoryManager?.getCustomCategories()?.length || 0;
}

function getTasksCount() {
    return window.taskManager?.getAllTasks()?.length || 0;
}

function getDataSize() {
    try {
        const data = this.collectCategoriesData();
        const sizeKB = Math.round(JSON.stringify(data).length / 1024);
        return `${sizeKB} KB`;
    } catch {
        return 'N/A';
    }
}

function getLastBackupTime() {
    const lastBackup = this.lastExternalBackup || 
        (localStorage.getItem('emailsortpro_last_categories_backup') ? 
         new Date(localStorage.getItem('emailsortpro_last_categories_backup')) : null);
    
    return lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais';
}

async function downloadBackupFile(data, filename) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        return true;
    } catch (error) {
        console.error('[Categories] Erreur téléchargement:', error);
        return false;
    }
}

function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// ================================================
// TIMER DE SAUVEGARDE AUTOMATIQUE
// ================================================
function startCategoriesBackupTimer() {
    if (this.backupTimer) {
        clearInterval(this.backupTimer);
    }

    // Sauvegarde automatique toutes les 10 minutes
    this.backupTimer = setInterval(() => {
        this.performHybridBackup('timer');
    }, 600000);

    console.log('[Categories] ⏰ Timer de sauvegarde démarré (10 min)');
}

// ================================================
// INTÉGRATION DANS CATEGORIESPAGE.JS EXISTANT
// ================================================

// Pour intégrer dans votre CategoriesPage.js existant :
/*
1. Ajoutez les propriétés de sauvegarde au constructor
2. Remplacez la méthode render() par renderCategoriesPageWithSettings()
3. Ajoutez toutes les méthodes ci-dessus à votre classe
4. Appelez attachTabEvents() et attachBackupEvents() après le render
5. Appelez startCategoriesBackupTimer() dans l'init
*/

console.log('✅ Extension CategoriesPage avec onglet Paramètres & Sauvegarde externe prête');
