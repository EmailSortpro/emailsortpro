// categoryPage.js - Version SIMPLE et FONCTIONNELLE

class CategoryPage {
    constructor() {
        console.log('[CategoryPage] 🚀 Initialisation SIMPLE...');
        
        this.categories = {
            'work': { name: 'Travail', color: '#3b82f6', keywords: ['meeting', 'project', 'work'], count: 25 },
            'personal': { name: 'Personnel', color: '#10b981', keywords: ['family', 'friend', 'personal'], count: 18 },
            'finance': { name: 'Finance', color: '#f59e0b', keywords: ['bank', 'payment', 'invoice'], count: 12 },
            'shopping': { name: 'Shopping', color: '#ef4444', keywords: ['order', 'delivery', 'purchase'], count: 34 },
            'newsletter': { name: 'Newsletter', color: '#8b5cf6', keywords: ['newsletter', 'unsubscribe'], count: 67 },
            'social': { name: 'Réseaux Sociaux', color: '#ec4899', keywords: ['facebook', 'twitter', 'social'], count: 89 }
        };
        
        this.isVisible = false;
        
        // Initialisation immédiate
        this.init();
    }

    init() {
        // Créer la page immédiatement
        this.createPage();
        
        // Configurer les événements
        setTimeout(() => {
            this.setupEvents();
            this.renderCategories();
            this.initBackup();
        }, 100);
        
        console.log('[CategoryPage] ✅ Initialisé avec', Object.keys(this.categories).length, 'catégories');
    }

    createPage() {
        // Supprimer l'ancienne page
        const existing = document.getElementById('settings-page');
        if (existing) existing.remove();

        // Ajouter les styles
        this.addStyles();

        // Créer la page HTML
        const pageHTML = `
            <div id="settings-page" class="page-content" data-page="settings" style="display: none;">
                <div class="settings-wrapper">
                    <div class="settings-header">
                        <h1>⚙️ Paramètres EmailSortPro</h1>
                        <p>Gérez vos catégories et configurez vos sauvegardes</p>
                    </div>

                    <div class="tabs-container">
                        <div class="tabs">
                            <button class="tab active" data-tab="categories">
                                📂 Catégories (<span id="cat-count">0</span>)
                            </button>
                            <button class="tab" data-tab="backup">
                                💾 Sauvegarde
                            </button>
                        </div>

                        <!-- Onglet Catégories -->
                        <div id="categories-content" class="tab-content active">
                            <div class="section">
                                <h2>➕ Ajouter une catégorie</h2>
                                <div class="add-form">
                                    <input type="text" id="cat-name" placeholder="Nom de la catégorie">
                                    <input type="color" id="cat-color" value="#3b82f6">
                                    <input type="text" id="cat-keywords" placeholder="Mots-clés (séparés par virgules)">
                                    <button id="add-cat-btn">Ajouter</button>
                                </div>
                            </div>

                            <div class="section">
                                <h2>📋 Liste des catégories</h2>
                                <div id="categories-list"></div>
                            </div>

                            <div class="section">
                                <button id="save-cats" class="btn-success">💾 Sauvegarder</button>
                                <button id="reset-cats" class="btn-warning">🔄 Réinitialiser</button>
                                <button id="export-cats" class="btn-info">📤 Exporter</button>
                            </div>
                        </div>

                        <!-- Onglet Sauvegarde -->
                        <div id="backup-content" class="tab-content">
                            <div class="section">
                                <h2>📊 Statut</h2>
                                <div class="status-card">
                                    <div id="backup-status">🔴 Non configuré</div>
                                    <p id="backup-detail">Configurez un dossier de sauvegarde</p>
                                </div>
                            </div>

                            <div class="section">
                                <h2>⚙️ Configuration</h2>
                                <button id="setup-backup" class="btn-primary">🗂️ Choisir dossier</button>
                                <div id="folder-info" style="display:none;">
                                    <p>📁 Dossier configuré avec succès</p>
                                </div>
                            </div>

                            <div class="section">
                                <h2>🔧 Actions</h2>
                                <button id="manual-backup" class="btn-success" disabled>💾 Sauvegarder maintenant</button>
                                <button id="create-test" class="btn-info">📄 Créer fichiers test</button>
                                <button id="export-all" class="btn-primary">📤 Exporter tout</button>
                            </div>

                            <div class="section">
                                <h2>📥 Import</h2>
                                <input type="file" id="import-file" accept=".json">
                                <button id="import-btn" class="btn-warning" disabled>📥 Importer</button>
                            </div>

                            <div class="section">
                                <h2>📈 Informations</h2>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span>Statut:</span>
                                        <span id="service-status">En attente</span>
                                    </div>
                                    <div class="info-item">
                                        <span>Dernière sauvegarde:</span>
                                        <span id="last-backup">Jamais</span>
                                    </div>
                                    <div class="info-item">
                                        <span>Fichiers:</span>
                                        <span id="files-count">0</span>
                                    </div>
                                    <div class="info-item">
                                        <span>Taille:</span>
                                        <span id="data-size">0 KB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', pageHTML);
        console.log('[CategoryPage] 📄 Page créée');
    }

    addStyles() {
        if (document.getElementById('simple-settings-styles')) return;

        const styles = `
            <style id="simple-settings-styles">
                .settings-wrapper {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }

                .settings-header {
                    text-align: center;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                    margin-bottom: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }

                .settings-header h1 {
                    margin: 0 0 10px 0;
                    font-size: 2.2rem;
                }

                .settings-header p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 1.1rem;
                }

