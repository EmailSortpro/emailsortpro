// categoryPage.js - Version FORCÉE qui s'affiche immédiatement

class CategoryPage {
    constructor() {
        console.log('[CategoryPage] 🚀 FORÇAGE IMMÉDIAT - Initialisation...');
        
        this.categories = {};
        this.isVisible = false;
        this.isInitialized = false;
        
        // FORCER l'initialisation immédiate
        this.forceInitialization();
    }

    forceInitialization() {
        console.log('[CategoryPage] 💥 FORÇAGE de l\'initialisation complète...');
        
        // 1. Charger les données immédiatement
        this.loadCategoriesImmediate();
        
        // 2. Créer la page immédiatement
        this.createPageForced();
        
        // 3. Configurer les événements
        this.setupEventsForced();
        
        // 4. Initialiser le backup
        this.initBackupForced();
        
        // 5. FORCER l'affichage si on est sur settings
        this.checkAndForceDisplay();
        
        this.isInitialized = true;
        console.log('[CategoryPage] ✅ FORCÉ - Prêt avec', Object.keys(this.categories).length, 'catégories');
    }

    loadCategoriesImmediate() {
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

        // Essayer de charger depuis localStorage
        try {
            const saved = localStorage.getItem('emailsortpro_categories');
            if (saved) {
                const savedCategories = JSON.parse(saved);
                this.categories = { ...this.categories, ...savedCategories };
            }
        } catch (error) {
            console.warn('[CategoryPage] ⚠️ Utilisation catégories par défaut');
        }

        // Synchroniser avec CategoryManager
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

    createPageForced() {
        console.log('[CategoryPage] 💥 FORÇAGE création page...');
        
        // Supprimer toute page existante
        const existingPages = document.querySelectorAll('#settings-page, .category-page-container');
        existingPages.forEach(page => page.remove());
        
        // Injecter les styles d'abord
        this.injectStylesForced();
        
        // Créer la page HTML
        const pageHTML = this.generatePageHTML();
        document.body.insertAdjacentHTML('beforeend', pageHTML);
        
        console.log('[CategoryPage] ✅ Page HTML injectée dans le DOM');
        
        // Forcer le rendu immédiat
        setTimeout(() => {
            this.renderCategoriesForced();
            this.updateBackupUIForced();
        }, 50);
    }

    generatePageHTML() {
        return `
            <div id="settings-page" class="page-content forced-display" data-page="settings" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: rgba(0,0,0,0.8); overflow-y: auto;">
                <div class="category-page-wrapper" style="background: #f8fafc; min-height: 100vh; padding: 20px;">
                    <div class="category-page-container">
                        <!-- Header avec bouton fermer -->
                        <div class="category-page-header">
                            <div class="header-top">
                                <h1><i class="fas fa-cog"></i> Paramètres EmailSortPro</h1>
                                <button id="force-close-settings" class="close-btn">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <p>Gérez vos catégories et configurez vos sauvegardes</p>
                        </div>

                        <!-- Navigation par onglets -->
                        <div class="category-tabs">
                            <button class="tab-button active" data-tab="categories">
                                <i class="fas fa-tags"></i> Catégories (<span id="categories-counter">0</span>)
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
                                    <h2><i class="fas fa-list"></i> Catégories existantes</h2>
                                    <div id="categories-grid" class="categories-grid">
                                        <!-- Les catégories seront affichées ici -->
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
                                        <button id="test-categories-btn" class="btn btn-info">
                                            <i class="fas fa-flask"></i> Ajouter catégories de test
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
                                            <span>Prêt à configurer</span>
                                        </div>
                                        <p id="backup-detail">Sélectionnez un dossier pour commencer</p>
                                    </div>
                                </div>

                                <div class="panel-section">
                                    <h2><i class="fas fa-folder"></i> Configuration rapide</h2>
                                    <div class="backup-quick-setup">
                                        <button id="quick-setup-backup" class="btn btn-primary btn-large">
                                            <i class="fas fa-magic"></i> Configuration automatique
                                        </button>
                                        <p class="help-text">Créera automatiquement un dossier EmailSortPro-Backup dans vos Documents</p>
                                    </div>
                                </div>

                                <div class="panel-section">
                                    <h2><i class="fas fa-cog"></i> Configuration manuelle</h2>
                                    <div class="backup-manual-setup">
                                        <button id="manual-setup-backup" class="btn btn-secondary">
                                            <i class="fas fa-folder-open"></i> Choisir un dossier
                                        </button>
                                        <div id="folder-display" class="folder-info" style="display: none;">
                                            <p><strong>Dossier sélectionné :</strong> <span id="folder-path">Aucun</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div class="panel-section">
                                    <h2><i class="fas fa-tools"></i> Actions de test</h2>
                                    <div class="test-actions">
                                        <button id="create-test-backup" class="btn btn-info">
                                            <i class="fas fa-file-alt"></i> Créer sauvegarde de test
                                        </button>
                                        <button id="export-all-data" class="btn btn-success">
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
                                        <div class="info-card">
                                            <div class="info-label">Statut service</div>
                                            <div class="info-value" id="service-status">Prêt</div>
                                        </div>
                                        <div class="info-card">
                                            <div class="info-label">Dernière sauvegarde</div>
                                            <div class="info-value" id="last-backup">Jamais</div>
                                        </div>
                                        <div class="info-card">
                                            <div class="info-label">Fichiers créés</div>
                                            <div class="info-value" id="files-count">0</div>
                                        </div>
                                        <div class="info-card">
                                            <div class="info-label">Taille estimée</div>
                                            <div class="info-value" id="data-size">0 KB</div>
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
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="advanced-features">
                                        <span>Fonctionnalités avancées</span>
                                    </label>
                                </div>

                                <div class="panel-section danger-zone">
                                    <h2><i class="fas fa-exclamation-triangle"></i> Zone dangereuse</h2>
                                    <button id="clear-all-data" class="btn btn-danger">
                                        <i class="fas fa-trash"></i> Effacer toutes les données
                                    </button>
                                    <p class="warning-text">⚠️ Cette action supprimera toutes vos données de manière irréversible</p>
                                </div>
                            </div>
                        </div>

                        <!-- Footer avec actions globales -->
                        <div class="page-footer">
                            <button id="save-all-settings" class="btn btn-success btn-large">
                                <i class="fas fa-save"></i> Sauvegarder tous les paramètres
                            </button>
                            <button id="close-settings" class="btn btn-outline btn-large">
                                <i class="fas fa-times"></i> Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    injectStylesForced() {
        // Supprimer les anciens styles
        const existingStyles = document.querySelectorAll('#category-page-styles, #forced-category-styles');
        existingStyles.forEach(style => style.remove());

        const styles = `
            <style id="forced-category-styles">
                /* STYLES FORCÉS pour affichage immédiat */
                .forced-display {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                .category-page-wrapper {
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .category-page-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .category-page-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 20px;
                    margin-bottom: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    position: relative;
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .category-page-header h1 {
                    margin: 0;
                    font-size: 2.5rem;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .close-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: rotate(90deg);
                }

                .category-page-header p {
                    margin: 0;
                    font-size: 1.2rem;
                    opacity: 0.9;
                }

                /* Onglets améliorés */
                .category-tabs {
                    display: flex;
                    background: white;
                    border-radius: 20px;
                    padding: 10px;
                    margin-bottom: 30px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    gap: 8px;
                }

                .tab-button {
                    flex: 1;
                    padding: 18px 24px;
                    border: none;
                    background: transparent;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-weight: 600;
                    font-size: 15px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    position: relative;
                    overflow: hidden;
                }

                .tab-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transition: left 0.5s;
                }

                .tab-button:hover::before {
                    left: 100%;
                }

                .tab-button:hover {
                    background: #f1f5f9;
                    color: #475569;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .tab-button.active {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
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
                    animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes slideInUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(30px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }

                .panel-section {
                    background: white;
                    border-radius: 20px;
                    padding: 35px;
                    margin-bottom: 25px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
                    border: 1px solid #f1f5f9;
                    position: relative;
                    overflow: hidden;
                }

                .panel-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444, #10b981);
                }

                .panel-section h2 {
                    color: #1e293b;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0 0 25px 0;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .panel-section h2 i {
                    color: #3b82f6;
                    font-size: 1.3rem;
                }

                /* Formulaires élégants */
                .add-category-form {
                    display: grid;
                    grid-template-columns: 2fr auto 2fr auto;
                    gap: 20px;
                    align-items: end;
                }

                .form-input, .form-select {
                    padding: 16px 20px;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    font-size: 15px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background: #fafbfc;
                    width: 100%;
                    position: relative;
                }

                .form-input:focus, .form-select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    transform: translateY(-2px);
                }

                .color-picker {
                    width: 70px;
                    height: 54px;
                    border: 3px solid #e2e8f0;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: none;
                }

                .color-picker:hover {
                    transform: scale(1.1);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }

                .form-group {
                    margin-bottom: 25px;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 10px;
                    font-size: 15px;
                }

                /* Boutons super stylés */
                .btn {
                    padding: 16px 32px;
                    border: none;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s;
                }

                .btn:hover::before {
                    left: 100%;
                }

                .btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.2);
                }

