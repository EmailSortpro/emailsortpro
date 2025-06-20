// categoryPage.js - Page paramètres avec affichage immédiat et catégories dynamiques

class CategoryPage {
    constructor() {
        console.log('[CategoryPage] 🚀 Initialisation immédiate...');
        
        this.categories = {};
        this.isVisible = false;
        
        // Initialisation immédiate
        this.loadCategories();
        this.createPageImmediate();
        this.setupEventListeners();
        this.initBackupService();
        
        console.log('[CategoryPage] ✅ Prêt avec', Object.keys(this.categories).length, 'catégories');
    }

    loadCategories() {
        // Catégories par défaut
        this.categories = {
            'work': { 
                name: 'Travail', 
                color: '#3b82f6', 
                keywords: ['meeting', 'project', 'deadline', 'work', 'office'], 
                count: Math.floor(Math.random() * 15) + 1 
            },
            'personal': { 
                name: 'Personnel', 
                color: '#10b981', 
                keywords: ['family', 'friend', 'personal', 'private'], 
                count: Math.floor(Math.random() * 8) + 1 
            },
            'finance': { 
                name: 'Finance', 
                color: '#f59e0b', 
                keywords: ['bank', 'payment', 'invoice', 'money', 'finance'], 
                count: Math.floor(Math.random() * 12) + 1 
            },
            'shopping': { 
                name: 'Shopping', 
                color: '#ef4444', 
                keywords: ['order', 'delivery', 'purchase', 'buy', 'shop'], 
                count: Math.floor(Math.random() * 20) + 1 
            },
            'newsletter': { 
                name: 'Newsletter', 
                color: '#8b5cf6', 
                keywords: ['newsletter', 'unsubscribe', 'update', 'news'], 
                count: Math.floor(Math.random() * 25) + 1 
            },
            'social': { 
                name: 'Réseaux Sociaux', 
                color: '#ec4899', 
                keywords: ['facebook', 'twitter', 'instagram', 'linkedin', 'social'], 
                count: Math.floor(Math.random() * 30) + 1 
            }
        };

        // Charger depuis localStorage si disponible
        try {
            const saved = localStorage.getItem('emailsortpro_categories');
            if (saved) {
                const savedCategories = JSON.parse(saved);
                this.categories = { ...this.categories, ...savedCategories };
                console.log('[CategoryPage] 📂 Catégories chargées depuis localStorage:', Object.keys(this.categories).length);
            }
        } catch (error) {
            console.warn('[CategoryPage] ⚠️ Erreur chargement localStorage, utilisation des défauts');
        }

        // Intégration avec CategoryManager existant
        this.syncWithCategoryManager();
    }

    syncWithCategoryManager() {
        try {
            if (window.categoryManager && window.categoryManager.getCategories) {
                const managerCategories = window.categoryManager.getCategories();
                if (managerCategories && Object.keys(managerCategories).length > 0) {
                    // Fusionner avec les catégories du manager
                    Object.entries(managerCategories).forEach(([id, cat]) => {
                        if (cat && cat.name) {
                            this.categories[id] = {
                                name: cat.name,
                                color: cat.color || '#3b82f6',
                                keywords: cat.keywords || [],
                                count: cat.count || 0
                            };
                        }
                    });
                    console.log('[CategoryPage] 🔄 Synchronisé avec CategoryManager:', Object.keys(this.categories).length);
                }
            }
        } catch (error) {
            console.warn('[CategoryPage] ⚠️ Erreur sync CategoryManager:', error);
        }
    }

    createPageImmediate() {
        // Supprimer l'ancienne page si elle existe
        const existingPage = document.getElementById('settings-page');
        if (existingPage) {
            existingPage.remove();
        }

        // Créer la page immédiatement
        const pageHTML = this.generatePageHTML();
        document.body.insertAdjacentHTML('beforeend', pageHTML);
        
        // Ajouter les styles
        this.injectStyles();
        
        // Rendre les catégories immédiatement
        setTimeout(() => {
            this.renderCategories();
            this.updateBackupUI();
        }, 100);
        
        console.log('[CategoryPage] 🎨 Page créée et injectée dans le DOM');
    }