                .tabs-container {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    overflow: hidden;
                }

                .tabs {
                    display: flex;
                    background: #f8f9fa;
                    border-bottom: 1px solid #dee2e6;
                }

                .tab {
                    flex: 1;
                    padding: 15px 20px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    color: #6c757d;
                    transition: all 0.3s;
                }

                .tab:hover {
                    background: #e9ecef;
                    color: #495057;
                }

                .tab.active {
                    background: #007bff;
                    color: white;
                    box-shadow: 0 -3px 0 #0056b3 inset;
                }

                .tab-content {
                    display: none;
                    padding: 25px;
                }

                .tab-content.active {
                    display: block;
                }

                .section {
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border-left: 4px solid #007bff;
                }

                .section h2 {
                    margin: 0 0 15px 0;
                    color: #495057;
                    font-size: 1.3rem;
                }

                .add-form {
                    display: grid;
                    grid-template-columns: 2fr auto 2fr auto;
                    gap: 10px;
                    align-items: center;
                }

                .add-form input {
                    padding: 10px;
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .add-form input:focus {
                    outline: none;
                    border-color: #007bff;
                }

                .add-form input[type="color"] {
                    width: 50px;
                    height: 42px;
                    cursor: pointer;
                }

                .add-form button {
                    padding: 10px 20px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .add-form button:hover {
                    background: #218838;
                }

                .category-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }

                .category-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                }

                .category-color {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }

                .category-info {
                    flex: 1;
                }

                .category-name {
                    font-weight: 700;
                    color: #495057;
                    margin-bottom: 5px;
                }

                .category-keywords {
                    font-size: 12px;
                    color: #6c757d;
                    font-style: italic;
                }

                .category-count {
                    background: #007bff;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .category-actions {
                    display: flex;
                    gap: 5px;
                }

                .btn-sm {
                    padding: 5px 10px;
                    font-size: 12px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .btn-edit {
                    background: #ffc107;
                    color: #212529;
                }

                .btn-delete {
                    background: #dc3545;
                    color: white;
                }

                .btn-sm:hover {
                    opacity: 0.8;
                }

                .btn-success {
                    background: #28a745;
                    color: white;
                }

                .btn-warning {
                    background: #ffc107;
                    color: #212529;
                }

                .btn-info {
                    background: #17a2b8;
                    color: white;
                }

                .btn-primary {
                    background: #007bff;
                    color: white;
                }

                button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-right: 10px;
                    margin-bottom: 10px;
                    transition: all 0.3s;
                }