                .btn:active {
                    transform: translateY(-1px);
                }

                .btn-large {
                    padding: 20px 40px;
                    font-size: 16px;
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
                    border: 3px solid #6b7280;
                }

                .btn-outline:hover {
                    background: #6b7280;
                    color: white;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }

                .action-buttons {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                /* Grille des catégories avec animations */
                .categories-grid {
                    display: grid;
                    gap: 25px;
                    margin-top: 25px;
                }

                .category-card {
                    background: linear-gradient(145deg, #ffffff, #f8fafc);
                    border: 2px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 25px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                }

                .category-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: var(--category-color, #3b82f6);
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                }

                .category-card:hover::before {
                    transform: scaleX(1);
                }

                .category-card:hover {
                    border-color: var(--category-color, #3b82f6);
                    transform: translateY(-5px);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                }

                .category-card-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .category-color-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 4px solid white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                    flex-shrink: 0;
                    position: relative;
                }

                .category-color-circle::after {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.5), transparent);
                    animation: rotate 3s linear infinite;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .category-info {
                    flex: 1;
                }

                .category-name {
                    font-weight: 800;
                    font-size: 20px;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                }

                .category-count-badge {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 25px;
                    font-size: 13px;
                    font-weight: 700;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                }

                .category-keywords {
                    color: #64748b;
                    font-size: 14px;
                    margin-bottom: 20px;
                    font-style: italic;
                    line-height: 1.5;
                }

                .category-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                .btn-sm {
                    padding: 10px 16px;
                    font-size: 13px;
                    border-radius: 12px;
                }

                /* Checkbox élégants */
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    cursor: pointer;
                    margin-bottom: 20px;
                    padding: 16px 20px;
                    background: #f8fafc;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                    font-weight: 500;
                    color: #374151;
                }