    generatePageHTML() {
        return `
            <div id="settings-page" class="page-content" data-page="settings" style="display: none;">
                <div class="category-page-container">
                    <div class="category-page-header">
                        <h1><i class="fas fa-cog"></i> Paramètres EmailSortPro</h1>
                        <p>Gérez vos catégories et configurez vos sauvegardes</p>
                    </div>

                    <!-- Navigation par onglets -->
                    <div class="category-tabs">
                        <button class="tab-button active" data-tab="categories">
                            <i class="fas fa-tags"></i> Catégories
                        </button>
                        <button class="tab-button" data-tab="backup">
                            <i class="fas fa-save"></i> Sauvegarde
                        </button>
                        <button class="tab-button" data-tab="general">
                            <i class="fas fa-cog"></i> Général
                        </button>
                    </div>

                    <!-- Contenu des onglets -->
                    <div class="tab-panels">
                        <!-- Onglet Catégories -->
                        <div id="categories-panel" class="tab-panel active">
                            <div class="panel-section">
                                <h2><i class="fas fa-plus-circle"></i> Ajouter une catégorie</h2>
                                <div class="add-category-form">
                                    <input type="text" id="new-category-name" placeholder="Nom de la catégorie" class="form-input">
                                    <input type="color" id="new-category-color" value="#3b82f6" class="color-picker">
                                    <input type="text" id="new-category-keywords" placeholder="Mots-clés (séparés par virgules)" class="form-input">
                                    <button id="add-category-btn" class="btn btn-primary">
                                        <i class="fas fa-plus"></i> Ajouter
                                    </button>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-list"></i> Catégories existantes (<span id="categories-count">0</span>)</h2>
                                <div id="categories-list" class="categories-grid">
                                    <!-- Les catégories seront affichées ici dynamiquement -->
                                </div>
                            </div>

                            <div class="panel-section">
                                <div class="action-buttons">
                                    <button id="save-categories-btn" class="btn btn-success">
                                        <i class="fas fa-save"></i> Sauvegarder
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

                        <!-- Onglet Sauvegarde -->
                        <div id="backup-panel" class="tab-panel">
                            <div class="panel-section">
                                <h2><i class="fas fa-info-circle"></i> Statut de la sauvegarde</h2>
                                <div class="backup-status-card">
                                    <div class="status-indicator" id="backup-status">
                                        <i class="fas fa-circle"></i>
                                        <span>Initialisation...</span>
                                    </div>
                                    <p id="backup-detail">Configuration en cours...</p>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-folder"></i> Configuration du dossier</h2>
                                <div class="backup-config">
                                    <button id="auto-setup-backup" class="btn btn-primary">
                                        <i class="fas fa-magic"></i> Configuration automatique
                                    </button>
                                    <button id="manual-setup-backup" class="btn btn-secondary">
                                        <i class="fas fa-folder-open"></i> Choisir un dossier
                                    </button>
                                    <div id="folder-display" class="folder-info" style="display: none;">
                                        <p><strong>Dossier :</strong> <span id="folder-path">Non configuré</span></p>
                                    </div>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-clock"></i> Paramètres de sauvegarde</h2>
                                <div class="backup-settings">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="backup-enabled">
                                        <span>Activer les sauvegardes automatiques</span>
                                    </label>
                                    
                                    <div class="form-group">
                                        <label>Fréquence de sauvegarde :</label>
                                        <select id="backup-frequency" class="form-select">
                                            <option value="15">Toutes les 15 minutes</option>
                                            <option value="30">Toutes les 30 minutes</option>
                                            <option value="60" selected>Toutes les heures</option>
                                            <option value="360">Toutes les 6 heures</option>
                                            <option value="1440">Quotidienne</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-tools"></i> Actions</h2>
                                <div class="action-buttons">
                                    <button id="manual-backup" class="btn btn-success">
                                        <i class="fas fa-save"></i> Sauvegarder maintenant
                                    </button>
                                    <button id="create-test-files" class="btn btn-info">
                                        <i class="fas fa-file-alt"></i> Créer fichiers de test
                                    </button>
                                    <button id="export-all-data" class="btn btn-primary">
                                        <i class="fas fa-download"></i> Exporter toutes les données
                                    </button>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-upload"></i> Import de données</h2>
                                <div class="import-section">
                                    <input type="file" id="import-file" accept=".json" class="form-input">
                                    <button id="import-data" class="btn btn-warning" disabled>
                                        <i class="fas fa-upload"></i> Importer
                                    </button>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-chart-bar"></i> Informations</h2>
                                <div class="backup-info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Dernière sauvegarde :</span>
                                        <span class="info-value" id="last-backup">Jamais</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Fichiers créés :</span>
                                        <span class="info-value" id="files-count">0</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Taille estimée :</span>
                                        <span class="info-value" id="data-size">0 KB</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Statut service :</span>
                                        <span class="info-value" id="service-status">Inactif</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Onglet Général -->
                        <div id="general-panel" class="tab-panel">
                            <div class="panel-section">
                                <h2><i class="fas fa-user"></i> Informations utilisateur</h2>
                                <div class="form-group">
                                    <label>Nom d'utilisateur :</label>
                                    <input type="text" id="user-name" class="form-input" placeholder="Votre nom">
                                </div>
                                <div class="form-group">
                                    <label>Email :</label>
                                    <input type="email" id="user-email" class="form-input" placeholder="votre.email@exemple.com">
                                </div>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-palette"></i> Apparence</h2>
                                <div class="form-group">
                                    <label>Thème :</label>
                                    <select id="theme-select" class="form-select">
                                        <option value="light">Clair</option>
                                        <option value="dark">Sombre</option>
                                        <option value="auto">Automatique</option>
                                    </select>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-cog"></i> Préférences</h2>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="auto-sort" checked>
                                    <span>Tri automatique des emails</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="notifications" checked>
                                    <span>Activer les notifications</span>
                                </label>
                            </div>

                            <div class="panel-section">
                                <h2><i class="fas fa-trash"></i> Zone dangereuse</h2>
                                <button id="clear-all-data" class="btn btn-danger">
                                    <i class="fas fa-exclamation-triangle"></i> Effacer toutes les données
                                </button>
                                <p class="warning-text">⚠️ Cette action est irréversible</p>
                            </div>
                        </div>
                    </div>

                    <!-- Footer avec boutons globaux -->
                    <div class="page-footer">
                        <button id="save-all-settings" class="btn btn-success">
                            <i class="fas fa-save"></i> Sauvegarder tout
                        </button>
                        <button id="close-settings" class="btn btn-outline">
                            <i class="fas fa-times"></i> Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    injectStyles() {
        if (document.getElementById('category-page-styles')) return;

        const styles = `
            <style id="category-page-styles">
                .category-page-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .category-page-header {
                    text-align: center;
                    margin-bottom: 30px;
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .category-page-header h1 {
                    color: #1e293b;
                    margin: 0 0 10px 0;
                    font-size: 2.5rem;
                    font-weight: 700;
                }

                .category-page-header p {
                    color: #64748b;
                    font-size: 1.1rem;
                    margin: 0;
                }

                /* Onglets */
                .category-tabs {
                    display: flex;
                    background: white;
                    border-radius: 16px;
                    padding: 8px;
                    margin-bottom: 25px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    gap: 6px;
                }

                .tab-button {
                    flex: 1;
                    padding: 16px 24px;
                    border: none;
                    background: transparent;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                    font-size: 14px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .tab-button:hover {
                    background: #f1f5f9;
                    color: #475569;
                    transform: translateY(-1px);
                }

                .tab-button.active {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
                    transform: translateY(-2px);
                }

                /* Panneaux */
                .tab-panels {
                    position: relative;
                }

                .tab-panel {
                    display: none;
                }

                .tab-panel.active {
                    display: block;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .panel-section {
                    background: white;
                    border-radius: 16px;
                    padding: 30px;
                    margin-bottom: 25px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    border: 1px solid #e2e8f0;
                }

                .panel-section h2 {
                    color: #1e293b;
                    font-size: 1.4rem;
                    font-weight: 600;
                    margin: 0 0 20px 0;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .panel-section h2 i {
                    color: #3b82f6;
                    font-size: 1.2rem;
                }

                /* Formulaires */
                .add-category-form {
                    display: grid;
                    grid-template-columns: 2fr auto 2fr auto;
                    gap: 15px;
                    align-items: end;
                }

                .form-input, .form-select {
                    padding: 14px 18px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    background: white;
                    width: 100%;
                }

                .form-input:focus, .form-select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    transform: translateY(-1px);
                }

                .color-picker {
                    width: 60px;
                    height: 50px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .color-picker:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                /* Boutons */
                .btn {
                    padding: 14px 24px;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                }

                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }

                .btn:active {
                    transform: translateY(0);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                }

                .btn-success {
                    background: linear-gradient(135deg, #10b981, #047857);
                    color: white;
                }

                .btn-warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                }

                .btn-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                }

                .btn-secondary {
                    background: linear-gradient(135deg, #6b7280, #4b5563);
                    color: white;
                }

                .btn-info {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                    color: white;
                }

                .btn-outline {
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

                .action-buttons {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                /* Grille des catégories */
                .categories-grid {
                    display: grid;
                    gap: 20px;
                    margin-top: 20px;
                }

                .category-card {
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 20px;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .category-card:hover {
                    border-color: #3b82f6;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }

                .category-card-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .category-color-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    flex-shrink: 0;
                }

                .category-info {
                    flex: 1;
                }

                .category-name {
                    font-weight: 700;
                    font-size: 18px;
                    color: #1e293b;
                    margin: 0 0 5px 0;
                }

                .category-count-badge {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    min-width: 30px;
                    text-align: center;
                    display: inline-block;
                }

                .category-keywords {
                    color: #64748b;
                    font-size: 13px;
                    margin-bottom: 15px;
                    font-style: italic;
                }

                .category-actions {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }

                .btn-sm {
                    padding: 8px 12px;
                    font-size: 12px;
                    min-width: auto;
                }

                /* Checkbox personnalisé */
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    margin-bottom: 15px;
                    padding: 12px 0;
                    font-weight: 500;
                    color: #374151;
                }

                .checkbox-label input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                    accent-color: #3b82f6;
                    cursor: pointer;
                }

                /* Sauvegarde */
                .backup-status-card {
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                    border: 2px solid #bae6fd;
                    border-radius: 16px;
                    padding: 25px;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 700;
                    font-size: 16px;
                    margin-bottom: 10px;
                }

                .status-indicator.active { color: #059669; }
                .status-indicator.inactive { color: #dc2626; }
                .status-indicator.warning { color: #d97706; }

                .backup-config {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                    margin-bottom: 20px;
                }

                .folder-info {
                    background: #e0f2fe;
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #0891b2;
                    margin-top: 15px;
                }

                .backup-settings {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .import-section {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 15px;
                    align-items: end;
                }

                .backup-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }

                .info-item {
                    background: white;
                    padding: 15px;
                    border-radius: 12px;
                    border: 2px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .info-label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 14px;
                }

                .info-value {
                    font-weight: 700;
                    color: #3b82f6;
                    font-size: 14px;
                }

                .warning-text {
                    color: #dc2626;
                    font-size: 13px;
                    margin-top: 10px;
                    font-weight: 500;
                }

                /* Footer */
                .page-footer {
                    background: white;
                    padding: 25px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 30px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .category-page-container { padding: 15px; }
                    .panel-section { padding: 20px; }
                    .add-category-form { grid-template-columns: 1fr; }
                    .category-tabs { flex-direction: column; }
                    .backup-config { flex-direction: column; }
                    .import-section { grid-template-columns: 1fr; }
                    .action-buttons { flex-direction: column; }
                }

                /* Notifications */
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    z-index: 10000;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                    animation: slideInNotif 0.3s ease-out;
                    max-width: 350px;
                }

                @keyframes slideInNotif {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                .notification.success { background: linear-gradient(135deg, #10b981, #047857); }
                .notification.error { background: linear-gradient(135deg, #ef4444, #dc2626); }
                .notification.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
                .notification.info { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        console.log('[CategoryPage] 🎨 Styles injectés');
    }

    setupEventListeners() {
        console.log('[CategoryPage] 🔧 Configuration des événements...');
        
        // Attendre que le DOM soit prêt
        setTimeout(() => {
            this.setupTabNavigation();
            this.setupCategoryEvents();
            this.setupBackupEvents();
            this.setupGeneralEvents();
            this.loadGeneralSettings();
        }, 200);
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Désactiver tous les onglets
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Activer l'onglet sélectionné
                button.classList.add('active');
                document.getElementById(`${targetTab}-panel`).classList.add('active');
                
                // Actions spécifiques par onglet
                if (targetTab === 'categories') {
                    this.renderCategories();
                } else if (targetTab === 'backup') {
                    this.updateBackupUI();
                }
                
                console.log('[CategoryPage] 📂 Onglet activé:', targetTab);
            });
        });
    }

    setupCategoryEvents() {
        // Ajouter catégorie
        const addBtn = document.getElementById('add-category-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCategory());
        }

        // Sauvegarder catégories
        const saveBtn = document.getElementById('save-categories-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCategories());
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

        console.log('[CategoryPage] ✅ Événements catégories configurés');
    }

    setupBackupEvents() {
        // Configuration automatique
        const autoSetupBtn = document.getElementById('auto-setup-backup');
        if (autoSetupBtn) {
            autoSetupBtn.addEventListener('click', () => this.autoSetupBackup());
        }

        // Configuration manuelle
        const manualSetupBtn = document.getElementById('manual-setup-backup');
        if (manualSetupBtn) {
            manualSetupBtn.addEventListener('click', () => this.manualSetupBackup());
        }

        // Activer/désactiver backup
        const backupEnabledCheckbox = document.getElementById('backup-enabled');
        if (backupEnabledCheckbox) {
            backupEnabledCheckbox.addEventListener('change', (e) => {
                this.toggleBackup(e.target.checked);
            });
        }

        // Fréquence backup
        const frequencySelect = document.getElementById('backup-frequency');
        if (frequencySelect) {
            frequencySelect.addEventListener('change', (e) => {
                this.setBackupFrequency(parseInt(e.target.value));
            });
        }

        // Actions manuelles
        const manualBackupBtn = document.getElementById('manual-backup');
        if (manualBackupBtn) {
            manualBackupBtn.addEventListener('click', () => this.performManualBackup());
        }

        const createTestBtn = document.getElementById('create-test-files');
        if (createTestBtn) {
            createTestBtn.addEventListener('click', () => this.createTestFiles());
        }

        const exportAllBtn = document.getElementById('export-all-data');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllData());
        }

        // Import
        const importFile = document.getElementById('import-file');
        const importBtn = document.getElementById('import-data');
        
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

        console.log('[CategoryPage] ✅ Événements backup configurés');
    }

    setupGeneralEvents() {
        // Sauvegarder tout
        const saveAllBtn = document.getElementById('save-all-settings');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => this.saveAllSettings());
        }

        // Fermer
        const closeBtn = document.getElementById('close-settings');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Effacer toutes les données
        const clearAllBtn = document.getElementById('clear-all-data');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllData());
        }

        // Changement de thème
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }

        console.log('[CategoryPage] ✅ Événements généraux configurés');
    }

    renderCategories() {
        const categoriesList = document.getElementById('categories-list');
        const categoriesCount = document.getElementById('categories-count');
        
        if (!categoriesList) {
            console.warn('[CategoryPage] ⚠️ Element categories-list non trouvé');
            return;
        }

        // Mettre à jour le compteur
        if (categoriesCount) {
            categoriesCount.textContent = Object.keys(this.categories).length;
        }

        // Vider la liste
        categoriesList.innerHTML = '';

        // Ajouter chaque catégorie
        Object.entries(this.categories).forEach(([id, category], index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <div class="category-card-header">
                    <div class="category-color-circle" style="background-color: ${category.color}"></div>
                    <div class="category-info">
                        <h3 class="category-name">${category.name}</h3>
                        <span class="category-count-badge">${category.count} emails</span>
                    </div>
                </div>
                <div class="category-keywords">
                    Mots-clés: ${category.keywords.join(', ')}
                </div>
                <div class="category-actions">
                    <button class="btn btn-primary btn-sm" onclick="window.categoryPage.editCategory('${id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.categoryPage.deleteCategory('${id}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            `;
            
            // Ajouter une animation décalée
            categoryCard.style.animationDelay = `${index * 0.1}s`;
            categoriesList.appendChild(categoryCard);
        });

        console.log('[CategoryPage] 🎨 Catégories rendues:', Object.keys(this.categories).length);
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================

    addCategory() {
        const nameInput = document.getElementById('new-category-name');
        const colorInput = document.getElementById('new-category-color');
        const keywordsInput = document.getElementById('new-category-keywords');

        if (!nameInput || !nameInput.value.trim()) {
            this.showNotification('Veuillez entrer un nom de catégorie', 'warning');
            return;
        }

        const name = nameInput.value.trim();
        const color = colorInput ? colorInput.value : '#3b82f6';
        const keywords = keywordsInput ? keywordsInput.value.split(',').map(k => k.trim()).filter(k => k) : [];

        // Créer un ID unique
        const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        
        if (this.categories[id]) {
            this.showNotification('Cette catégorie existe déjà', 'warning');
            return;
        }

        // Ajouter la catégorie
        this.categories[id] = {
            name: name,
            color: color,
            keywords: keywords,
            count: 0
        };

        // Vider les champs
        nameInput.value = '';
        if (colorInput) colorInput.value = '#3b82f6';
        if (keywordsInput) keywordsInput.value = '';

        // Re-rendre les catégories
        this.renderCategories();
        this.saveCategories();
        this.showNotification('Catégorie ajoutée avec succès!', 'success');

        console.log('[CategoryPage] ✅ Catégorie ajoutée:', name);
    }

    editCategory(id) {
        const category = this.categories[id];
        if (!category) return;

        const newName = prompt('Nouveau nom de la catégorie:', category.name);
        if (newName && newName.trim() && newName.trim() !== category.name) {
            category.name = newName.trim();
            this.renderCategories();
            this.saveCategories();
            this.showNotification('Catégorie modifiée!', 'success');
            console.log('[CategoryPage] ✏️ Catégorie modifiée:', id);
        }
    }

    deleteCategory(id) {
        const category = this.categories[id];
        if (!category) return;

        if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
            delete this.categories[id];
            this.renderCategories();
            this.saveCategories();
            this.showNotification('Catégorie supprimée!', 'info');
            console.log('[CategoryPage] 🗑️ Catégorie supprimée:', id);
        }
    }

    resetCategories() {
        if (confirm('Réinitialiser toutes les catégories aux valeurs par défaut ?')) {
            this.loadCategories(); // Recharge les catégories par défaut
            this.renderCategories();
            this.saveCategories();
            this.showNotification('Catégories réinitialisées!', 'info');
            console.log('[CategoryPage] 🔄 Catégories réinitialisées');
        }
    }

    saveCategories() {
        try {
            localStorage.setItem('emailsortpro_categories', JSON.stringify(this.categories));
            this.showNotification('Catégories sauvegardées!', 'success');
            
            // Synchroniser avec CategoryManager si disponible
            if (window.categoryManager && typeof window.categoryManager.updateCategories === 'function') {
                window.categoryManager.updateCategories(this.categories);
            }
            
            console.log('[CategoryPage] 💾 Catégories sauvegardées:', Object.keys(this.categories).length);
        } catch (error) {
            console.error('[CategoryPage] ❌ Erreur sauvegarde catégories:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    exportCategories() {
        try {
            const data = {
                version: '4.0',
                timestamp: new Date().toISOString(),
                categories: this.categories
            };

            this.downloadJSON(data, `EmailSortPro-Categories-${new Date().toISOString().split('T')[0]}.json`);
            this.showNotification('Catégories exportées!', 'success');
        } catch (error) {
            this.showNotification('Erreur lors de l\'export', 'error');
        }
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================

    initBackupService() {
        // Créer un service de backup simple et fonctionnel
        window.backupService = {
            folderHandle: null,
            enabled: false,
            frequency: 60,
            lastBackup: null,
            filesCount: 0,
            timer: null,

            async selectFolder() {
                try {
                    if (!window.showDirectoryPicker) {
                        throw new Error('API File System non supportée par votre navigateur');
                    }

                    this.folderHandle = await window.showDirectoryPicker({
                        mode: 'readwrite',
                        startIn: 'documents',
                        id: 'emailsortpro-backup'
                    });

                    // Test d'écriture
                    await this.testWriteAccess();
                    return true;
                } catch (error) {
                    console.error('[BackupService] Erreur sélection dossier:', error);
                    return false;
                }
            },

            async testWriteAccess() {
                const testFileName = '.emailsortpro-test-' + Date.now();
                const testHandle = await this.folderHandle.getFileHandle(testFileName, { create: true });
                const writable = await testHandle.createWritable();
                await writable.write('Test EmailSortPro');
                await writable.close();
                await this.folderHandle.removeEntry(testFileName);
            },

            enable() {
                this.enabled = true;
                this.startTimer();
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

            async performBackup() {
                if (!this.folderHandle) return false;

                try {
                    const data = this.collectData();
                    const timestamp = new Date();
                    const fileName = `EmailSortPro-Backup-${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;

                    const fileHandle = await this.folderHandle.getFileHandle(fileName, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(JSON.stringify(data, null, 2));
                    await writable.close();

                    this.lastBackup = timestamp;
                    await this.updateFilesCount();
                    return true;
                } catch (error) {
                    console.error('[BackupService] Erreur backup:', error);
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

        console.log('[CategoryPage] 💾 Service de backup initialisé');
        this.updateBackupUI();
    }

    async autoSetupBackup() {
        const btn = document.getElementById('auto-setup-backup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Configuration...';
        }

        try {
            const success = await window.backupService.selectFolder();
            if (success) {
                // Créer des données de test
                await this.createTestDataForBackup();
                
                // Faire un backup initial
                await window.backupService.performBackup();
                window.backupService.enable();
                
                this.showNotification('Configuration automatique réussie!', 'success');
            } else {
                this.showNotification('Erreur lors de la configuration', 'error');
            }
        } catch (error) {
            this.showNotification('Erreur: ' + error.message, 'error');
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magic"></i> Configuration automatique';
        }

        this.updateBackupUI();
    }

    async manualSetupBackup() {
        const success = await window.backupService.selectFolder();
        if (success) {
            this.showNotification('Dossier sélectionné avec succès!', 'success');
            this.updateBackupUI();
        } else {
            this.showNotification('Échec de la sélection du dossier', 'error');
        }
    }

    toggleBackup(enabled) {
        if (enabled) {
            if (window.backupService.folderHandle) {
                window.backupService.enable();
                this.showNotification('Sauvegardes automatiques activées', 'success');
            } else {
                document.getElementById('backup-enabled').checked = false;
                this.showNotification('Veuillez d\'abord configurer un dossier', 'warning');
            }
        } else {
            window.backupService.disable();
            this.showNotification('Sauvegardes automatiques désactivées', 'info');
        }
        this.updateBackupUI();
    }

    setBackupFrequency(minutes) {
        window.backupService.setFrequency(minutes);
        this.showNotification(`Fréquence mise à jour: toutes les ${this.formatFrequency(minutes)}`, 'info');
    }

    formatFrequency(minutes) {
        if (minutes < 60) return `${minutes} minutes`;
        if (minutes === 60) return 'heure';
        if (minutes < 1440) return `${minutes / 60} heures`;
        return `${minutes / 1440} jour(s)`;
    }

    async performManualBackup() {
        const btn = document.getElementById('manual-backup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';
        }

        const success = await window.backupService.performBackup();
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder maintenant';
        }

        if (success) {
            this.showNotification('Sauvegarde effectuée avec succès!', 'success');
        } else {
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }

        this.updateBackupUI();
    }

    async createTestFiles() {
        const btn = document.getElementById('create-test-files');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
        }

        try {
            if (!window.backupService.folderHandle) {
                this.showNotification('Veuillez d\'abord configurer un dossier', 'warning');
                return;
            }

            // Créer des données de test variées
            await this.createTestDataForBackup();

            // Créer plusieurs fichiers de test
            for (let i = 0; i < 3; i++) {
                await window.backupService.performBackup();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.showNotification('Fichiers de test créés avec succès!', 'success');
        } catch (error) {
            this.showNotification('Erreur: ' + error.message, 'error');
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-file-alt"></i> Créer fichiers de test';
        }

        this.updateBackupUI();
    }

    async createTestDataForBackup() {
        // Ajouter des catégories de test si nécessaire
        if (Object.keys(this.categories).length < 5) {
            this.categories['travel'] = {
                name: 'Voyage',
                color: '#8b5cf6',
                keywords: ['flight', 'hotel', 'travel', 'booking'],
                count: Math.floor(Math.random() * 10) + 1
            };
        }

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
        this.saveCategories();

        console.log('[CategoryPage] 🧪 Données de test créées');
    }

    updateBackupUI() {
        if (!window.backupService) return;

        const status = window.backupService.getStatus();

        // Mettre à jour l'indicateur de statut
        const statusElement = document.getElementById('backup-status');
        const detailElement = document.getElementById('backup-detail');

        if (statusElement && detailElement) {
            if (status.folderConfigured && status.enabled) {
                statusElement.className = 'status-indicator active';
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i><span>Actif</span>';
                detailElement.textContent = 'Les sauvegardes automatiques sont activées';
            } else if (status.folderConfigured && !status.enabled) {
                statusElement.className = 'status-indicator warning';
                statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Configuré</span>';
                detailElement.textContent = 'Dossier configuré, activez les sauvegardes automatiques';
            } else {
                statusElement.className = 'status-indicator inactive';
                statusElement.innerHTML = '<i class="fas fa-times-circle"></i><span>Non configuré</span>';
                detailElement.textContent = 'Sélectionnez un dossier de sauvegarde';
            }
        }

        // Mettre à jour les informations
        const elements = {
            'last-backup': status.lastBackup || 'Jamais',
            'files-count': status.filesCount || 0,
            'data-size': this.calculateDataSize(),
            'service-status': status.enabled ? 'Actif' : 'Inactif'
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

        const manualBackupBtn = document.getElementById('manual-backup');
        if (manualBackupBtn) {
            manualBackupBtn.disabled = !status.folderConfigured;
        }

        // Afficher le dossier si configuré
        const folderDisplay = document.getElementById('folder-display');
        const folderPath = document.getElementById('folder-path');
        if (folderDisplay && folderPath) {
            if (status.folderConfigured) {
                folderDisplay.style.display = 'block';
                folderPath.textContent = 'Dossier configuré avec succès';
            } else {
                folderDisplay.style.display = 'none';
            }
        }
    }

    calculateDataSize() {
        try {
            const data = {
                categories: this.categories,
                settings: this.getGeneralSettings(),
                localStorage: Object.keys(localStorage).length
            };
            const sizeBytes = JSON.stringify(data).length;
            
            if (sizeBytes < 1024) return sizeBytes + ' B';
            if (sizeBytes < 1024 * 1024) return Math.round(sizeBytes / 1024) + ' KB';
            return Math.round(sizeBytes / (1024 * 1024)) + ' MB';
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
                    settings: this.getGeneralSettings(),
                    localStorage: this.getLocalStorageData()
                }
            };

            this.downloadJSON(data, `EmailSortPro-Export-${new Date().toISOString().split('T')[0]}.json`);
            this.showNotification('Toutes les données exportées!', 'success');
        } catch (error) {
            this.showNotification('Erreur lors de l\'export: ' + error.message, 'error');
        }
    }

    importData() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput?.files[0];
        
        if (!file) {
            this.showNotification('Veuillez sélectionner un fichier', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.version || !data.data) {
                    throw new Error('Format de fichier invalide');
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
                        this.loadGeneralSettings();
                    }

                    // Importer localStorage
                    if (data.data.localStorage) {
                        Object.entries(data.data.localStorage).forEach(([key, value]) => {
                            localStorage.setItem(key, value);
                        });
                    }

                    this.showNotification('Données importées avec succès!', 'success');
                }
            } catch (error) {
                this.showNotification('Erreur lors de l\'import: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    // ================================================
    // PARAMÈTRES GÉNÉRAUX
    // ================================================

    loadGeneralSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
            
            this.setFieldValue('user-name', settings.userName || '');
            this.setFieldValue('user-email', settings.userEmail || '');
            this.setFieldValue('theme-select', settings.theme || 'light');
            this.setFieldValue('auto-sort', settings.autoSort !== false);
            this.setFieldValue('notifications', settings.notifications !== false);

            this.applyTheme(settings.theme || 'light');
        } catch (error) {
            console.error('[CategoryPage] Erreur chargement paramètres:', error);
        }
    }

    saveAllSettings() {
        try {
            const settings = {
                userName: this.getFieldValue('user-name'),
                userEmail: this.getFieldValue('user-email'),
                theme: this.getFieldValue('theme-select'),
                autoSort: this.getFieldValue('auto-sort'),
                notifications: this.getFieldValue('notifications'),
                lastSaved: new Date().toISOString()
            };

            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            this.saveCategories();
            
            this.showNotification('Tous les paramètres sauvegardés!', 'success');
            console.log('[CategoryPage] 💾 Tous les paramètres sauvegardés');
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
        
        console.log('[CategoryPage] 🎨 Thème appliqué:', theme);
    }

    clearAllData() {
        const confirmation = prompt('Tapez "SUPPRIMER" pour confirmer la suppression de toutes les données:');
        
        if (confirmation === 'SUPPRIMER') {
            // Sauvegarder les clés importantes
            const backupConfig = localStorage.getItem('emailsortpro_backup_config');
            
            // Tout supprimer
            localStorage.clear();
            
            // Restaurer la config de backup si elle existait
            if (backupConfig) {
                localStorage.setItem('emailsortpro_backup_config', backupConfig);
            }
            
            // Réinitialiser les catégories
            this.loadCategories();
            this.renderCategories();
            
            this.showNotification('Toutes les données supprimées!', 'info');
            
            setTimeout(() => {
                window.location.reload();
            }, 2000);
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

    getGeneralSettings() {
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
        console.log(`[CategoryPage] ${type.toUpperCase()}: ${message}`);
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Supprimer après 4 secondes
        setTimeout(() => {
            notification.style.animation = 'slideInNotif 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
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
            
            // Afficher la page des paramètres
            settingsPage.style.display = 'block';
            this.isVisible = true;
            
            // Charger les données actuelles
            this.loadCategories();
            this.loadGeneralSettings();
            this.renderCategories();
            this.updateBackupUI();
            
            console.log('[CategoryPage] 👁️ Page affichée avec', Object.keys(this.categories).length, 'catégories');
        } else {
            console.warn('[CategoryPage] ⚠️ Page settings-page non trouvée dans le DOM');
        }
    }

    hide() {
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            settingsPage.style.display = 'none';
            this.isVisible = false;
            console.log('[CategoryPage] 👁️ Page masquée');
        }
    }

    getCategories() {
        return this.categories;
    }

    updateCategory(id, data) {
        if (this.categories[id]) {
            this.categories[id] = { ...this.categories[id], ...data };
            if (this.isVisible) {
                this.renderCategories();
            }
            this.saveCategories();
            return true;
        }
        return false;
    }

    addCategoryProgrammatically(id, name, color = '#3b82f6', keywords = []) {
        this.categories[id] = {
            name: name,
            color: color,
            keywords: keywords,
            count: 0
        };
        
        if (this.isVisible) {
            this.renderCategories();
        }
        
        this.saveCategories();
        console.log('[CategoryPage] ➕ Catégorie ajoutée programmatiquement:', name);
        return true;
    }

    getCategoryCount() {
        return Object.keys(this.categories).length;
    }

    // Méthodes pour l'intégration avec le système existant
    syncWithSystem() {
        this.syncWithCategoryManager();
        if (this.isVisible) {
            this.renderCategories();
            this.updateBackupUI();
        }
    }

    refresh() {
        if (this.isVisible) {
            this.loadCategories();
            this.renderCategories();
            this.updateBackupUI();
            console.log('[CategoryPage] 🔄 Interface rafraîchie');
        }
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategoryPage);
} else {
    initializeCategoryPage();
}

function initializeCategoryPage() {
    // Créer l'instance globale
    window.categoryPage = new CategoryPage();
    
    // Fonctions globales pour l'intégration
    window.showSettings = () => {
        console.log('[Global] 🔧 Affichage des paramètres demandé');
        window.categoryPage?.show();
    };
    
    window.hideSettings = () => {
        window.categoryPage?.hide();
    };
    
    window.getCategories = () => {
        return window.categoryPage?.getCategories() || {};
    };
    
    window.getAppSettings = () => {
        return window.categoryPage?.getGeneralSettings() || {};
    };
    
    window.updateAppSetting = (key, value) => {
        try {
            const settings = window.categoryPage?.getGeneralSettings() || {};
            settings[key] = value;
            settings.lastModified = new Date().toISOString();
            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('[Global] Erreur mise à jour paramètre:', error);
            return false;
        }
    };

    // Écouter les événements de navigation
    document.addEventListener('showPage', (e) => {
        if (e.detail === 'settings') {
            console.log('[Global] 📄 Événement showPage reçu pour settings');
            window.categoryPage?.show();
        }
    });

    // Synchronisation périodique avec le système
    setInterval(() => {
        if (window.categoryPage) {
            window.categoryPage.syncWithSystem();
        }
    }, 30000); // Toutes les 30 secondes

    // Forcer l'affichage si on est sur la page settings
    setTimeout(() => {
        const currentHash = window.location.hash;
        const currentPage = new URLSearchParams(window.location.search).get('page');
        
        if (currentHash === '#settings' || currentPage === 'settings') {
            console.log('[Global] 🎯 Auto-affichage des paramètres détecté');
            window.categoryPage?.show();
        }
    }, 1000);

    console.log('✅ CategoryPage initialisée et prête');
    console.log('📂 Fonctions disponibles: showSettings(), getCategories(), window.categoryPage');
    console.log('🎯 Catégories chargées:', window.categoryPage?.getCategoryCount() || 0);
    console.log('💾 Service de backup:', window.backupService ? 'Disponible' : 'Indisponible');
}