                button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }

                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .status-card {
                    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    border: 2px solid #2196f3;
                }

                #backup-status {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }

                .info-item {
                    background: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .info-item span:first-child {
                    font-weight: 600;
                    color: #6c757d;
                }

                .info-item span:last-child {
                    font-weight: 700;
                    color: #007bff;
                }

                input[type="file"] {
                    padding: 10px;
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    margin-right: 10px;
                    width: 300px;
                }

                @media (max-width: 768px) {
                    .settings-wrapper {
                        padding: 10px;
                    }
                    
                    .add-form {
                        grid-template-columns: 1fr;
                    }
                    
                    .tabs {
                        flex-direction: column;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .notification.success { background: #28a745; }
                .notification.error { background: #dc3545; }
                .notification.warning { background: #ffc107; color: #212529; }
                .notification.info { background: #17a2b8; }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        console.log('[CategoryPage] 🎨 Styles ajoutés');
    }

    setupEvents() {
        // Navigation onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                // Désactiver tous les onglets
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                
                // Activer l'onglet sélectionné
                e.target.classList.add('active');
                document.getElementById(targetTab + '-content').classList.add('active');
                
                if (targetTab === 'categories') {
                    this.renderCategories();
                } else if (targetTab === 'backup') {
                    this.updateBackupUI();
                }
            });
        });

        // Ajouter catégorie
        const addBtn = document.getElementById('add-cat-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCategory());
        }

        // Boutons catégories
        const saveCatsBtn = document.getElementById('save-cats');
        if (saveCatsBtn) {
            saveCatsBtn.addEventListener('click', () => this.saveCategories());
        }

        const resetCatsBtn = document.getElementById('reset-cats');
        if (resetCatsBtn) {
            resetCatsBtn.addEventListener('click', () => this.resetCategories());
        }

        const exportCatsBtn = document.getElementById('export-cats');
        if (exportCatsBtn) {
            exportCatsBtn.addEventListener('click', () => this.exportCategories());
        }

        // Backup
        const setupBackupBtn = document.getElementById('setup-backup');
        if (setupBackupBtn) {
            setupBackupBtn.addEventListener('click', () => this.setupBackup());
        }

        const manualBackupBtn = document.getElementById('manual-backup');
        if (manualBackupBtn) {
            manualBackupBtn.addEventListener('click', () => this.performBackup());
        }

        const createTestBtn = document.getElementById('create-test');
        if (createTestBtn) {
            createTestBtn.addEventListener('click', () => this.createTestFiles());
        }

        const exportAllBtn = document.getElementById('export-all');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAll());
        }

        // Import
        const importFile = document.getElementById('import-file');
        const importBtn = document.getElementById('import-btn');
        
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

        console.log('[CategoryPage] ⚡ Événements configurés');
    }

    renderCategories() {
        const list = document.getElementById('categories-list');
        const counter = document.getElementById('cat-count');
        
        if (!list) return;

        // Mettre à jour le compteur
        if (counter) {
            counter.textContent = Object.keys(this.categories).length;
        }

        // Vider et remplir
        list.innerHTML = '';

        Object.entries(this.categories).forEach(([id, cat]) => {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.innerHTML = `
                <div class="category-color" style="background-color: ${cat.color}"></div>
                <div class="category-info">
                    <div class="category-name">${cat.name}</div>
                    <div class="category-keywords">Mots-clés: ${cat.keywords.join(', ')}</div>
                </div>
                <div class="category-count">${cat.count} emails</div>
                <div class="category-actions">
                    <button class="btn-sm btn-edit" onclick="window.categoryPage.editCategory('${id}')">✏️</button>
                    <button class="btn-sm btn-delete" onclick="window.categoryPage.deleteCategory('${id}')">🗑️</button>
                </div>
            `;
            list.appendChild(div);
        });

        console.log('[CategoryPage] 🎨 Catégories rendues:', Object.keys(this.categories).length);
    }

    addCategory() {
        const nameInput = document.getElementById('cat-name');
        const colorInput = document.getElementById('cat-color');
        const keywordsInput = document.getElementById('cat-keywords');

        if (!nameInput || !nameInput.value.trim()) {
            this.showNotification('Veuillez entrer un nom', 'warning');
            return;
        }

        const name = nameInput.value.trim();
        const color = colorInput ? colorInput.value : '#3b82f6';
        const keywords = keywordsInput ? keywordsInput.value.split(',').map(k => k.trim()).filter(k => k) : [];

        const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        
        if (this.categories[id]) {
            this.showNotification('Cette catégorie existe déjà', 'warning');
            return;
        }

        this.categories[id] = {
            name: name,
            color: color,
            keywords: keywords,
            count: Math.floor(Math.random() * 30) + 1
        };

        // Vider les champs
        nameInput.value = '';
        if (colorInput) colorInput.value = '#3b82f6';
        if (keywordsInput) keywordsInput.value = '';

        this.renderCategories();
        this.saveCategories();
        this.showNotification('Catégorie ajoutée!', 'success');
    }

    editCategory(id) {
        const cat = this.categories[id];
        if (!cat) return;

        const newName = prompt('Nouveau nom:', cat.name);
        if (newName && newName.trim()) {
            cat.name = newName.trim();
            this.renderCategories();
            this.saveCategories();
            this.showNotification('Catégorie modifiée!', 'success');
        }
    }

    deleteCategory(id) {
        const cat = this.categories[id];
        if (!cat) return;

        if (confirm(`Supprimer "${cat.name}" ?`)) {
            delete this.categories[id];
            this.renderCategories();
            this.saveCategories();
            this.showNotification('Catégorie supprimée!', 'info');
        }
    }

    saveCategories() {
        try {
            localStorage.setItem('emailsortpro_categories', JSON.stringify(this.categories));
            this.showNotification('Catégories sauvegardées!', 'success');
            console.log('[CategoryPage] 💾 Sauvegardé');
        } catch (error) {
            this.showNotification('Erreur sauvegarde', 'error');
        }
    }

    resetCategories() {
        if (confirm('Réinitialiser toutes les catégories ?')) {
            this.categories = {
                'work': { name: 'Travail', color: '#3b82f6', keywords: ['meeting', 'project'], count: 25 },
                'personal': { name: 'Personnel', color: '#10b981', keywords: ['family', 'friend'], count: 18 }
            };
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

        this.downloadJSON(data, `Categories-${new Date().toISOString().split('T')[0]}.json`);
        this.showNotification('Catégories exportées!', 'success');
    }

    initBackup() {
        window.backupService = {
            folderHandle: null,
            enabled: false,
            lastBackup: null,
            filesCount: 0,

            async selectFolder() {
                try {
                    if (!window.showDirectoryPicker) {
                        throw new Error('API non supportée');
                    }
                    this.folderHandle = await window.showDirectoryPicker({
                        mode: 'readwrite',
                        startIn: 'documents'
                    });
                    return true;
                } catch (error) {
                    console.error('Erreur:', error);
                    return false;
                }
            },

            async createBackup() {
                if (!this.folderHandle) return false;
                try {
                    const data = {
                        version: '4.0',
                        timestamp: new Date().toISOString(),
                        categories: window.categoryPage?.categories || {},
                        localStorage: this.getLocalStorageData()
                    };

                    const fileName = `EmailSortPro-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
                    const fileHandle = await this.folderHandle.getFileHandle(fileName, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(JSON.stringify(data, null, 2));
                    await writable.close();

                    this.lastBackup = new Date();
                    this.filesCount++;
                    return true;
                } catch (error) {
                    console.error('Erreur backup:', error);
                    return false;
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

            getStatus() {
                return {
                    folderConfigured: !!this.folderHandle,
                    lastBackup: this.lastBackup ? this.lastBackup.toLocaleString() : null,
                    filesCount: this.filesCount
                };
            }
        };

        console.log('[CategoryPage] 💾 Backup initialisé');
    }

    async setupBackup() {
        const btn = document.getElementById('setup-backup');
        btn.disabled = true;
        btn.textContent = '⏳ Configuration...';

        const success = await window.backupService.selectFolder();
        
        btn.disabled = false;
        btn.textContent = '🗂️ Choisir dossier';

        if (success) {
            this.showNotification('Dossier configuré!', 'success');
            this.updateBackupUI();
        } else {
            this.showNotification('Configuration annulée', 'info');
        }
    }

    async performBackup() {
        const btn = document.getElementById('manual-backup');
        btn.disabled = true;
        btn.textContent = '⏳ Sauvegarde...';

        const success = await window.backupService.createBackup();
        
        btn.disabled = false;
        btn.textContent = '💾 Sauvegarder maintenant';

        if (success) {
            this.showNotification('Sauvegarde créée!', 'success');
            this.updateBackupUI();
        } else {
            this.showNotification('Erreur sauvegarde', 'error');
        }
    }

    async createTestFiles() {
        const btn = document.getElementById('create-test');
        btn.disabled = true;
        btn.textContent = '⏳ Création...';

        try {
            if (!window.backupService.folderHandle) {
                this.showNotification('Configurez d\'abord un dossier', 'warning');
                return;
            }

            for (let i = 0; i < 3; i++) {
                await window.backupService.createBackup();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.showNotification('Fichiers test créés!', 'success');
            this.updateBackupUI();
        } catch (error) {
            this.showNotification('Erreur: ' + error.message, 'error');
        }

        btn.disabled = false;
        btn.textContent = '📄 Créer fichiers test';
    }

    exportAll() {
        const data = {
            version: '4.0',
            timestamp: new Date().toISOString(),
            categories: this.categories,
            localStorage: window.backupService?.getLocalStorageData() || {}
        };

        this.downloadJSON(data, `EmailSortPro-Export-${new Date().toISOString().split('T')[0]}.json`);
        this.showNotification('Export complet!', 'success');
    }

    importData() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput?.files[0];
        
        if (!file) {
            this.showNotification('Sélectionnez un fichier', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.version) {
                    throw new Error('Format invalide');
                }

                if (confirm('Importer ces données ?')) {
                    if (data.categories) {
                        this.categories = data.categories;
                        this.renderCategories();
                        this.saveCategories();
                    }

                    if (data.localStorage) {
                        Object.entries(data.localStorage).forEach(([key, value]) => {
                            localStorage.setItem(key, value);
                        });
                    }

                    this.showNotification('Import réussi!', 'success');
                }
            } catch (error) {
                this.showNotification('Erreur import: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    updateBackupUI() {
        if (!window.backupService) return;

        const status = window.backupService.getStatus();
        
        const statusEl = document.getElementById('backup-status');
        const detailEl = document.getElementById('backup-detail');
        const folderInfo = document.getElementById('folder-info');
        const manualBtn = document.getElementById('manual-backup');

        if (statusEl && detailEl) {
            if (status.folderConfigured) {
                statusEl.textContent = '🟢 Configuré';
                detailEl.textContent = 'Dossier de sauvegarde prêt';
                if (folderInfo) folderInfo.style.display = 'block';
                if (manualBtn) manualBtn.disabled = false;
            } else {
                statusEl.textContent = '🔴 Non configuré';
                detailEl.textContent = 'Configurez un dossier de sauvegarde';
                if (folderInfo) folderInfo.style.display = 'none';
                if (manualBtn) manualBtn.disabled = true;
            }
        }

        // Mettre à jour les infos
        const serviceStatus = document.getElementById('service-status');
        const lastBackup = document.getElementById('last-backup');
        const filesCount = document.getElementById('files-count');
        const dataSize = document.getElementById('data-size');

        if (serviceStatus) serviceStatus.textContent = status.folderConfigured ? 'Configuré' : 'En attente';
        if (lastBackup) lastBackup.textContent = status.lastBackup || 'Jamais';
        if (filesCount) filesCount.textContent = status.filesCount || 0;
        if (dataSize) dataSize.textContent = this.calculateSize();
    }

    calculateSize() {
        try {
            const data = JSON.stringify(this.categories);
            const bytes = data.length;
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
            return Math.round(bytes / (1024 * 1024)) + ' MB';
        } catch {
            return '0 KB';
        }
    }

    downloadJSON(data, filename) {
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

    showNotification(message, type = 'info') {
        console.log(`[CategoryPage] ${type}: ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    show() {
        const page = document.getElementById('settings-page');
        if (page) {
            // Masquer les autres pages
            document.querySelectorAll('.page-content:not(#settings-page)').forEach(p => {
                p.style.display = 'none';
            });
            
            page.style.display = 'block';
            this.isVisible = true;
            this.renderCategories();
            this.updateBackupUI();
            
            console.log('[CategoryPage] 👁️ Affiché');
        } else {
            console.warn('[CategoryPage] Page non trouvée, recréation...');
            this.createPage();
            setTimeout(() => this.show(), 100);
        }
    }

    hide() {
        const page = document.getElementById('settings-page');
        if (page) {
            page.style.display = 'none';
            this.isVisible = false;
        }
    }

    getCategories() {
        return this.categories;
    }
}

// Initialisation SIMPLE et GARANTIE
function initSimpleCategoryPage() {
    console.log('[CategoryPage] 🚀 INITIALISATION SIMPLE...');
    
    window.categoryPage = new CategoryPage();
    
    // Fonctions globales
    window.showSettings = () => {
        console.log('[Global] 📋 Affichage paramètres');
        window.categoryPage?.show();
    };
    
    window.getCategories = () => window.categoryPage?.getCategories() || {};
    
    // Écouter les clics sur paramètres
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page="settings"], .settings-btn, [href="#settings"]');
        if (target) {
            e.preventDefault();
            console.log('[Navigation] 🎯 Clic paramètres détecté');
            window.categoryPage?.show();
        }
    });

    // Écouter les événements
    document.addEventListener('showPage', (e) => {
        if (e.detail === 'settings') {
            console.log('[Navigation] 📄 showPage settings');
            window.categoryPage?.show();
        }
    });

    // Auto-affichage si hash
    if (window.location.hash === '#settings') {
        setTimeout(() => window.categoryPage?.show(), 500);
    }

    console.log('✅ CategoryPage SIMPLE prêt');
    console.log('📂 Fonctions: showSettings(), getCategories()');
    console.log('🎯 Catégories:', Object.keys(window.categoryPage?.categories || {}).length);
}

// Initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimpleCategoryPage);
} else {
    initSimpleCategoryPage();
}

// Sécurité
setTimeout(initSimpleCategoryPage, 1000);