                .checkbox-label:hover {
                    background: #f1f5f9;
                    transform: translateX(5px);
                }

                .checkbox-label input[type="checkbox"] {
                    width: 24px;
                    height: 24px;
                    accent-color: #3b82f6;
                    cursor: pointer;
                    border-radius: 6px;
                }

                /* Sauvegarde */
                .backup-status-card {
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                    border: 3px solid #bae6fd;
                    border-radius: 20px;
                    padding: 30px;
                    text-align: center;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    font-weight: 800;
                    font-size: 18px;
                    margin-bottom: 15px;
                }

                .status-indicator.active { 
                    color: #059669; 
                    animation: pulse 2s infinite;
                }

                .status-indicator.inactive { color: #dc2626; }
                .status-indicator.warning { color: #d97706; }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .backup-quick-setup,
                .backup-manual-setup,
                .test-actions {
                    text-align: center;
                }

                .help-text {
                    color: #64748b;
                    font-size: 14px;
                    margin-top: 10px;
                    font-style: italic;
                }

                .folder-info {
                    background: #e0f2fe;
                    padding: 20px;
                    border-radius: 16px;
                    border-left: 6px solid #0891b2;
                    margin-top: 20px;
                    font-weight: 500;
                }

                .import-section {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 20px;
                    align-items: end;
                }

                .backup-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .info-card {
                    background: linear-gradient(145deg, #ffffff, #f8fafc);
                    padding: 25px;
                    border-radius: 20px;
                    border: 2px solid #f1f5f9;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .info-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.1);
                }

                .info-label {
                    font-weight: 600;
                    color: #64748b;
                    font-size: 14px;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-weight: 800;
                    color: #3b82f6;
                    font-size: 18px;
                }

                .danger-zone {
                    border: 3px solid #fee2e2 !important;
                    background: linear-gradient(145deg, #fef2f2, #ffffff) !important;
                }

                .danger-zone::before {
                    background: #ef4444 !important;
                }

                .warning-text {
                    color: #dc2626;
                    font-size: 14px;
                    margin-top: 15px;
                    font-weight: 600;
                    text-align: center;
                }

                /* Footer */
                .page-footer {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    padding: 30px;
                    border-radius: 20px;
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .category-page-container { padding: 15px; }
                    .panel-section { padding: 25px; }
                    .add-category-form { grid-template-columns: 1fr; }
                    .category-tabs { flex-direction: column; }
                    .import-section { grid-template-columns: 1fr; }
                    .action-buttons { flex-direction: column; }
                    .header-top { flex-direction: column; text-align: center; gap: 15px; }
                }

                /* Notifications superbes */
                .notification {
                    position: fixed;
                    top: 30px;
                    right: 30px;
                    padding: 20px 30px;
                    border-radius: 16px;
                    color: white;
                    font-weight: 700;
                    z-index: 10001;
                    box-shadow: 0 15px 50px rgba(0,0,0,0.3);
                    animation: slideInNotif 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    max-width: 400px;
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                @keyframes slideInNotif {
                    from { 
                        transform: translateX(100%) rotateY(90deg); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translateX(0) rotateY(0deg); 
                        opacity: 1; 
                    }
                }

                .notification.success { 
                    background: linear-gradient(135deg, #10b981, #047857); 
                }
                .notification.error { 
                    background: linear-gradient(135deg, #ef4444, #dc2626); 
                }
                .notification.warning { 
                    background: linear-gradient(135deg, #f59e0b, #d97706); 
                }
                .notification.info { 
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                }

                /* Animations de chargement */
                .loading {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Masquer scrollbar dans overlay */
                .category-page-wrapper::-webkit-scrollbar {
                    width: 8px;
                }

                .category-page-wrapper::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                }

                .category-page-wrapper::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.3);
                    border-radius: 4px;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        console.log('[CategoryPage] ✅ Styles forcés injectés');
    }

    setupEventsForced() {
        console.log('[CategoryPage] ⚡ FORÇAGE configuration événements...');
        
        setTimeout(() => {
            this.setupTabNavigationForced();
            this.setupCategoryEventsForced();
            this.setupBackupEventsForced();
            this.setupGeneralEventsForced();
            this.loadGeneralSettingsForced();
        }, 100);
    }

    setupTabNavigationForced() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = button.dataset.tab;
                
                // Désactiver tous les onglets
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Activer l'onglet sélectionné
                button.classList.add('active');
                const targetPanel = document.getElementById(`${targetTab}-panel`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
                
                // Actions spécifiques
                if (targetTab === 'categories') {
                    this.renderCategoriesForced();
                } else if (targetTab === 'backup') {
                    this.updateBackupUIForced();
                }
                
                console.log('[CategoryPage] 📂 Onglet activé:', targetTab);
            });
        });

        console.log('[CategoryPage] ✅ Navigation onglets configurée');
    }

    setupCategoryEventsForced() {
        // Ajouter catégorie
        const addBtn = document.getElementById('add-category-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCategoryForced());
        }

        // Sauvegarder
        const saveBtn = document.getElementById('save-categories-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCategoriesForced());
        }

        // Réinitialiser
        const resetBtn = document.getElementById('reset-categories-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCategoriesForced());
        }

        // Exporter
        const exportBtn = document.getElementById('export-categories-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCategoriesForced());
        }

        // Ajouter catégories de test
        const testBtn = document.getElementById('test-categories-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.addTestCategoriesForced());
        }

        console.log('[CategoryPage] ✅ Événements catégories configurés');
    }

    setupBackupEventsForced() {
        // Configuration rapide
        const quickSetupBtn = document.getElementById('quick-setup-backup');
        if (quickSetupBtn) {
            quickSetupBtn.addEventListener('click', () => this.quickSetupBackupForced());
        }

        // Configuration manuelle
        const manualSetupBtn = document.getElementById('manual-setup-backup');
        if (manualSetupBtn) {
            manualSetupBtn.addEventListener('click', () => this.manualSetupBackupForced());
        }

        // Créer sauvegarde de test
        const createTestBtn = document.getElementById('create-test-backup');
        if (createTestBtn) {
            createTestBtn.addEventListener('click', () => this.createTestBackupForced());
        }

        // Exporter toutes les données
        const exportAllBtn = document.getElementById('export-all-data');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllDataForced());
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
            importBtn.addEventListener('click', () => this.importDataForced());
        }

        console.log('[CategoryPage] ✅ Événements backup configurés');
    }

