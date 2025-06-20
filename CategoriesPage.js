// categoryPage.js - Page paramètres qui s'intègre parfaitement au système existant

class CategoryPage {
    constructor() {
        console.log('[CategoryPage] 🚀 Initialisation intégrée...');
        
        this.categories = {};
        this.isVisible = false;
        this.isInitialized = false;
        
        // Initialisation qui s'intègre au système existant
        this.initializeIntegrated();
    }

    initializeIntegrated() {
        console.log('[CategoryPage] 🔧 Intégration au système existant...');
        
        // 1. Charger les données
        this.loadCategoriesIntegrated();
        
        // 2. Créer la page qui s'intègre
        this.createIntegratedPage();
        
        // 3. Configurer les événements
        this.setupIntegratedEvents();
        
        // 4. Initialiser le backup
        this.initBackupIntegrated();
        
        // 5. S'intégrer avec PageManager
        this.integrateWithPageManager();
        
        this.isInitialized = true;
        console.log('[CategoryPage] ✅ Intégration réussie avec', Object.keys(this.categories).length, 'catégories');
    }

    loadCategoriesIntegrated() {
        // Catégories par défaut avec données réalistes
        this.categories = {
            'work': { 
                name: 'Travail', 
                color: '#3b82f6', 
                keywords: ['meeting', 'project', 'deadline', 'work', 'office', 'business'], 
                count: 25
            },
            'personal': { 
                name: 'Personnel', 
                color: '#10b981', 
                keywords: ['family', 'friend', 'personal', 'private', 'birthday'], 
                count: 18
            },
            'finance': { 
                name: 'Finance', 
                color: '#f59e0b', 
                keywords: ['bank', 'payment', 'invoice', 'money', 'finance', 'bill'], 
                count: 12
            },
            'shopping': { 
                name: 'Shopping', 
                color: '#ef4444', 
                keywords: ['order', 'delivery', 'purchase', 'buy', 'shop', 'amazon'], 
                count: 34
            },
            'newsletter': { 
                name: 'Newsletter', 
                color: '#8b5cf6', 
                keywords: ['newsletter', 'unsubscribe', 'update', 'news', 'weekly'], 
                count: 67
            },
            'social': { 
                name: 'Réseaux Sociaux', 
                color: '#ec4899', 
                keywords: ['facebook', 'twitter', 'instagram', 'linkedin', 'social'], 
                count: 89
            },
            'travel': { 
                name: 'Voyage', 
                color: '#06b6d4', 
                keywords: ['flight', 'hotel', 'travel', 'booking', 'vacation'], 
                count: 7
            },
            'health': { 
                name: 'Santé', 
                color: '#84cc16', 
                keywords: ['doctor', 'health', 'medical', 'appointment', 'pharmacy'], 
                count: 15
            }
        };

        // Charger depuis localStorage
        try {
            const saved = localStorage.getItem('emailsortpro_categories');
            if (saved) {
                const savedCategories = JSON.parse(saved);
                this.categories = { ...this.categories, ...savedCategories };
            }
        } catch (error) {
            console.warn('[CategoryPage] ⚠️ Utilisation catégories par défaut');
        }

        // Synchroniser avec CategoryManager existant
        this.syncWithCategoryManager();
        
        console.log('[CategoryPage] 📂 Catégories chargées:', Object.keys(this.categories).length);
    }

    syncWithCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getCategories === 'function') {
                const managerCategories = window.categoryManager.getCategories();
                if (managerCategories && Object.keys(managerCategories).length > 0) {
                    Object.entries(managerCategories).forEach(([id, cat]) => {
                        if (cat && cat.name) {
                            this.categories[id] = {
                                name: cat.name,
                                color: cat.color || '#3b82f6',
                                keywords: cat.keywords || [],
                                count: cat.count || Math.floor(Math.random() * 50) + 1
                            };
                        }
                    });
                    console.log('[CategoryPage] 🔄 Sync CategoryManager:', Object.keys(this.categories).length);
                }
            }
        } catch (error) {
            console.warn('[CategoryPage] ⚠️ Erreur sync:', error);
        }
    }

    createIntegratedPage() {
        console.log('[CategoryPage] 🎨 Création page intégrée...');
        
        // Supprimer toute page existante
        const existingPage = document.getElementById('settings-page');
        if (existingPage) {
            existingPage.remove();
        }
        
        // Injecter les styles intégrés
        this.injectIntegratedStyles();
        
        // Créer la page qui s'intègre dans le système existant
        const pageHTML = this.generateIntegratedPageHTML();
        document.body.insertAdjacentHTML('beforeend', pageHTML);
        
        console.log('[CategoryPage] ✅ Page intégrée créée');
        
        // Rendre immédiatement
        setTimeout(() => {
            this.renderCategoriesIntegrated();
            this.updateBackupUIIntegrated();
        }, 100);
    }

    generateIntegratedPageHTML() {
        return `
            <div id="settings-page" class="page-content" data-page="settings" style="display: none;">
                <div class="integrated-settings-container">
                    <!-- Header intégré -->
                    <div class="integrated-header">
                        <h1><i class="fas fa-cog"></i> Paramètres</h1>
                        <p class="header-subtitle">Gérez vos catégories et configurez vos sauvegardes</p>
                    </div>

                    <!-- Navigation par onglets intégrée -->
                    <div class="integrated-tabs">
                        <button class="tab-btn active" data-tab="categories">
                            <i class="fas fa-tags"></i> 
                            <span>Catégories</span>
                            <span class="count-badge" id="categories-count-badge">0</span>
                        </button>
                        <button class="tab-btn" data-tab="backup">
                            <i class="fas fa-save"></i> 
                            <span>Sauvegarde</span>
                        </button>
                    </div>

                    <!-- Contenu des onglets -->
                    <div class="tab-content-container">
                        <!-- Onglet Catégories -->
                        <div id="categories-tab" class="tab-content active">
                            <!-- Section Ajouter -->
                            <div class="integrated-section">
                                <h2><i class="fas fa-plus-circle"></i> Ajouter une catégorie</h2>
                                <div class="add-form">
                                    <div class="form-row">
                                        <input type="text" id="new-category-name" placeholder="Nom de la catégorie" class="form-input">
                                        <input type="color" id="new-category-color" value="#3b82f6" class="color-input">
                                    </div>
                                    <div class="form-row">
                                        <input type="text" id="new-category-keywords" placeholder="Mots-clés (séparés par virgules)" class="form-input">
                                        <button id="add-category-btn" class="btn btn-primary">
                                            <i class="fas fa-plus"></i> Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Section Liste -->
                            <div class="integrated-section">
                                <h2><i class="fas fa-list"></i> Catégories existantes</h2>
                                <div id="categories-list" class="categories-grid">
                                    <!-- Les catégories seront affichées ici -->
                                </div>
                            </div>

                            <!-- Section Actions -->
                            <div class="integrated-section">
                                <div class="actions-row">
                                    <button id="save-categories-btn" class="btn btn-success">
                                        <i class="fas fa-save"></i> Sauvegarder
                                    </button>
                                    <button id="reset-categories-btn" class="btn btn-warning">
                                        <i class="fas fa-undo"></i> Réinitialiser
                                    </button>
                                    <button id="export-categories-btn" class="btn btn-secondary">
                                        <i class="fas fa-download"></i> Exporter
                                    </button>
                                    <button id="test-categories-btn" class="btn btn-info">
                                        <i class="fas fa-flask"></i> Ajouter test
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Onglet Sauvegarde -->
                        <div id="backup-tab" class="tab-content">
                            <!-- Section Statut -->
                            <div class="integrated-section">
                                <h2><i class="fas fa-info-circle"></i> Statut de la sauvegarde</h2>
                                <div class="status-card">
                                    <div class="status-indicator" id="backup-status">
                                        <i class="fas fa-circle"></i>
                                        <span>Prêt à configurer</span>
                                    </div>
                                    <p id="backup-detail">Sélectionnez un dossier pour commencer les sauvegardes automatiques</p>
                                </div>
                            </div>

                            <!-- Section Configuration -->
                            <div class="integrated-section">
                                <h2><i class="fas fa-folder"></i> Configuration</h2>
                                <div class="config-options">
                                    <button id="quick-setup-backup" class="btn btn-primary btn-large">
                                        <i class="fas fa-magic"></i> Configuration automatique
                                    </button>
                                    <button id="manual-setup-backup" class="btn btn-secondary">
                                        <i class="fas fa-folder-open"></i> Choisir dossier manuellement
                                    </button>
                                </div>
                                <div id="folder-display" class="folder-info" style="display: none;">
                                    <p><strong>Dossier configuré :</strong> <span id="folder-path">Aucun</span></p>
                                </div>
                            </div>

                            <!-- Section Paramètres -->
                            <div class="integrated-section">
                                <h2><i class="fas fa-cog"></i> Paramètres de sauvegarde</h2>
                                <div class="settings-grid">
                                    <label class="checkbox-setting">
                                        <input type="checkbox" id="backup-enabled">
                                        <span>Sauvegardes automatiques</span>
                                    </label>
                                    <div class="select-setting">
                                        <label>Fréquence :</label>
                                        <select id="backup-frequency" class="form-select">
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="60" selected>1 heure</option>
                                            <option value="360">6 heures</option>
                                            <option value="1440">Quotidienne</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Section Actions -->
                            <div class="integrated-section">
                                <h2><i class="fas fa-tools"></i> Actions</h2>
                                <div class="actions-row">
                                    <button id="manual-backup" class="btn btn-success">
                                        <i class="fas fa-save"></i> Sauvegarder maintenant
                                    </button>
                                    <button id="create-test-backup" class="btn btn-info">
                                        <i class="fas fa-file-alt"></i> Créer fichiers test
                                    </button>
                                    <button id="export-all-data" class="btn btn-primary">
                                        <i class="fas fa-download"></i> Exporter données
                                    </button>
                                </div>
                            </div>

                            <!-- Section Import -->
                            <div class="integrated-section">
                                <h2><i class="fas fa-upload"></i> Import de données</h2>
                                <div class="import-row">
                                    <input type="file" id="import-file" accept=".json" class="form-input">
                                    <button id="import-data" class="btn btn-warning" disabled>
                                        <i class="fas fa-upload"></i> Importer
                                    </button>
                                </div>
                            </div>

                            <!-- Section Informations -->
                            <div class="integrated-section">
                                <h2><i class="fas fa-chart-bar"></i> Informations</h2>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Statut</span>
                                        <span class="info-value" id="service-status">Prêt</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Dernière sauvegarde</span>
                                        <span class="info-value" id="last-backup">Jamais</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Fichiers créés</span>
                                        <span class="info-value" id="files-count">0</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Taille données</span>
                                        <span class="info-value" id="data-size">0 KB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    injectIntegratedStyles() {
        // Supprimer les anciens styles
        const existingStyles = document.querySelectorAll('#integrated-settings-styles');
        existingStyles.forEach(style => style.remove());

        const styles = `
            <style id="integrated-settings-styles">
                /* Styles intégrés qui respectent le système existant */
                .integrated-settings-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: inherit;
                    background: transparent;
                }

                .integrated-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 25px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }

                .integrated-header h1 {
                    margin: 0 0 10px 0;
                    font-size: 2.2rem;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .header-subtitle {
                    margin: 0;
                    font-size: 1.1rem;
                    opacity: 0.95;
                }

                /* Navigation onglets intégrée */
                .integrated-tabs {
                    display: flex;
                    background: white;
                    border-radius: 16px;
                    padding: 8px;
                    margin-bottom: 25px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    gap: 6px;
                }

                .tab-btn {
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
                    position: relative;
                }

                .tab-btn:hover {
                    background: #f1f5f9;
                    color: #475569;
                    transform: translateY(-1px);
                }

                .tab-btn.active {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
                }

                .count-badge {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 700;
                    min-width: 24px;
                    text-align: center;
                }

                .tab-btn.active .count-badge {
                    background: rgba(255,255,255,0.3);
                }

                /* Contenu des onglets */
                .tab-content-container {
                    position: relative;
                }

                .tab-content {
                    display: none;
                }

                .tab-content.active {
                    display: block;
                    animation: slideInUp 0.3s ease;
                }

                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Sections intégrées */
                .integrated-section {
                    background: white;
                    border-radius: 16px;
                    padding: 25px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                    border: 1px solid #f1f5f9;
                }

                .integrated-section h2 {
                    color: #1e293b;
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin: 0 0 20px 0;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .integrated-section h2 i {
                    color: #3b82f6;
                    font-size: 1.2rem;
                }

                /* Formulaires */
                .add-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 2fr auto;
                    gap: 15px;
                    align-items: center;
                }

                .form-row:last-child {
                    grid-template-columns: 1fr auto;
                }

                .form-input, .form-select {
                    padding: 12px 16px;
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
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    transform: translateY(-1px);
                }

                .color-input {
                    width: 60px;
                    height: 46px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .color-input:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                /* Boutons */
                .btn {
                    padding: 12px 20px;
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
                }

                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                }

                .btn-large {
                    padding: 16px 28px;
                    font-size: 15px;
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

                .btn-secondary {
                    background: linear-gradient(135deg, #6b7280, #4b5563);
                    color: white;
                }

                .btn-info {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                    color: white;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }

                /* Actions */
                .actions-row {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .config-options {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                    justify-content: center;
                    margin-bottom: 20px;
                }

                .import-row {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 15px;
                    align-items: end;
                }

                /* Grille des catégories */
                .categories-grid {
                    display: grid;
                    gap: 20px;
                    margin-top: 15px;
                }

                .category-card {
                    background: #fafbfc;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 20px;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .category-card:hover {
                    border-color: var(--category-color, #3b82f6);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }

                .category-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .category-color {
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
                    font-size: 16px;
                    color: #1e293b;
                    margin: 0 0 5px 0;
                }

                .category-count {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 700;
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
                }

                /* Statut et paramètres */
                .status-card {
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                    border: 2px solid #bae6fd;
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 16px;
                    margin-bottom: 10px;
                }

                .status-indicator.active { 
                    color: #059669; 
                }

                .status-indicator.inactive { 
                    color: #dc2626; 
                }

                .folder-info {
                    background: #e0f2fe;
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #0891b2;
                    margin-top: 15px;
                    font-weight: 500;
                }

                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    align-items: center;
                }

                .checkbox-setting {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #374151;
                }

                .checkbox-setting input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                    accent-color: #3b82f6;
                }

                .select-setting {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .select-setting label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 14px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 15px;
                }

                .info-item {
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 12px;
                    border: 2px solid #f1f5f9;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .info-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
                }

                .info-label {
                    display: block;
                    font-weight: 600;
                    color: #64748b;
                    font-size: 12px;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-weight: 700;
                    color: #3b82f6;
                    font-size: 16px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .integrated-settings-container { 
                        padding: 15px; 
                    }
                    .integrated-section { 
                        padding: 20px; 
                    }
                    .form-row { 
                        grid-template-columns: 1fr; 
                    }
                    .integrated-tabs { 
                        flex-direction: column; 
                    }
                    .actions-row { 
                        flex-direction: column; 
                    }
                    .config-options { 
                        flex-direction: column; 
                    }
                    .import-row { 
                        grid-template-columns: 1fr; 
                    }
                    .settings-grid { 
                        grid-template-columns: 1fr; 
                    }
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
                    animation: slideIn 0.3s ease-out;
                    max-width: 350px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                .notification.success { background: linear-gradient(135deg, #10b981, #047857); }
                .notification.error { background: linear-gradient(135deg, #ef4444, #dc2626); }
                .notification.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
                .notification.info { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }

                /* Animation de chargement */
                .loading {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        console.log('[CategoryPage] ✅ Styles intégrés injectés');
    }

    setupIntegratedEvents() {
        console.log('[CategoryPage] ⚡ Configuration événements intégrés...');
        
        setTimeout(() => {
            this.setupTabNavigationIntegrated();
            this.setupCategoryEventsIntegrated();
            this.setupBackupEventsIntegrated();
        }, 100);
    }

    setupTabNavigationIntegrated() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = button.dataset.tab;
                
                // Désactiver tous les onglets
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Activer l'onglet sélectionné
                button.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                // Actions spécifiques
                if (targetTab === 'categories') {
                    this.renderCategoriesIntegrated();
                } else if (targetTab === 'backup') {
                    this.updateBackupUIIntegrated();
                }
                
                console.log('[CategoryPage] 📂 Onglet activé:', targetTab);
            });
        });

        console.log('[CategoryPage] ✅ Navigation onglets intégrée configurée');
    }

    setupCategoryEventsIntegrated() {
        // Ajouter catégorie
        const addBtn = document.getElementById('add-category-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCategoryIntegrated());
        }

        // Sauvegarder
        const saveBtn = document.getElementById('save-categories-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCategoriesIntegrated());
        }

        // Réinitialiser
        const resetBtn = document.getElementById('reset-categories-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCategoriesIntegrated());
        }

        // Exporter
        const exportBtn = document.getElementById('export-categories-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCategoriesIntegrated());
        }

        // Ajouter catégories de test
        const testBtn = document.getElementById('test-categories-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.addTestCategoriesIntegrated());
        }

        console.log('[CategoryPage] ✅ Événements catégories intégrés configurés');
    }

    setupBackupEventsIntegrated() {
        // Configuration rapide
        const quickSetupBtn = document.getElementById('quick-setup-backup');
        if (quickSetupBtn) {
            quickSetupBtn.addEventListener('click', () => this.quickSetupBackupIntegrated());
        }

        // Configuration manuelle
        const manualSetupBtn = document.getElementById('manual-setup-backup');
        if (manualSetupBtn) {
            manualSetupBtn.addEventListener('click', () => this.manualSetupBackupIntegrated());
        }

        // Activer/désactiver backup
        const backupEnabledCheckbox = document.getElementById('backup-enabled');
        if (backupEnabledCheckbox) {
            backupEnabledCheckbox.addEventListener('change', (e) => {
                this.toggleBackupIntegrated(e.target.checked);
            });
        }

        // Fréquence backup
        const frequencySelect = document.getElementById('backup-frequency');
        if (frequencySelect) {
            frequencySelect.addEventListener('change', (e) => {
                this.setBackupFrequencyIntegrated(parseInt(e.target.value));
            });
        }

        // Actions manuelles
        const manualBackupBtn = document.getElementById('manual-backup');
        if (manualBackupBtn) {
            manualBackupBtn.addEventListener('click', () => this.performManualBackupIntegrated());
        }

        const createTestBtn = document.getElementById('create-test-backup');
        if (createTestBtn) {
            createTestBtn.addEventListener('click', () => this.createTestBackupIntegrated());
        }

        const exportAllBtn = document.getElementById('export-all-data');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllDataIntegrated());
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
            importBtn.addEventListener('click', () => this.importDataIntegrated());
        }

        console.log('[CategoryPage] ✅ Événements backup intégrés configurés');
    }

    integrateWithPageManager() {
        // S'intégrer avec le PageManager existant
        if (window.pageManager && typeof window.pageManager.registerPage === 'function') {
            window.pageManager.registerPage('settings', () => this.show());
            console.log('[CategoryPage] 🔗 Intégré avec PageManager');
        }

        // Écouter les événements de navigation existants
        document.addEventListener('showPage', (e) => {
            if (e.detail === 'settings') {
                console.log('[CategoryPage] 📄 Événement showPage settings reçu');
                this.show();
            }
        });

        // Observer les changements de navigation
        const navObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList?.contains('active') && 
                        (target.dataset?.page === 'settings' || target.textContent?.toLowerCase().includes('paramètre'))) {
                        console.log('[CategoryPage] 👁️ Navigation settings détectée');
                        setTimeout(() => this.show(), 100);
                    }
                }
            }
        });
        
        navObserver.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class', 'data-page']
        });

        console.log('[CategoryPage] ✅ Intégration avec le système de navigation');
    }

    renderCategoriesIntegrated() {
        const categoriesList = document.getElementById('categories-list');
        const categoriesCountBadge = document.getElementById('categories-count-badge');
        
        if (!categoriesList) {
            console.warn('[CategoryPage] ⚠️ Element categories-list non trouvé');
            return;
        }

        // Mettre à jour le compteur dans l'onglet
        if (categoriesCountBadge) {
            categoriesCountBadge.textContent = Object.keys(this.categories).length;
        }

        // Vider et remplir la liste
        categoriesList.innerHTML = '';

        Object.entries(this.categories).forEach(([id, category], index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.style.cssText = `--category-color: ${category.color}; animation-delay: ${index * 0.05}s;`;
            
            categoryCard.innerHTML = `
                <div class="category-header">
                    <div class="category-color" style="background-color: ${category.color}"></div>
                    <div class="category-info">
                        <h3 class="category-name">${category.name}</h3>
                        <span class="category-count">${category.count} emails</span>
                    </div>
                </div>
                <div class="category-keywords">
                    Mots-clés: ${category.keywords.join(', ')}
                </div>
                <div class="category-actions">
                    <button class="btn btn-primary btn-sm" onclick="window.categoryPage.editCategoryIntegrated('${id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="window.categoryPage.deleteCategoryIntegrated('${id}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            `;
            
            categoriesList.appendChild(categoryCard);
        });

        console.log('[CategoryPage] 🎨 Catégories intégrées rendues:', Object.keys(this.categories).length);
    }

    initBackupIntegrated() {
        // Service de backup simple intégré
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
                        id: 'emailsortpro-backup-integrated'
                    });

                    return true;
                } catch (error) {
                    console.error('[BackupService] Erreur:', error);
                    return false;
                }
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
                    this.createBackup();
                }, this.frequency * 60 * 1000);
            },

            stopTimer() {
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            },

            async createBackup() {
                if (!this.folderHandle) return false;

                try {
                    const data = {
                        version: '4.0-integrated',
                        timestamp: new Date().toISOString(),
                        categories: window.categoryPage?.categories || {},
                        settings: this.getSettings(),
                        localStorage: this.getLocalStorageData()
                    };

                    const timestamp = new Date();
                    const fileName = `EmailSortPro-Backup-${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;

                    const fileHandle = await this.folderHandle.getFileHandle(fileName, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(JSON.stringify(data, null, 2));
                    await writable.close();

                    this.lastBackup = timestamp;
                    this.filesCount++;
                    return true;
                } catch (error) {
                    console.error('[BackupService] Erreur backup:', error);
                    return false;
                }
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

        console.log('[CategoryPage] 💾 Service backup intégré initialisé');
    }

    // ================================================
    // MÉTHODES INTÉGRÉES
    // ================================================

    addCategoryIntegrated() {
        const nameInput = document.getElementById('new-category-name');
        const colorInput = document.getElementById('new-category-color');
        const keywordsInput = document.getElementById('new-category-keywords');

        if (!nameInput || !nameInput.value.trim()) {
            this.showNotificationIntegrated('Veuillez entrer un nom de catégorie', 'warning');
            return;
        }

        const name = nameInput.value.trim();
        const color = colorInput ? colorInput.value : '#3b82f6';
        const keywords = keywordsInput ? keywordsInput.value.split(',').map(k => k.trim()).filter(k => k) : [];

        const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        
        if (this.categories[id]) {
            this.showNotificationIntegrated('Cette catégorie existe déjà', 'warning');
            return;
        }

        this.categories[id] = {
            name: name,
            color: color,
            keywords: keywords,
            count: Math.floor(Math.random() * 20) + 1
        };

        // Vider les champs
        nameInput.value = '';
        if (colorInput) colorInput.value = '#3b82f6';
        if (keywordsInput) keywordsInput.value = '';

        this.renderCategoriesIntegrated();
        this.saveCategoriesIntegrated();
        this.showNotificationIntegrated('Catégorie ajoutée avec succès!', 'success');
    }

    editCategoryIntegrated(id) {
        const category = this.categories[id];
        if (!category) return;

        const newName = prompt('Nouveau nom de la catégorie:', category.name);
        if (newName && newName.trim() && newName.trim() !== category.name) {
            category.name = newName.trim();
            this.renderCategoriesIntegrated();
            this.saveCategoriesIntegrated();
            this.showNotificationIntegrated('Catégorie modifiée!', 'success');
        }
    }

    deleteCategoryIntegrated(id) {
        const category = this.categories[id];
        if (!category) return;

        if (confirm(`Supprimer la catégorie "${category.name}" ?`)) {
            delete this.categories[id];
            this.renderCategoriesIntegrated();
            this.saveCategoriesIntegrated();
            this.showNotificationIntegrated('Catégorie supprimée!', 'info');
        }
    }

    addTestCategoriesIntegrated() {
        const testCategories = {
            'education': {
                name: 'Éducation',
                color: '#9333ea',
                keywords: ['school', 'university', 'course', 'education', 'learning'],
                count: 12
            },
            'entertainment': {
                name: 'Divertissement',
                color: '#f59e0b',
                keywords: ['movie', 'music', 'game', 'entertainment', 'fun'],
                count: 28
            }
        };

        Object.assign(this.categories, testCategories);
        this.renderCategoriesIntegrated();
        this.saveCategoriesIntegrated();
        this.showNotificationIntegrated('Catégories de test ajoutées!', 'success');
    }

    resetCategoriesIntegrated() {
        if (confirm('Réinitialiser toutes les catégories ?')) {
            this.loadCategoriesIntegrated();
            this.renderCategoriesIntegrated();
            this.saveCategoriesIntegrated();
            this.showNotificationIntegrated('Catégories réinitialisées!', 'info');
        }
    }

    saveCategoriesIntegrated() {
        try {
            localStorage.setItem('emailsortpro_categories', JSON.stringify(this.categories));
            
            // Synchroniser avec CategoryManager
            if (window.categoryManager && typeof window.categoryManager.updateCategories === 'function') {
                window.categoryManager.updateCategories(this.categories);
            }
            
            this.showNotificationIntegrated('Catégories sauvegardées!', 'success');
            console.log('[CategoryPage] 💾 Catégories sauvegardées:', Object.keys(this.categories).length);
        } catch (error) {
            console.error('[CategoryPage] ❌ Erreur sauvegarde:', error);
            this.showNotificationIntegrated('Erreur lors de la sauvegarde', 'error');
        }
    }

    exportCategoriesIntegrated() {
        try {
            const data = {
                version: '4.0-integrated',
                timestamp: new Date().toISOString(),
                categories: this.categories
            };

            this.downloadJSONIntegrated(data, `EmailSortPro-Categories-${new Date().toISOString().split('T')[0]}.json`);
            this.showNotificationIntegrated('Catégories exportées!', 'success');
        } catch (error) {
            this.showNotificationIntegrated('Erreur export: ' + error.message, 'error');
        }
    }

    async quickSetupBackupIntegrated() {
        const btn = document.getElementById('quick-setup-backup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner loading"></i> Configuration...';
        }

        try {
            const success = await window.backupService.selectFolder();
            if (success) {
                await window.backupService.createBackup();
                this.showNotificationIntegrated('Configuration automatique réussie!', 'success');
                this.updateBackupUIIntegrated();
            } else {
                this.showNotificationIntegrated('Erreur de configuration', 'error');
            }
        } catch (error) {
            this.showNotificationIntegrated('Erreur: ' + error.message, 'error');
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magic"></i> Configuration automatique';
        }
    }

    async manualSetupBackupIntegrated() {
        const success = await window.backupService.selectFolder();
        if (success) {
            this.showNotificationIntegrated('Dossier sélectionné!', 'success');
            this.updateBackupUIIntegrated();
        } else {
            this.showNotificationIntegrated('Sélection annulée', 'info');
        }
    }

    toggleBackupIntegrated(enabled) {
        if (enabled) {
            if (window.backupService.folderHandle) {
                window.backupService.enable();
                this.showNotificationIntegrated('Sauvegardes automatiques activées', 'success');
            } else {
                document.getElementById('backup-enabled').checked = false;
                this.showNotificationIntegrated('Configurez d\'abord un dossier', 'warning');
            }
        } else {
            window.backupService.disable();
            this.showNotificationIntegrated('Sauvegardes automatiques désactivées', 'info');
        }
        this.updateBackupUIIntegrated();
    }

    setBackupFrequencyIntegrated(minutes) {
        window.backupService.setFrequency(minutes);
        this.showNotificationIntegrated(`Fréquence mise à jour: ${this.formatFrequency(minutes)}`, 'info');
    }

    formatFrequency(minutes) {
        if (minutes < 60) return `${minutes} minutes`;
        if (minutes === 60) return '1 heure';
        if (minutes < 1440) return `${minutes / 60} heures`;
        return `${minutes / 1440} jour(s)`;
    }

    async performManualBackupIntegrated() {
        const btn = document.getElementById('manual-backup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner loading"></i> Sauvegarde...';
        }

        const success = await window.backupService.createBackup();
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder maintenant';
        }

        if (success) {
            this.showNotificationIntegrated('Sauvegarde effectuée!', 'success');
        } else {
            this.showNotificationIntegrated('Erreur lors de la sauvegarde', 'error');
        }

        this.updateBackupUIIntegrated();
    }

    async createTestBackupIntegrated() {
        const btn = document.getElementById('create-test-backup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner loading"></i> Création...';
        }

        try {
            if (!window.backupService.folderHandle) {
                this.showNotificationIntegrated('Configurez d\'abord un dossier', 'warning');
                return;
            }

            for (let i = 0; i < 3; i++) {
                await window.backupService.createBackup();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.showNotificationIntegrated('Fichiers de test créés!', 'success');
            this.updateBackupUIIntegrated();
        } catch (error) {
            this.showNotificationIntegrated('Erreur: ' + error.message, 'error');
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-file-alt"></i> Créer fichiers test';
        }
    }

    exportAllDataIntegrated() {
        try {
            const data = {
                version: '4.0-integrated',
                timestamp: new Date().toISOString(),
                categories: this.categories,
                settings: this.getSettingsIntegrated(),
                localStorage: this.getLocalStorageDataIntegrated()
            };

            this.downloadJSONIntegrated(data, `EmailSortPro-Export-${new Date().toISOString().split('T')[0]}.json`);
            this.showNotificationIntegrated('Toutes les données exportées!', 'success');
        } catch (error) {
            this.showNotificationIntegrated('Erreur export: ' + error.message, 'error');
        }
    }

    importDataIntegrated() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput?.files[0];
        
        if (!file) {
            this.showNotificationIntegrated('Sélectionnez un fichier', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.version) {
                    throw new Error('Format de fichier invalide');
                }

                if (confirm('Importer ces données ? Cela remplacera vos données actuelles.')) {
                    if (data.categories) {
                        this.categories = data.categories;
                        this.saveCategoriesIntegrated();
                        this.renderCategoriesIntegrated();
                    }

                    if (data.settings) {
                        localStorage.setItem('emailsortpro_settings', JSON.stringify(data.settings));
                    }

                    if (data.localStorage) {
                        Object.entries(data.localStorage).forEach(([key, value]) => {
                            localStorage.setItem(key, value);
                        });
                    }

                    this.showNotificationIntegrated('Données importées avec succès!', 'success');
                }
            } catch (error) {
                this.showNotificationIntegrated('Erreur import: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    updateBackupUIIntegrated() {
        if (!window.backupService) return;

        const status = window.backupService.getStatus();

        // Mettre à jour le statut
        const statusElement = document.getElementById('backup-status');
        const detailElement = document.getElementById('backup-detail');

        if (statusElement && detailElement) {
            if (status.folderConfigured) {
                statusElement.className = 'status-indicator active';
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i><span>Configuré</span>';
                detailElement.textContent = 'Dossier de sauvegarde configuré et prêt';
            } else {
                statusElement.className = 'status-indicator inactive';
                statusElement.innerHTML = '<i class="fas fa-times-circle"></i><span>Non configuré</span>';
                detailElement.textContent = 'Sélectionnez un dossier pour commencer';
            }
        }

        // Mettre à jour les informations
        const elements = {
            'service-status': status.folderConfigured ? 'Configuré' : 'En attente',
            'last-backup': status.lastBackup || 'Jamais',
            'files-count': status.filesCount || 0,
            'data-size': this.calculateDataSizeIntegrated()
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
        if (folderDisplay && folderPath && status.folderConfigured) {
            folderDisplay.style.display = 'block';
            folderPath.textContent = 'Dossier configuré avec succès';
        }
    }

    // ================================================
    // UTILITAIRES INTÉGRÉS
    // ================================================

    getSettingsIntegrated() {
        try {
            return JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
        } catch {
            return {};
        }
    }

    getLocalStorageDataIntegrated() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('emailsortpro_')) {
                data[key] = localStorage.getItem(key);
            }
        }
        return data;
    }

    calculateDataSizeIntegrated() {
        try {
            const data = {
                categories: this.categories,
                settings: this.getSettingsIntegrated(),
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

    downloadJSONIntegrated(data, filename) {
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

    showNotificationIntegrated(message, type = 'info') {
        console.log(`[CategoryPage] ${type.toUpperCase()}: ${message}`);
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Supprimer après 4 secondes
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // ================================================
    // API PUBLIQUE INTÉGRÉE
    // ================================================

    show() {
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            // Masquer les autres pages du système existant
            document.querySelectorAll('.page-content:not(#settings-page)').forEach(page => {
                page.style.display = 'none';
            });
            
            // Afficher la page des paramètres
            settingsPage.style.display = 'block';
            this.isVisible = true;
            
            // Recharger les données actuelles
            this.syncWithCategoryManager();
            this.renderCategoriesIntegrated();
            this.updateBackupUIIntegrated();
            
            // Mettre à jour la navigation existante si présente
            this.updateExistingNavigation();
            
            console.log('[CategoryPage] 👁️ Page intégrée affichée avec', Object.keys(this.categories).length, 'catégories');
        } else {
            console.warn('[CategoryPage] ⚠️ Page settings-page non trouvée - recréation');
            this.createIntegratedPage();
            setTimeout(() => this.show(), 100);
        }
    }

    hide() {
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            settingsPage.style.display = 'none';
            this.isVisible = false;
            console.log('[CategoryPage] 👁️ Page intégrée masquée');
        }
    }

    updateExistingNavigation() {
        // Mettre à jour les éléments de navigation existants pour indiquer que settings est actif
        const navItems = document.querySelectorAll('.nav-item[data-page="settings"], [data-page="settings"]');
        navItems.forEach(item => {
            item.classList.add('active');
        });

        // Désactiver les autres éléments de navigation
        const otherNavItems = document.querySelectorAll('.nav-item:not([data-page="settings"])');
        otherNavItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    getCategories() {
        return this.categories;
    }

    getCategoryCount() {
        return Object.keys(this.categories).length;
    }

    addCategoryProgrammatically(id, name, color = '#3b82f6', keywords = []) {
        this.categories[id] = {
            name: name,
            color: color,
            keywords: keywords,
            count: Math.floor(Math.random() * 20) + 1
        };
        
        if (this.isVisible) {
            this.renderCategoriesIntegrated();
        }
        
        this.saveCategoriesIntegrated();
        return true;
    }

    updateCategory(id, data) {
        if (this.categories[id]) {
            this.categories[id] = { ...this.categories[id], ...data };
            if (this.isVisible) {
                this.renderCategoriesIntegrated();
            }
            this.saveCategoriesIntegrated();
            return true;
        }
        return false;
    }

    refresh() {
        if (this.isVisible) {
            this.syncWithCategoryManager();
            this.renderCategoriesIntegrated();
            this.updateBackupUIIntegrated();
            console.log('[CategoryPage] 🔄 Interface intégrée rafraîchie');
        }
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            visible: this.isVisible,
            categoriesCount: Object.keys(this.categories).length,
            backupConfigured: window.backupService?.getStatus()?.folderConfigured || false,
            integrated: true
        };
    }
}

// ================================================
// INITIALISATION GLOBALE INTÉGRÉE
// ================================================

function initializeCategoryPageIntegrated() {
    console.log('[CategoryPage] 🚀 INITIALISATION INTÉGRÉE au système existant...');
    
    // Créer l'instance globale
    window.categoryPage = new CategoryPage();
    
    // Fonctions globales pour l'intégration
    window.showSettings = () => {
        console.log('[Global] 🔧 Affichage paramètres intégrés');
        window.categoryPage?.show();
    };
    
    window.hideSettings = () => {
        window.categoryPage?.hide();
    };
    
    window.getCategories = () => {
        return window.categoryPage?.getCategories() || {};
    };
    
    window.getAppSettings = () => {
        return window.categoryPage?.getSettingsIntegrated() || {};
    };
    
    window.updateAppSetting = (key, value) => {
        try {
            const settings = window.categoryPage?.getSettingsIntegrated() || {};
            settings[key] = value;
            settings.lastModified = new Date().toISOString();
            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('[Global] Erreur mise à jour:', error);
            return false;
        }
    };

    // Intégration avec le système de navigation existant
    setupNavigationIntegration();

    // Synchronisation périodique avec le système
    setInterval(() => {
        if (window.categoryPage) {
            window.categoryPage.syncWithCategoryManager();
        }
    }, 30000);

    console.log('✅ CategoryPage INTÉGRÉE initialisée et prête');
    console.log('🔗 Intégration parfaite avec le système existant');
    console.log('📂 Fonctions: showSettings(), getCategories(), window.categoryPage');
    console.log('🎯 Catégories:', window.categoryPage?.getCategoryCount() || 0);
    console.log('💾 Backup:', window.backupService ? 'Disponible' : 'Créé');
    
    return window.categoryPage;
}

function setupNavigationIntegration() {
    console.log('[Navigation] 🔗 Configuration intégration navigation...');

    // Écouter TOUS les clics sur la navigation
    document.addEventListener('click', (e) => {
        const target = e.target.closest([
            '[data-page="settings"]',
            '.nav-item[data-page="settings"]',
            '.settings-btn',
            '.nav-settings',
            '[href="#settings"]',
            '.settings-link',
            'a[href*="settings"]',
            '.nav-link[data-page="settings"]'
        ].join(', '));
        
        if (target) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Navigation] 🎯 Clic paramètres intercepté:', target);
            
            // Masquer toutes les autres pages
            document.querySelectorAll('.page-content:not(#settings-page)').forEach(page => {
                page.style.display = 'none';
            });
            
            // Afficher les paramètres
            window.categoryPage?.show();
            
            return false;
        }
    }, true);

    // Écouter les événements de navigation du système
    document.addEventListener('DOMContentLoaded', () => {
        // Intégration avec PageManager si disponible
        if (window.pageManager) {
            console.log('[Navigation] 🔗 Intégration avec PageManager détectée');
            
            // Override de la méthode showPage pour settings
            const originalShowPage = window.pageManager.showPage;
            if (originalShowPage) {
                window.pageManager.showPage = function(pageId) {
                    if (pageId === 'settings') {
                        console.log('[PageManager] 📄 Redirection vers CategoryPage intégrée');
                        window.categoryPage?.show();
                        return;
                    }
                    originalShowPage.call(this, pageId);
                };
            }
        }

        // Observer les changements de navigation
        const navObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList?.contains('active') && 
                        (target.dataset?.page === 'settings' || 
                         target.textContent?.toLowerCase().includes('paramètre') ||
                         target.textContent?.toLowerCase().includes('settings'))) {
                        console.log('[Navigation] 👁️ Navigation settings activée détectée');
                        setTimeout(() => window.categoryPage?.show(), 50);
                    }
                }
            });
        });
        
        navObserver.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class', 'data-page']
        });
    });

    // Écouter les événements personnalisés
    document.addEventListener('showPage', (e) => {
        if (e.detail === 'settings') {
            console.log('[Navigation] 📢 Événement showPage settings');
            window.categoryPage?.show();
        }
    });

    // Écouter les changements de hash
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#settings') {
            console.log('[Navigation] 📍 Hash #settings détecté');
            window.categoryPage?.show();
        }
    });

    // Auto-affichage si hash présent au chargement
    if (window.location.hash === '#settings') {
        setTimeout(() => {
            console.log('[Navigation] 🎯 Hash settings détecté au chargement');
            window.categoryPage?.show();
        }, 1000);
    }

    console.log('[Navigation] ✅ Intégration navigation configurée');
}

// Initialisation immédiate ou différée selon l'état du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategoryPageIntegrated);
} else {
    initializeCategoryPageIntegrated();
}

// Double sécurité
setTimeout(() => {
    if (!window.categoryPage) {
        console.log('[CategoryPage] 🔄 Initialisation de secours...');
        initializeCategoryPageIntegrated();
    }
}, 1000);

// Triple sécurité avec surveillance continue
setInterval(() => {
    if (!window.categoryPage || !window.categoryPage.isInitialized) {
        console.log('[CategoryPage] 🚨 Réinitialisation détectée comme nécessaire...');
        initializeCategoryPageIntegrated();
    }
}, 5000);
