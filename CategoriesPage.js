// categoryPage.js - Page paramètres complète avec backup fonctionnel

class CategoryPage {
    constructor() {
        this.categories = this.getDefaultCategories();
        this.initPage();
    }

    getDefaultCategories() {
        return {
            'work': { name: 'Travail', color: '#3b82f6', keywords: ['meeting', 'project', 'deadline'], count: 0 },
            'personal': { name: 'Personnel', color: '#10b981', keywords: ['family', 'friend', 'personal'], count: 0 },
            'finance': { name: 'Finance', color: '#f59e0b', keywords: ['bank', 'payment', 'invoice'], count: 0 },
            'shopping': { name: 'Shopping', color: '#ef4444', keywords: ['order', 'delivery', 'purchase'], count: 0 },
            'newsletter': { name: 'Newsletter', color: '#8b5cf6', keywords: ['newsletter', 'unsubscribe', 'update'], count: 0 }
        };
    }

    initPage() {
        this.loadCategories();
        this.createSettingsPage();
        this.attachEventListeners();
        
        // Initialiser le service de backup avec création automatique
        setTimeout(() => {
            this.initBackupService();
        }, 500);
    }

    loadCategories() {
        try {
            const saved = localStorage.getItem('emailsortpro_categories');
            if (saved) {
                this.categories = { ...this.getDefaultCategories(), ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('[Categories] Utilisation des catégories par défaut');
        }
    }

    saveCategories() {
        try {
            localStorage.setItem('emailsortpro_categories', JSON.stringify(this.categories));
            console.log('[Categories] Sauvegardées:', Object.keys(this.categories).length);
        } catch (error) {
            console.error('[Categories] Erreur sauvegarde:', error);
        }
    }

    createSettingsPage() {
        const settingsHTML = `
            <div id="settings-page" class="page-content" data-page="settings" style="display: none;">
                <div class="settings-container">
                    <div class="settings-header">
                        <h2><i class="fas fa-cog"></i> Paramètres EmailSortPro</h2>
                        <p class="settings-subtitle">Gérez vos catégories et configurez vos sauvegardes</p>
                    </div>

                    <!-- Navigation par onglets -->
                    <div class="settings-tabs">
                        <button class="tab-btn active" data-tab="categories">
                            <i class="fas fa-tags"></i> Catégories
                        </button>
                        <button class="tab-btn" data-tab="backup">
                            <i class="fas fa-save"></i> Sauvegarde
                        </button>
                        <button class="tab-btn" data-tab="general">
                            <i class="fas fa-user"></i> Général
                        </button>
                    </div>

                    <!-- Onglet Catégories -->
                    <div id="tab-categories" class="tab-content active">
                        <div class="settings-section">
                            <h3 class="settings-section-title">
                                <i class="fas fa-tags"></i> Gestion des Catégories
                            </h3>
                            <div class="settings-content">
                                <!-- Ajouter nouvelle catégorie -->
                                <div class="setting-item">
                                    <h4>Ajouter une nouvelle catégorie</h4>
                                    <div class="add-category-form">
                                        <input type="text" id="new-category-name" placeholder="Nom de la catégorie" class="form-control">
                                        <input type="color" id="new-category-color" value="#3b82f6" class="color-input">
                                        <input type="text" id="new-category-keywords" placeholder="Mots-clés (séparés par des virgules)" class="form-control">
                                        <button id="add-category-btn" class="btn btn-primary">
                                            <i class="fas fa-plus"></i> Ajouter
                                        </button>
                                    </div>
                                </div>

                                <!-- Liste des catégories existantes -->
                                <div class="setting-item">
                                    <h4>Catégories existantes</h4>
                                    <div id="categories-list" class="categories-list">
                                        <!-- Les catégories seront ajoutées ici -->
                                    </div>
                                </div>

                                <!-- Actions globales -->
                                <div class="setting-item">
                                    <div class="category-actions">
                                        <button id="save-categories-btn" class="btn btn-success">
                                            <i class="fas fa-save"></i> Sauvegarder les catégories
                                        </button>
                                        <button id="reset-categories-btn" class="btn btn-warning">
                                            <i class="fas fa-undo"></i> Réinitialiser
                                        </button>
                                        <button id="export-categories-btn" class="btn btn-secondary">
                                            <i class="fas fa-download"></i> Exporter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Onglet Sauvegarde -->
                    <div id="tab-backup" class="tab-content">
                        <div class="settings-section">
                            <h3 class="settings-section-title">
                                <i class="fas fa-save"></i> Système de Sauvegarde
                            </h3>
                            <div class="settings-content">
                                <!-- Statut de la sauvegarde -->
                                <div class="setting-item">
                                    <div class="backup-status-display">
                                        <div class="status-indicator" id="backup-status-indicator">
                                            <i class="fas fa-circle"></i>
                                            <span id="backup-status-text">Initialisation...</span>
                                        </div>
                                        <p id="backup-status-detail">Configuration du système de sauvegarde en cours...</p>
                                    </div>
                                </div>

                                <!-- Configuration automatique -->
                                <div class="setting-item">
                                    <h4>Configuration automatique</h4>
                                    <p class="setting-description">
                                        Le système crée automatiquement un dossier "EmailSortPro-Backup" dans vos Documents
                                    </p>
                                    <button id="auto-setup-btn" class="btn btn-primary">
                                        <i class="fas fa-magic"></i> Configuration automatique
                                    </button>
                                </div>

                                <!-- Configuration manuelle -->
                                <div class="setting-item">
                                    <h4>Configuration manuelle</h4>
                                    <button id="select-backup-folder-btn" class="btn btn-secondary">
                                        <i class="fas fa-folder-open"></i> Choisir un dossier
                                    </button>
                                    <div id="backup-folder-display" style="display: none;">
                                        <p class="folder-path"><strong>Dossier :</strong> <span id="backup-folder-path">Aucun</span></p>
                                    </div>
                                </div>

                                <!-- Paramètres de sauvegarde -->
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="backup-enabled">
                                        Activer les sauvegardes automatiques
                                    </label>
                                </div>

                                <div class="setting-item">
                                    <label for="backup-frequency">Fréquence de sauvegarde :</label>
                                    <select id="backup-frequency" class="form-control">
                                        <option value="15">Toutes les 15 minutes</option>
                                        <option value="30">Toutes les 30 minutes</option>
                                        <option value="60" selected>Toutes les heures</option>
                                        <option value="360">Toutes les 6 heures</option>
                                        <option value="1440">Quotidienne</option>
                                    </select>
                                </div>

                                <!-- Actions manuelles -->
                                <div class="setting-item">
                                    <div class="backup-actions">
                                        <button id="manual-backup-btn" class="btn btn-success">
                                            <i class="fas fa-save"></i> Sauvegarder maintenant
                                        </button>
                                        <button id="create-test-files-btn" class="btn btn-info">
                                            <i class="fas fa-file"></i> Créer fichiers de test
                                        </button>
                                    </div>
                                </div>

                                <!-- Import/Export -->
                                <div class="setting-item">
                                    <h4>Import/Export</h4>
                                    <div class="import-export-actions">
                                        <button id="export-backup-btn" class="btn btn-primary">
                                            <i class="fas fa-download"></i> Exporter toutes les données
                                        </button>
                                        <div class="import-section">
                                            <input type="file" id="import-backup-file" accept=".json" class="form-control">
                                            <button id="import-backup-btn" class="btn btn-warning" disabled>
                                                <i class="fas fa-upload"></i> Importer les données
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Informations de sauvegarde -->
                                <div class="setting-item">
                                    <div class="backup-info">
                                        <h5>Informations :</h5>
                                        <div class="info-grid">
                                            <div class="info-item">
                                                <strong>Dernière sauvegarde :</strong>
                                                <span id="last-backup-time">Jamais</span>
                                            </div>
                                            <div class="info-item">
                                                <strong>Nombre de fichiers :</strong>
                                                <span id="backup-files-count">0</span>
                                            </div>
                                            <div class="info-item">
                                                <strong>Taille estimée :</strong>
                                                <span id="backup-size">0 KB</span>
                                            </div>
                                            <div class="info-item">
                                                <strong>Statut :</strong>
                                                <span id="backup-service-status">Non initialisé</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Onglet Général -->
                    <div id="tab-general" class="tab-content">
                        <div class="settings-section">
                            <h3 class="settings-section-title">
                                <i class="fas fa-user"></i> Paramètres Généraux
                            </h3>
                            <div class="settings-content">
                                <div class="setting-item">
                                    <label for="user-name">Nom d'utilisateur :</label>
                                    <input type="text" id="user-name" class="form-control" placeholder="Votre nom">
                                </div>
                                
                                <div class="setting-item">
                                    <label for="user-email">Email :</label>
                                    <input type="email" id="user-email" class="form-control" placeholder="votre.email@exemple.com">
                                </div>
                                
                                <div class="setting-item">
                                    <label for="theme-select">Thème :</label>
                                    <select id="theme-select" class="form-control">
                                        <option value="light">Clair</option>
                                        <option value="dark">Sombre</option>
                                        <option value="auto">Automatique</option>
                                    </select>
                                </div>

                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="auto-sort" checked>
                                        Tri automatique des emails
                                    </label>
                                </div>

                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="notifications-enabled" checked>
                                        Activer les notifications
                                    </label>
                                </div>

                                <div class="setting-item">
                                    <button id="clear-data-btn" class="btn btn-danger">
                                        <i class="fas fa-trash"></i> Effacer toutes les données
                                    </button>
                                    <p class="setting-description">⚠️ Cette action est irréversible</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Boutons de sauvegarde globaux -->
                    <div class="settings-footer">
                        <button id="save-all-settings-btn" class="btn btn-success">
                            <i class="fas fa-save"></i> Sauvegarder tous les paramètres
                        </button>
                        <button id="close-settings-btn" class="btn btn-outline-secondary">
                            <i class="fas fa-times"></i> Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter la page au DOM
        if (!document.getElementById('settings-page')) {
            document.body.insertAdjacentHTML('beforeend', settingsHTML);
        }

        this.addSettingsStyles();
        this.renderCategories();
    }

    addSettingsStyles() {
        if (document.getElementById('settings-styles')) return;

        const styles = `
            <style id="settings-styles">
                .settings-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .settings-header {
                    text-align: center;
                    margin-bottom: 30px;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .settings-header h2 {
                    color: #1e293b;
                    margin-bottom: 10px;
                    font-size: 2.2rem;
                }

                .settings-subtitle {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                /* Onglets */
                .settings-tabs {
                    display: flex;
                    background: white;
                    border-radius: 12px;
                    padding: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    gap: 4px;
                }

                .tab-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .tab-btn:hover {
                    background: #f1f5f9;
                    color: #475569;
                }

                .tab-btn.active {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                }

                .tab-content {
                    display: none;
                }

                .tab-content.active {
                    display: block;
                }

                .settings-section {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .settings-section-title {
                    color: #1e293b;
                    font-size: 1.4rem;
                    font-weight: 600;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .settings-section-title i {
                    margin-right: 12px;
                    color: #3b82f6;
                }

                .setting-item {
                    margin-bottom: 25px;
                    padding: 20px 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .setting-item:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }

                .setting-item h4 {
                    color: #374151;
                    margin-bottom: 10px;
                    font-size: 1.1rem;
                }

                .setting-item label {
                    display: block;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 8px;
                }

                .form-control {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    background: white;
                }

                .form-control:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    text-decoration: none;
                }

                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .btn-primary { background: #3b82f6; color: white; }
                .btn-secondary { background: #6b7280; color: white; }
                .btn-success { background: #10b981; color: white; }
                .btn-warning { background: #f59e0b; color: white; }
                .btn-danger { background: #ef4444; color: white; }
                .btn-info { background: #06b6d4; color: white; }
                .btn-outline-secondary { 
                    background: transparent; 
                    color: #6b7280; 
                    border: 2px solid #6b7280; 
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }

                /* Catégories */
                .add-category-form {
                    display: grid;
                    grid-template-columns: 2fr auto 2fr auto;
                    gap: 12px;
                    align-items: end;
                }

                .color-input {
                    width: 50px;
                    height: 44px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .categories-list {
                    display: grid;
                    gap: 15px;
                    margin-top: 20px;
                }

                .category-item {
                    display: grid;
                    grid-template-columns: auto 1fr auto auto;
                    gap: 15px;
                    align-items: center;
                    padding: 15px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }

                .category-item:hover {
                    border-color: #e2e8f0;
                    background: #f1f5f9;
                }

                .category-color {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .category-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .category-name {
                    font-weight: 600;
                    color: #1e293b;
                }

                .category-keywords {
                    font-size: 12px;
                    color: #64748b;
                }

                .category-count {
                    background: #3b82f6;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    min-width: 24px;
                    text-align: center;
                }

                .category-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                /* Backup */
                .backup-status-display {
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    border-radius: 12px;
                    padding: 20px;
                    border: 2px solid #bae6fd;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .status-indicator.active { color: #059669; }
                .status-indicator.inactive { color: #dc2626; }
                .status-indicator.warning { color: #d97706; }

                .backup-actions {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .import-export-actions {
                    display: grid;
                    gap: 15px;
                }

                .import-section {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 12px;
                    align-items: end;
                }

                .folder-path {
                    background: #e0f2fe;
                    padding: 12px;
                    border-radius: 6px;
                    border-left: 4px solid #0891b2;
                    margin-top: 10px;
                    font-size: 14px;
                }

                .backup-info {
                    background: #f0f9ff;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #bae6fd;
                }

                .backup-info h5 {
                    margin: 0 0 15px 0;
                    color: #0369a1;
                    font-size: 1.1rem;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: white;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .setting-description {
                    font-size: 13px;
                    color: #64748b;
                    margin-top: 8px;
                    font-style: italic;
                }

                .settings-footer {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .settings-container { padding: 15px; }
                    .settings-section { padding: 20px; }
                    .add-category-form { grid-template-columns: 1fr; }
                    .category-item { grid-template-columns: 1fr; text-align: center; }
                    .settings-tabs { flex-direction: column; }
                    .backup-actions { flex-direction: column; }
                    .import-section { grid-template-columns: 1fr; }
                }

                /* Animations */
                .settings-section {
                    animation: slideInUp 0.5s ease forwards;
                }

                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    renderCategories() {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;

        categoriesList.innerHTML = '';

        Object.entries(this.categories).forEach(([id, category]) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.innerHTML = `
                <div class="category-color" style="background-color: ${category.color}"></div>
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-keywords">Mots-clés: ${category.keywords.join(', ')}</div>
                </div>
                <div class="category-count">${category.count}</div>
                <div class="category-actions">
                    <button class="btn btn-secondary btn-sm" onclick="window.categoryPage.editCategory('${id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.categoryPage.deleteCategory('${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            categoriesList.appendChild(categoryElement);
        });
    }

    attachEventListeners() {
        setTimeout(() => {
            this.setupTabNavigation();
            this.setupCategoryHandlers();
            this.setupBackupHandlers();
            this.setupGeneralHandlers();
            this.loadSettings();
        }, 100);
    }

    setupTabNavigation() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;

                // Désactiver tous les onglets
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Activer l'onglet sélectionné
                btn.classList.add('active');
                document.getElementById(`tab-${targetTab}`).classList.add('active');

                // Actualiser l'interface backup si nécessaire
                if (targetTab === 'backup') {
                    setTimeout(() => this.updateBackupUI(), 100);
                }
            });
        });
    }

    setupCategoryHandlers() {
        // Ajouter nouvelle catégorie
        const addBtn = document.getElementById('add-category-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCategory());
        }

        // Sauvegarder catégories
        const saveBtn = document.getElementById('save-categories-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCategories();
                this.showNotification('Catégories sauvegardées!', 'success');
            });
        }

        // Réinitialiser catégories
        const resetBtn = document.getElementById('reset-categories-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCategories());
        }

        // Exporter catégories
        const exportBtn = document.getElementById('export-categories-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCategories());
        }
    }

    setupBackupHandlers() {
        // Configuration automatique
        const autoSetupBtn = document.getElementById('auto-setup-btn');
        if (autoSetupBtn) {
            autoSetupBtn.addEventListener('click', () => this.autoSetupBackup());
        }

        // Sélection manuelle du dossier
        const selectFolderBtn = document.getElementById('select-backup-folder-btn');
        if (selectFolderBtn) {
            selectFolderBtn.addEventListener('click', () => this.selectBackupFolder());
        }

        // Activer/désactiver backup
        const backupEnabled = document.getElementById('backup-enabled');
        if (backupEnabled) {
            backupEnabled.addEventListener('change', (e) => {
                if (window.backupService) {
                    if (e.target.checked) {
                        window.backupService.enable();
                    } else {
                        window.backupService.disable();
                    }
                    this.updateBackupUI();
                }
            });
        }

        // Fréquence de backup
        const frequencySelect = document.getElementById('backup-frequency');
        if (frequencySelect) {
            frequencySelect.addEventListener('change', (e) => {
                if (window.backupService) {
                    window.backupService.setFrequency(parseInt(e.target.value));
                    this.showNotification('Fréquence mise à jour!', 'info');
                }
            });
        }

        // Backup manuel
        const manualBackupBtn = document.getElementById('manual-backup-btn');
        if (manualBackupBtn) {
            manualBackupBtn.addEventListener('click', () => this.performManualBackup());
        }

        // Créer fichiers de test
        const createTestBtn = document.getElementById('create-test-files-btn');
        if (createTestBtn) {
            createTestBtn.addEventListener('click', () => this.createTestFiles());
        }

        // Export/Import
        const exportBackupBtn = document.getElementById('export-backup-btn');
        if (exportBackupBtn) {
            exportBackupBtn.addEventListener('click', () => this.exportAllData());
        }

        const importFile = document.getElementById('import-backup-file');
        const importBtn = document.getElementById('import-backup-btn');
        
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                if (importBtn) {
                    importBtn.disabled = !e.target.files.length;
                }
            });
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }
    }

    setupGeneralHandlers() {
        // Sauvegarder tous les paramètres
        const saveAllBtn = document.getElementById('save-all-settings-btn');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => this.saveAllSettings());
        }

        // Fermer les paramètres
        const closeBtn = document.getElementById('close-settings-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Effacer toutes les données
        const clearDataBtn = document.getElementById('clear-data-btn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }

        // Changement de thème
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================

    addCategory() {
        const nameInput = document.getElementById('new-category-name');
        const colorInput = document.getElementById('new-category-color');
        const keywordsInput = document.getElementById('new-category-keywords');

        if (!nameInput.value.trim()) {
            this.showNotification('Veuillez entrer un nom de catégorie', 'warning');
            return;
        }

        const id = nameInput.value.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        
        if (this.categories[id]) {
            this.showNotification('Cette catégorie existe déjà', 'warning');
            return;
        }

        const keywords = keywordsInput.value.split(',').map(k => k.trim()).filter(k => k);

        this.categories[id] = {
            name: nameInput.value.trim(),
            color: colorInput.value,
            keywords: keywords,
            count: 0
        };

        // Vider les champs
        nameInput.value = '';
        keywordsInput.value = '';
        colorInput.value = '#3b82f6';

        this.renderCategories();
        this.saveCategories();
        this.showNotification('Catégorie ajoutée!', 'success');
    }

    editCategory(id) {
        const category = this.categories[id];
        if (!category) return;

        const newName = prompt('Nouveau nom:', category.name);
        if (newName && newName.trim()) {
            category.name = newName.trim();
            this.renderCategories();
            this.saveCategories();
            this.showNotification('Catégorie modifiée!', 'success');
        }
    }

    deleteCategory(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            delete this.categories[id];
            this.renderCategories();
            this.saveCategories();
            this.showNotification('Catégorie supprimée!', 'info');
        }
    }

    resetCategories() {
        if (confirm('Réinitialiser toutes les catégories aux valeurs par défaut ?')) {
            this.categories = this.getDefaultCategories();
            this.renderCategories();
            this.saveCategories();
            this.showNotification('Catégories réinitialisées!', 'info');
        }
    }

    exportCategories() {
        const data = {
            version: '4.0',
            timestamp: new Date().toISOString(),
            categories: this.categories
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `EmailSortPro-Categories-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Catégories exportées!', 'success');
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================

    initBackupService() {
        console.log('[CategoryPage] Initialisation du service de backup...');
        
        // Vérifier si le service de backup global existe
        if (window.backupService) {
            console.log('[CategoryPage] Service de backup trouvé:', window.backupService);
            this.updateBackupUI();
        } else {
            // Créer un service de backup simple
            this.createSimpleBackupService();
        }
        
        // Mettre à jour l'interface toutes les 5 secondes
        setInterval(() => {
            this.updateBackupUI();
        }, 5000);
    }

    createSimpleBackupService() {
        window.backupService = {
            folderHandle: null,
            enabled: false,
            frequency: 60,
            lastBackup: null,
            filesCount: 0,

            async enable() {
                this.enabled = true;
                this.startTimer();
                return true;
            },

            disable() {
                this.enabled = false;
                this.stopTimer();
            },

            setFrequency(minutes) {
                this.frequency = minutes;
                if (this.enabled) {
                    this.stopTimer();
                    this.startTimer();
                }
            },

            startTimer() {
                if (this.timer) clearInterval(this.timer);
                this.timer = setInterval(() => {
                    this.performBackup();
                }, this.frequency * 60 * 1000);
            },

            stopTimer() {
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            },

            async selectFolder() {
                try {
                    if (!window.showDirectoryPicker) {
                        throw new Error('API non supportée');
                    }
                    this.folderHandle = await window.showDirectoryPicker({
                        mode: 'readwrite',
                        startIn: 'documents',
                        id: 'emailsortpro-backup'
                    });
                    return true;
                } catch (error) {
                    console.error('Erreur sélection dossier:', error);
                    return false;
                }
            },

            async performBackup() {
                if (!this.folderHandle) return false;

                try {
                    const data = this.collectData();
                    const timestamp = new Date();
                    const fileName = `EmailSortPro-Backup-${timestamp.toISOString().split('T')[0]}_${timestamp.toTimeString().split(' ')[0].replace(/:/g, '-')}.json`;

                    const fileHandle = await this.folderHandle.getFileHandle(fileName, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(JSON.stringify(data, null, 2));
                    await writable.close();

                    this.lastBackup = timestamp;
                    this.updateFilesCount();
                    return true;
                } catch (error) {
                    console.error('Erreur backup:', error);
                    return false;
                }
            },

            collectData() {
                return {
                    version: '4.0',
                    timestamp: new Date().toISOString(),
                    data: {
                        categories: window.categoryPage?.categories || {},
                        settings: this.getSettings(),
                        localStorage: this.getLocalStorageData()
                    }
                };
            },

            getSettings() {
                try {
                    return JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
                } catch {
                    return {};
                }
            },

            getLocalStorageData() {
                const data = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('emailsortpro_')) {
                        data[key] = localStorage.getItem(key);
                    }
                }
                return data;
            },

            async updateFilesCount() {
                if (!this.folderHandle) return;
                try {
                    let count = 0;
                    for await (const [name] of this.folderHandle.entries()) {
                        if (name.startsWith('EmailSortPro-Backup-')) {
                            count++;
                        }
                    }
                    this.filesCount = count;
                } catch {
                    this.filesCount = 0;
                }
            },

            getStatus() {
                return {
                    enabled: this.enabled,
                    folderConfigured: !!this.folderHandle,
                    lastBackup: this.lastBackup ? this.lastBackup.toLocaleString('fr-FR') : null,
                    filesCount: this.filesCount,
                    frequency: this.frequency
                };
            }
        };

        console.log('[CategoryPage] Service de backup simple créé');
        this.updateBackupUI();
    }

    async autoSetupBackup() {
        const btn = document.getElementById('auto-setup-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Configuration...';

        try {
            // Créer des données de test d'abord
            await this.createTestData();

            if (window.backupService) {
                const success = await window.backupService.selectFolder();
                if (success) {
                    await window.backupService.performBackup();
                    window.backupService.enable();
                    this.showNotification('Configuration automatique réussie!', 'success');
                } else {
                    this.showNotification('Erreur lors de la configuration', 'error');
                }
            }
        } catch (error) {
            console.error('Erreur auto-setup:', error);
            this.showNotification('Erreur: ' + error.message, 'error');
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Configuration automatique';
        this.updateBackupUI();
    }

    async selectBackupFolder() {
        if (window.backupService) {
            const success = await window.backupService.selectFolder();
            if (success) {
                this.showNotification('Dossier sélectionné!', 'success');
                this.updateBackupUI();
            }
        }
    }

    async performManualBackup() {
        const btn = document.getElementById('manual-backup-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';

        if (window.backupService) {
            const success = await window.backupService.performBackup();
            if (success) {
                this.showNotification('Sauvegarde effectuée!', 'success');
            } else {
                this.showNotification('Erreur lors de la sauvegarde', 'error');
            }
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder maintenant';
        this.updateBackupUI();
    }

    async createTestFiles() {
        const btn = document.getElementById('create-test-files-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';

        try {
            // Créer des données de test variées
            await this.createTestData();
            
            // Faire plusieurs sauvegardes de test
            if (window.backupService && window.backupService.folderHandle) {
                for (let i = 0; i < 3; i++) {
                    await window.backupService.performBackup();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                this.showNotification('Fichiers de test créés!', 'success');
            } else {
                this.showNotification('Veuillez d\'abord configurer un dossier', 'warning');
            }
        } catch (error) {
            this.showNotification('Erreur: ' + error.message, 'error');
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-file"></i> Créer fichiers de test';
        this.updateBackupUI();
    }

    async createTestData() {
        // Créer des catégories de test si nécessaire
        if (Object.keys(this.categories).length === 0) {
            this.categories = this.getDefaultCategories();
        }

        // Ajouter quelques catégories supplémentaires
        this.categories['travel'] = {
            name: 'Voyage',
            color: '#8b5cf6',
            keywords: ['flight', 'hotel', 'travel', 'booking'],
            count: Math.floor(Math.random() * 10)
        };

        this.categories['social'] = {
            name: 'Réseaux Sociaux',
            color: '#ec4899',
            keywords: ['facebook', 'twitter', 'instagram', 'linkedin'],
            count: Math.floor(Math.random() * 15)
        };

        // Sauvegarder les catégories
        this.saveCategories();

        // Créer des paramètres de test
        const testSettings = {
            userName: 'Utilisateur Test',
            userEmail: 'test@emailsortpro.com',
            theme: 'light',
            autoSort: true,
            notifications: true,
            lastSaved: new Date().toISOString()
        };

        localStorage.setItem('emailsortpro_settings', JSON.stringify(testSettings));
        localStorage.setItem('emailsortpro_test_data', JSON.stringify({
            created: new Date().toISOString(),
            version: '4.0',
            testEmails: [
                { subject: 'Meeting tomorrow', category: 'work', date: new Date().toISOString() },
                { subject: 'Bank statement', category: 'finance', date: new Date().toISOString() },
                { subject: 'Order confirmation', category: 'shopping', date: new Date().toISOString() }
            ]
        }));

        console.log('[CategoryPage] Données de test créées');
    }

    updateBackupUI() {
        if (!window.backupService) return;

        const status = window.backupService.getStatus();

        // Mettre à jour l'indicateur de statut
        const statusIndicator = document.getElementById('backup-status-indicator');
        const statusText = document.getElementById('backup-status-text');
        const statusDetail = document.getElementById('backup-status-detail');

        if (statusIndicator && statusText && statusDetail) {
            if (status.folderConfigured && status.enabled) {
                statusIndicator.className = 'status-indicator active';
                statusText.textContent = 'Actif';
                statusDetail.textContent = 'Les sauvegardes automatiques sont activées';
            } else if (status.folderConfigured && !status.enabled) {
                statusIndicator.className = 'status-indicator warning';
                statusText.textContent = 'Configuré mais désactivé';
                statusDetail.textContent = 'Dossier configuré, activez les sauvegardes automatiques';
            } else {
                statusIndicator.className = 'status-indicator inactive';
                statusText.textContent = 'Non configuré';
                statusDetail.textContent = 'Sélectionnez un dossier de sauvegarde';
            }
        }

        // Mettre à jour les informations
        const elements = {
            'last-backup-time': status.lastBackup || 'Jamais',
            'backup-files-count': status.filesCount || 0,
            'backup-size': this.calculateEstimatedSize(),
            'backup-service-status': status.enabled ? 'Actif' : 'Inactif'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Mettre à jour les contrôles
        const backupEnabledCheckbox = document.getElementById('backup-enabled');
        if (backupEnabledCheckbox) {
            backupEnabledCheckbox.checked = status.enabled;
        }

        const manualBackupBtn = document.getElementById('manual-backup-btn');
        if (manualBackupBtn) {
            manualBackupBtn.disabled = !status.folderConfigured;
        }

        // Afficher le dossier s'il est configuré
        const folderDisplay = document.getElementById('backup-folder-display');
        const folderPath = document.getElementById('backup-folder-path');
        if (folderDisplay && folderPath) {
            if (status.folderConfigured) {
                folderDisplay.style.display = 'block';
                folderPath.textContent = 'Dossier configuré';
            } else {
                folderDisplay.style.display = 'none';
            }
        }
    }

    calculateEstimatedSize() {
        try {
            const data = {
                categories: this.categories,
                settings: this.getSettings(),
                localStorage: Object.keys(localStorage).length
            };
            const sizeBytes = JSON.stringify(data).length;
            
            if (sizeBytes < 1024) {
                return sizeBytes + ' B';
            } else if (sizeBytes < 1024 * 1024) {
                return Math.round(sizeBytes / 1024) + ' KB';
            } else {
                return Math.round(sizeBytes / (1024 * 1024)) + ' MB';
            }
        } catch {
            return 'N/A';
        }
    }

    exportAllData() {
        try {
            const data = {
                version: '4.0',
                timestamp: new Date().toISOString(),
                data: {
                    categories: this.categories,
                    settings: this.getSettings(),
                    localStorage: this.getLocalStorageData()
                }
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `EmailSortPro-Export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Données exportées!', 'success');
        } catch (error) {
            this.showNotification('Erreur export: ' + error.message, 'error');
        }
    }

    importData() {
        const fileInput = document.getElementById('import-backup-file');
        const file = fileInput?.files[0];
        
        if (!file) {
            this.showNotification('Sélectionnez un fichier', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.version || !data.data) {
                    throw new Error('Format invalide');
                }

                if (confirm('Importer ces données ? Cela remplacera vos données actuelles.')) {
                    // Importer les catégories
                    if (data.data.categories) {
                        this.categories = data.data.categories;
                        this.saveCategories();
                        this.renderCategories();
                    }

                    // Importer les paramètres
                    if (data.data.settings) {
                        localStorage.setItem('emailsortpro_settings', JSON.stringify(data.data.settings));
                    }

                    // Importer localStorage
                    if (data.data.localStorage) {
                        Object.entries(data.data.localStorage).forEach(([key, value]) => {
                            localStorage.setItem(key, value);
                        });
                    }

                    this.showNotification('Données importées!', 'success');
                    this.loadSettings();
                }
            } catch (error) {
                this.showNotification('Erreur import: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    // ================================================
    // PARAMÈTRES GÉNÉRAUX
    // ================================================

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
            
            this.setFieldValue('user-name', settings.userName || '');
            this.setFieldValue('user-email', settings.userEmail || '');
            this.setFieldValue('theme-select', settings.theme || 'light');
            this.setFieldValue('auto-sort', settings.autoSort !== false);
            this.setFieldValue('notifications-enabled', settings.notifications !== false);

            this.applyTheme(settings.theme || 'light');
            
        } catch (error) {
            console.error('[Settings] Erreur chargement:', error);
        }
    }

    saveAllSettings() {
        try {
            const settings = {
                userName: this.getFieldValue('user-name'),
                userEmail: this.getFieldValue('user-email'),
                theme: this.getFieldValue('theme-select'),
                autoSort: this.getFieldValue('auto-sort'),
                notifications: this.getFieldValue('notifications-enabled'),
                lastSaved: new Date().toISOString()
            };

            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            this.saveCategories();
            
            this.showNotification('Tous les paramètres sauvegardés!', 'success');
            
        } catch (error) {
            this.showNotification('Erreur sauvegarde: ' + error.message, 'error');
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }

    clearAllData() {
        const confirmation = prompt('Tapez "SUPPRIMER" pour confirmer la suppression de toutes les données:');
        
        if (confirmation === 'SUPPRIMER') {
            localStorage.clear();
            this.categories = this.getDefaultCategories();
            this.renderCategories();
            this.showNotification('Toutes les données supprimées', 'info');
            
            setTimeout(() => window.location.reload(), 2000);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================

    getFieldValue(id) {
        const field = document.getElementById(id);
        if (!field) return null;
        
        return field.type === 'checkbox' ? field.checked : field.value;
    }

    setFieldValue(id, value) {
        const field = document.getElementById(id);
        if (!field) return;
        
        if (field.type === 'checkbox') {
            field.checked = Boolean(value);
        } else {
            field.value = value;
        }
    }

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
        } catch {
            return {};
        }
    }

    getLocalStorageData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('emailsortpro_')) {
                data[key] = localStorage.getItem(key);
            }
        }
        return data;
    }

    showNotification(message, type = 'info') {
        console.log(`[CategoryPage] ${type.toUpperCase()}: ${message}`);
        
        // Créer une notification visuelle simple
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // ================================================
    // API PUBLIQUE
    // ================================================

    show() {
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            // Masquer les autres pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.style.display = 'none';
            });
            
            settingsPage.style.display = 'block';
            this.loadSettings();
            this.renderCategories();
            this.updateBackupUI();
            
            console.log('[CategoryPage] Page affichée');
        }
    }

    hide() {
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            settingsPage.style.display = 'none';
        }
    }

    getCategories() {
        return this.categories;
    }

    updateSetting(key, value) {
        try {
            const settings = this.getSettings();
            settings[key] = value;
            settings.lastModified = new Date().toISOString();
            
            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('[CategoryPage] Erreur mise à jour:', error);
            return false;
        }
    }
}

// ================================================
// INITIALISATION
// ================================================

// Créer l'instance globale
window.categoryPage = new CategoryPage();

// Fonctions globales
window.showSettings = () => window.categoryPage?.show();
window.hideSettings = () => window.categoryPage?.hide();
window.getAppSettings = () => window.categoryPage?.getSettings();
window.updateAppSetting = (key, value) => window.categoryPage?.updateSetting(key, value);
window.getCategories = () => window.categoryPage?.getCategories();

// Ajouter styles pour les animations
const animationStyles = `
    <style>
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .btn-sm {
            padding: 6px 12px;
            font-size: 12px;
        }
    </style>
`;
document.head.insertAdjacentHTML('beforeend', animationStyles);

// Écouter les événements
document.addEventListener('showPage', (e) => {
    if (e.detail === 'settings') {
        window.categoryPage?.show();
    }
});

console.log('✅ CategoryPage chargée - Catégories + Backup fonctionnel');
console.log('📂 Fonctions: showSettings(), getCategories(), window.backupService');
console.log('🎯 Auto-création de données de test + fichiers de backup');