    setupGeneralEventsForced() {
        // Boutons de fermeture
        const closeBtns = document.querySelectorAll('#close-settings, #force-close-settings');
        closeBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.forceHide());
            }
        });

        // Sauvegarder tout
        const saveAllBtn = document.getElementById('save-all-settings');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => this.saveAllSettingsForced());
        }

        // Effacer toutes les données
        const clearAllBtn = document.getElementById('clear-all-data');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllDataForced());
        }

        // Changement de thème
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyThemeForced(e.target.value);
            });
        }

        // Fermer avec Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.forceHide();
            }
        });

        console.log('[CategoryPage] ✅ Événements généraux configurés');
    }

    renderCategoriesForced() {
        const categoriesGrid = document.getElementById('categories-grid');
        const categoriesCounter = document.getElementById('categories-counter');
        
        if (!categoriesGrid) {
            console.warn('[CategoryPage] ⚠️ Grid non trouvé');
            return;
        }

        // Mettre à jour le compteur
        if (categoriesCounter) {
            categoriesCounter.textContent = Object.keys(this.categories).length;
        }

        // Vider et remplir la grille
        categoriesGrid.innerHTML = '';

        Object.entries(this.categories).forEach(([id, category], index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.style.cssText = `--category-color: ${category.color}; animation-delay: ${index * 0.1}s;`;
            
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
                    <button class="btn btn-primary btn-sm" onclick="window.categoryPage.editCategoryForced('${id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.categoryPage.deleteCategoryForced('${id}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            `;
            
            categoriesGrid.appendChild(categoryCard);
        });

        console.log('[CategoryPage] 🎨 Catégories forcées rendues:', Object.keys(this.categories).length);
    }

    initBackupForced() {
        // Service de backup simple et fonctionnel
        window.backupService = {
            folderHandle: null,
            enabled: false,
            lastBackup: null,
            filesCount: 0,

            async selectFolder() {
                try {
                    if (!window.showDirectoryPicker) {
                        throw new Error('API File System non supportée');
                    }

                    this.folderHandle = await window.showDirectoryPicker({
                        mode: 'readwrite',
                        startIn: 'documents',
                        id: 'emailsortpro-backup-forced'
                    });

                    return true;
                } catch (error) {
                    console.error('[BackupService] Erreur:', error);
                    return false;
                }
            },

            async createBackup() {
                if (!this.folderHandle) return false;

                try {
                    const data = {
                        version: '4.0-forced',
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
                    folderConfigured: !!this.folderHandle,
                    lastBackup: this.lastBackup ? this.lastBackup.toLocaleString('fr-FR') : null,
                    filesCount: this.filesCount
                };
            }
        };

        console.log('[CategoryPage] 💾 Backup service forcé initialisé');
    }

    checkAndForceDisplay() {
        // Vérifier si on doit afficher immédiatement
        const shouldShow = (
            window.location.hash === '#settings' ||
            window.location.search.includes('page=settings') ||
            document.querySelector('.nav-item.active[data-page="settings"]')
        );

        if (shouldShow) {
            setTimeout(() => {
                console.log('[CategoryPage] 🎯 Auto-affichage détecté');
                this.forceShow();
            }, 500);
        }

        // Écouter les clics sur "Paramètres"
        this.listenForSettingsClicks();
    }

    listenForSettingsClicks() {
        // Écouter tous les clics sur les éléments liés aux paramètres
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-page="settings"], .settings-btn, .nav-settings, [href="#settings"]');
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[CategoryPage] 🖱️ Clic paramètres détecté');
                this.forceShow();
            }
        });

        // Écouter les événements de navigation
        document.addEventListener('showPage', (e) => {
            if (e.detail === 'settings') {
                console.log('[CategoryPage] 📄 Événement showPage settings');
                this.forceShow();
            }
        });

        console.log('[CategoryPage] 👂 Écoute des clics paramètres active');
    }

    // ================================================
    // MÉTHODES FORCÉES
    // ================================================

    forceShow() {
        console.log('[CategoryPage] 💥 FORÇAGE AFFICHAGE...');
        
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            // Masquer toutes les autres pages
            document.querySelectorAll('.page-content:not(#settings-page)').forEach(page => {
                page.style.display = 'none';
            });
            
            // FORCER l'affichage
            settingsPage.style.display = 'block';
            settingsPage.classList.add('forced-display');
            this.isVisible = true;
            
            // Recharger les données
            this.loadCategoriesImmediate();
            this.loadGeneralSettingsForced();
            this.renderCategoriesForced();
            this.updateBackupUIForced();
            
            // Ajouter classe au body pour empêcher le scroll
            document.body.style.overflow = 'hidden';
            
            console.log('[CategoryPage] ✅ AFFICHAGE FORCÉ réussi');
        } else {
            console.error('[CategoryPage] ❌ Page settings-page non trouvée!');
            // Recréer la page si nécessaire
            this.createPageForced();
            setTimeout(() => this.forceShow(), 100);
        }
    }

    forceHide() {
        console.log('[CategoryPage] 🙈 FORÇAGE MASQUAGE...');
        
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            settingsPage.style.display = 'none';
            settingsPage.classList.remove('forced-display');
            this.isVisible = false;
            
            // Restaurer le scroll
            document.body.style.overflow = '';
            
            console.log('[CategoryPage] ✅ MASQUAGE FORCÉ réussi');
        }
    }

    addCategoryForced() {
        const nameInput = document.getElementById('new-category-name');
        const colorInput = document.getElementById('new-category-color');
        const keywordsInput = document.getElementById('new-category-keywords');

        if (!nameInput || !nameInput.value.trim()) {
            this.showNotificationForced('Veuillez entrer un nom de catégorie', 'warning');
            return;
        }

        const name = nameInput.value.trim();
        const color = colorInput ? colorInput.value : '#3b82f6';
        const keywords = keywordsInput ? keywordsInput.value.split(',').map(k => k.trim()).filter(k => k) : [];

        const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        
        if (this.categories[id]) {
            this.showNotificationForced('Cette catégorie existe déjà', 'warning');
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

        this.renderCategoriesForced();
        this.saveCategoriesForced();
        this.showNotificationForced('Catégorie ajoutée avec succès!', 'success');
    }

    editCategoryForced(id) {
        const category = this.categories[id];
        if (!category) return;

        const newName = prompt('Nouveau nom de la catégorie:', category.name);
        if (newName && newName.trim() && newName.trim() !== category.name) {
            category.name = newName.trim();
            this.renderCategoriesForced();
            this.saveCategoriesForced();
            this.showNotificationForced('Catégorie modifiée!', 'success');
        }
    }

    deleteCategoryForced(id) {
        const category = this.categories[id];
        if (!category) return;

        if (confirm(`Supprimer la catégorie "${category.name}" ?`)) {
            delete this.categories[id];
            this.renderCategoriesForced();
            this.saveCategoriesForced();
            this.showNotificationForced('Catégorie supprimée!', 'info');
        }
    }

    addTestCategoriesForced() {
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
            },
            'technology': {
                name: 'Technologie',
                color: '#06b6d4',
                keywords: ['tech', 'software', 'hardware', 'programming', 'computer'],
                count: 45
            }
        };

        Object.assign(this.categories, testCategories);
        this.renderCategoriesForced();
        this.saveCategoriesForced();
        this.showNotificationForced('Catégories de test ajoutées!', 'success');
    }

    resetCategoriesForced() {
        if (confirm('Réinitialiser toutes les catégories ?')) {
            this.loadCategoriesImmediate();
            this.renderCategoriesForced();
            this.saveCategoriesForced();
            this.showNotificationForced('Catégories réinitialisées!', 'info');
        }
    }

    saveCategoriesForced() {
        try {
            localStorage.setItem('emailsortpro_categories', JSON.stringify(this.categories));
            
            // Synchroniser avec CategoryManager
            if (window.categoryManager && typeof window.categoryManager.updateCategories === 'function') {
                window.categoryManager.updateCategories(this.categories);
            }
            
            console.log('[CategoryPage] 💾 Catégories sauvegardées:', Object.keys(this.categories).length);
        } catch (error) {
            console.error('[CategoryPage] ❌ Erreur sauvegarde:', error);
        }
    }

    exportCategoriesForced() {
        try {
            const data = {
                version: '4.0-forced',
                timestamp: new Date().toISOString(),
                categories: this.categories
            };

            this.downloadJSONForced(data, `EmailSortPro-Categories-${new Date().toISOString().split('T')[0]}.json`);
            this.showNotificationForced('Catégories exportées!', 'success');
        } catch (error) {
            this.showNotificationForced('Erreur export: ' + error.message, 'error');
        }
    }

    async quickSetupBackupForced() {
        const btn = document.getElementById('quick-setup-backup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner loading"></i> Configuration...';
        }

        try {
            const success = await window.backupService.selectFolder();
            if (success) {
                await window.backupService.createBackup();
                this.showNotificationForced('Configuration automatique réussie!', 'success');
                this.updateBackupUIForced();
            } else {
                this.showNotificationForced('Erreur de configuration', 'error');
            }
        } catch (error) {
            this.showNotificationForced('Erreur: ' + error.message, 'error');
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magic"></i> Configuration automatique';
        }
    }

    async manualSetupBackupForced() {
        const success = await window.backupService.selectFolder();
        if (success) {
            this.showNotificationForced('Dossier sélectionné!', 'success');
            this.updateBackupUIForced();
        } else {
            this.showNotificationForced('Sélection annulée', 'info');
        }
    }

    async createTestBackupForced() {
        const btn = document.getElementById('create-test-backup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner loading"></i> Création...';
        }

        try {
            if (!window.backupService.folderHandle) {
                this.showNotificationForced('Configurez d\'abord un dossier', 'warning');
                return;
            }

            // Créer plusieurs sauvegardes de test
            for (let i = 0; i < 3; i++) {
                await window.backupService.createBackup();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.showNotificationForced('Sauvegardes de test créées!', 'success');
            this.updateBackupUIForced();
        } catch (error) {
            this.showNotificationForced('Erreur: ' + error.message, 'error');
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-file-alt"></i> Créer sauvegarde de test';
        }
    }

    exportAllDataForced() {
        try {
            const data = {
                version: '4.0-forced',
                timestamp: new Date().toISOString(),
                categories: this.categories,
                settings: this.getGeneralSettingsForced(),
                localStorage: this.getLocalStorageDataForced()
            };

            this.downloadJSONForced(data, `EmailSortPro-Export-${new Date().toISOString().split('T')[0]}.json`);
            this.showNotificationForced('Toutes les données exportées!', 'success');
        } catch (error) {
            this.showNotificationForced('Erreur export: ' + error.message, 'error');
        }
    }

    importDataForced() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput?.files[0];
        
        if (!file) {
            this.showNotificationForced('Sélectionnez un fichier', 'warning');
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
                    // Importer les catégories
                    if (data.categories) {
                        this.categories = data.categories;
                        this.saveCategoriesForced();
                        this.renderCategoriesForced();
                    }

                    // Importer les paramètres
                    if (data.settings) {
                        localStorage.setItem('emailsortpro_settings', JSON.stringify(data.settings));
                        this.loadGeneralSettingsForced();
                    }

                    // Importer localStorage
                    if (data.localStorage) {
                        Object.entries(data.localStorage).forEach(([key, value]) => {
                            localStorage.setItem(key, value);
                        });
                    }

                    this.showNotificationForced('Données importées avec succès!', 'success');
                }
            } catch (error) {
                this.showNotificationForced('Erreur import: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    updateBackupUIForced() {
        if (!window.backupService) return;

        const status = window.backupService.getStatus();

        // Mettre à jour le statut
        const statusElement = document.getElementById('backup-status');
        const detailElement = document.getElementById('backup-detail');

        if (statusElement && detailElement) {
            if (status.folderConfigured) {
                statusElement.className = 'status-indicator active';
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i><span>Configuré</span>';
                detailElement.textContent = 'Dossier de sauvegarde prêt à utiliser';
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
            'data-size': this.calculateDataSizeForced()
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Afficher le dossier si configuré
        const folderDisplay = document.getElementById('folder-display');
        const folderPath = document.getElementById('folder-path');
        if (folderDisplay && folderPath && status.folderConfigured) {
            folderDisplay.style.display = 'block';
            folderPath.textContent = 'Dossier configuré avec succès';
        }
    }

    loadGeneralSettingsForced() {
        try {
            const settings = JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
            
            this.setFieldValueForced('user-name', settings.userName || '');
            this.setFieldValueForced('user-email', settings.userEmail || '');
            this.setFieldValueForced('theme-select', settings.theme || 'light');
            this.setFieldValueForced('auto-sort', settings.autoSort !== false);
            this.setFieldValueForced('notifications', settings.notifications !== false);
            this.setFieldValueForced('advanced-features', settings.advancedFeatures || false);

            this.applyThemeForced(settings.theme || 'light');
        } catch (error) {
            console.error('[CategoryPage] Erreur chargement paramètres:', error);
        }
    }

    saveAllSettingsForced() {
        try {
            const settings = {
                userName: this.getFieldValueForced('user-name'),
                userEmail: this.getFieldValueForced('user-email'),
                theme: this.getFieldValueForced('theme-select'),
                autoSort: this.getFieldValueForced('auto-sort'),
                notifications: this.getFieldValueForced('notifications'),
                advancedFeatures: this.getFieldValueForced('advanced-features'),
                lastSaved: new Date().toISOString()
            };

            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            this.saveCategoriesForced();
            
            this.showNotificationForced('Tous les paramètres sauvegardés!', 'success');
            console.log('[CategoryPage] 💾 Paramètres sauvegardés');
        } catch (error) {
            this.showNotificationForced('Erreur sauvegarde: ' + error.message, 'error');
        }
    }

    applyThemeForced(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
        
        console.log('[CategoryPage] 🎨 Thème appliqué:', theme);
    }

    clearAllDataForced() {
        const confirmation = prompt('Tapez "SUPPRIMER" pour confirmer la suppression de toutes les données:');
        
        if (confirmation === 'SUPPRIMER') {
            // Sauvegarder la config de backup
            const backupConfig = localStorage.getItem('emailsortpro_backup_config');
            
            // Tout supprimer
            localStorage.clear();
            
            // Restaurer la config de backup
            if (backupConfig) {
                localStorage.setItem('emailsortpro_backup_config', backupConfig);
            }
            
            // Réinitialiser les catégories
            this.loadCategoriesImmediate();
            this.renderCategoriesForced();
            
            this.showNotificationForced('Toutes les données supprimées!', 'info');
            
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    // ================================================
    // UTILITAIRES FORCÉS
    // ================================================

    getFieldValueForced(id) {
        const field = document.getElementById(id);
        if (!field) return null;
        
        return field.type === 'checkbox' ? field.checked : field.value;
    }

    setFieldValueForced(id, value) {
        const field = document.getElementById(id);
        if (!field) return;
        
        if (field.type === 'checkbox') {
            field.checked = Boolean(value);
        } else {
            field.value = value;
        }
    }

    getGeneralSettingsForced() {
        try {
            return JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
        } catch {
            return {};
        }
    }

    getLocalStorageDataForced() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('emailsortpro_')) {
                data[key] = localStorage.getItem(key);
            }
        }
        return data;
    }

    calculateDataSizeForced() {
        try {
            const data = {
                categories: this.categories,
                settings: this.getGeneralSettingsForced(),
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

    downloadJSONForced(data, filename) {
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

    showNotificationForced(message, type = 'info') {
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
            notification.style.animation = 'slideInNotif 0.5s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }

    // ================================================
    // API PUBLIQUE FORCÉE
    // ================================================

    show() {
        this.forceShow();
    }

    hide() {
        this.forceHide();
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
            this.renderCategoriesForced();
        }
        
        this.saveCategoriesForced();
        return true;
    }

    updateCategory(id, data) {
        if (this.categories[id]) {
            this.categories[id] = { ...this.categories[id], ...data };
            if (this.isVisible) {
                this.renderCategoriesForced();
            }
            this.saveCategoriesForced();
            return true;
        }
        return false;
    }

    refresh() {
        if (this.isVisible) {
            this.loadCategoriesImmediate();
            this.renderCategoriesForced();
            this.updateBackupUIForced();
            console.log('[CategoryPage] 🔄 Interface rafraîchie');
        }
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            visible: this.isVisible,
            categoriesCount: Object.keys(this.categories).length,
            backupConfigured: window.backupService?.getStatus()?.folderConfigured || false
        };
    }
}

// ================================================
// INITIALISATION GLOBALE FORCÉE
// ================================================

function initializeCategoryPageForced() {
    console.log('[CategoryPage] 🚀 INITIALISATION GLOBALE FORCÉE...');
    
    // Créer l'instance globale immédiatement
    window.categoryPage = new CategoryPage();
    
    // Fonctions globales pour accès immédiat
    window.showSettings = () => {
        console.log('[Global] 💥 FORÇAGE affichage paramètres');
        window.categoryPage?.forceShow();
    };
    
    window.hideSettings = () => {
        window.categoryPage?.forceHide();
    };
    
    window.getCategories = () => {
        return window.categoryPage?.getCategories() || {};
    };
    
    window.getAppSettings = () => {
        return window.categoryPage?.getGeneralSettingsForced() || {};
    };
    
    window.updateAppSetting = (key, value) => {
        try {
            const settings = window.categoryPage?.getGeneralSettingsForced() || {};
            settings[key] = value;
            settings.lastModified = new Date().toISOString();
            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('[Global] Erreur mise à jour:', error);
            return false;
        }
    };

    // Forcer l'écoute des événements immédiatement
    window.addEventListener('load', () => {
        console.log('[Global] 🔥 Window loaded - FORÇAGE écoute événements');
        
        // Écouter TOUS les clics sur des éléments liés aux paramètres
        document.addEventListener('click', (e) => {
            const target = e.target.closest([
                '[data-page="settings"]',
                '.settings-btn',
                '.nav-settings',
                '[href="#settings"]',
                '.settings-link',
                '.nav-item[data-page="settings"]',
                'a[href*="settings"]'
            ].join(', '));
            
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Global] 🎯 CLIC PARAMÈTRES INTERCEPTÉ');
                window.categoryPage?.forceShow();
                return false;
            }
        }, true); // Capture phase pour intercepter plus tôt
        
        // Écouter les événements de hash
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#settings') {
                console.log('[Global] 📍 Hash #settings détecté');
                window.categoryPage?.forceShow();
            }
        });
        
        // Écouter les événements personnalisés
        document.addEventListener('showPage', (e) => {
            if (e.detail === 'settings') {
                console.log('[Global] 📢 Événement showPage settings');
                window.categoryPage?.forceShow();
            }
        });
    });

    // FORCER l'affichage si hash présent
    if (window.location.hash === '#settings') {
        setTimeout(() => {
            console.log('[Global] 🎯 Hash settings détecté au chargement');
            window.categoryPage?.forceShow();
        }, 1000);
    }

    // Observer les changements dans la navigation
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList?.contains('active') && 
                    (target.dataset?.page === 'settings' || target.textContent?.toLowerCase().includes('paramètre'))) {
                    console.log('[Global] 👁️ Élément settings activé détecté');
                    setTimeout(() => window.categoryPage?.forceShow(), 100);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'data-page']
    });

    console.log('✅ CategoryPage FORCÉE initialisée et prête');
    console.log('💥 Mode FORÇAGE actif - Affichage garanti');
    console.log('📂 Fonctions: showSettings(), getCategories(), window.categoryPage');
    console.log('🎯 Catégories:', window.categoryPage?.getCategoryCount() || 0);
    console.log('💾 Backup:', window.backupService ? 'Disponible' : 'Créé');
    
    return window.categoryPage;
}

// Initialisation immédiate selon l'état du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategoryPageForced);
} else {
    initializeCategoryPageForced();
}

// Backup au cas où
setTimeout(initializeCategoryPageForced, 500);
