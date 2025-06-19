// categoryPage.js - Page paramètres intégrée avec système de backup

class CategoryPage {
    constructor() {
        this.initPage();
    }

    initPage() {
        this.createSettingsPage();
        this.attachEventListeners();
    }

    createSettingsPage() {
        const settingsHTML = `
            <div id="settings-page" class="page-content" data-page="settings" style="display: none;">
                <div class="settings-container">
                    <div class="settings-header">
                        <h2><i class="fas fa-cog"></i> Paramètres</h2>
                        <p class="settings-subtitle">Configurez votre application EmailSortPro</p>
                    </div>

                    <!-- Section Général -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <i class="fas fa-user"></i> Général
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
                                <label>
                                    <input type="checkbox" id="auto-sort" checked>
                                    Tri automatique des emails
                                </label>
                                <p class="setting-description">
                                    Trier automatiquement les nouveaux emails selon vos catégories
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Section Apparence -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <i class="fas fa-palette"></i> Apparence
                        </h3>
                        <div class="settings-content">
                            <div class="setting-item">
                                <label for="theme-select">Thème :</label>
                                <select id="theme-select" class="form-control">
                                    <option value="light">Clair</option>
                                    <option value="dark">Sombre</option>
                                    <option value="auto">Automatique</option>
                                </select>
                            </div>
                            
                            <div class="setting-item">
                                <label for="language-select">Langue :</label>
                                <select id="language-select" class="form-control">
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                </select>
                            </div>
                            
                            <div class="setting-item">
                                <label for="font-size">Taille de police :</label>
                                <input type="range" id="font-size" min="12" max="20" value="14" class="form-range">
                                <span id="font-size-value">14px</span>
                            </div>
                        </div>
                    </div>

                    <!-- Section Notifications -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <i class="fas fa-bell"></i> Notifications
                        </h3>
                        <div class="settings-content">
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" id="notifications-enabled" checked>
                                    Activer les notifications
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" id="sound-notifications">
                                    Notifications sonores
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" id="email-notifications">
                                    Notifications par email
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Section Catégories -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <i class="fas fa-tags"></i> Catégories
                        </h3>
                        <div class="settings-content">
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" id="auto-create-categories">
                                    Création automatique de catégories
                                </label>
                                <p class="setting-description">
                                    Créer automatiquement des catégories basées sur l'analyse des emails
                                </p>
                            </div>
                            
                            <div class="setting-item">
                                <label for="max-categories">Nombre maximum de catégories :</label>
                                <input type="number" id="max-categories" min="5" max="50" value="20" class="form-control">
                            </div>
                            
                            <div class="setting-item">
                                <button id="reset-categories-btn" class="btn btn-warning">
                                    <i class="fas fa-undo"></i> Réinitialiser les catégories
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Section de backup - sera ajoutée par le service de backup -->
                    <!-- La section backup sera automatiquement ajoutée ici par backup.js -->

                    <!-- Section Confidentialité -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <i class="fas fa-shield-alt"></i> Confidentialité et sécurité
                        </h3>
                        <div class="settings-content">
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" id="analytics-enabled">
                                    Autoriser les données d'utilisation anonymes
                                </label>
                                <p class="setting-description">
                                    Nous aide à améliorer l'application sans collecter d'informations personnelles
                                </p>
                            </div>
                            
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" id="auto-logout">
                                    Déconnexion automatique après inactivité
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <button id="clear-data-btn" class="btn btn-danger">
                                    <i class="fas fa-trash"></i> Effacer toutes les données
                                </button>
                                <p class="setting-description">
                                    ⚠️ Cette action est irréversible
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Section Import/Export -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <i class="fas fa-exchange-alt"></i> Import/Export
                        </h3>
                        <div class="settings-content">
                            <div class="setting-item">
                                <button id="export-data-btn" class="btn btn-primary">
                                    <i class="fas fa-download"></i> Exporter mes données
                                </button>
                                <p class="setting-description">
                                    Télécharger toutes vos données au format JSON
                                </p>
                            </div>
                            
                            <div class="setting-item">
                                <label for="import-file">Importer des données :</label>
                                <input type="file" id="import-file" accept=".json" class="form-control">
                                <button id="import-data-btn" class="btn btn-secondary" disabled>
                                    <i class="fas fa-upload"></i> Importer
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Section À propos -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <i class="fas fa-info-circle"></i> À propos
                        </h3>
                        <div class="settings-content">
                            <div class="about-info">
                                <h4>EmailSortPro</h4>
                                <p><strong>Version :</strong> 4.0.0</p>
                                <p><strong>Dernière mise à jour :</strong> <span id="last-update">Juin 2025</span></p>
                                <p><strong>Développé par :</strong> Votre équipe</p>
                                
                                <div class="links">
                                    <a href="#" class="link-btn">
                                        <i class="fas fa-question-circle"></i> Aide
                                    </a>
                                    <a href="#" class="link-btn">
                                        <i class="fas fa-bug"></i> Signaler un bug
                                    </a>
                                    <a href="#" class="link-btn">
                                        <i class="fas fa-heart"></i> Donner son avis
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Boutons de sauvegarde -->
                    <div class="settings-footer">
                        <button id="save-settings-btn" class="btn btn-success">
                            <i class="fas fa-save"></i> Sauvegarder les paramètres
                        </button>
                        <button id="reset-settings-btn" class="btn btn-outline-secondary">
                            <i class="fas fa-undo"></i> Réinitialiser
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter la page au DOM si elle n'existe pas
        if (!document.getElementById('settings-page')) {
            document.body.insertAdjacentHTML('beforeend', settingsHTML);
        }

        // Ajouter les styles CSS
        this.addSettingsStyles();
    }

    addSettingsStyles() {
        if (document.getElementById('settings-styles')) return;

        const styles = `
            <style id="settings-styles">
                .settings-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .settings-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #e9ecef;
                }

                .settings-header h2 {
                    color: #333;
                    margin-bottom: 10px;
                    font-size: 2.5rem;
                }

                .settings-subtitle {
                    color: #666;
                    font-size: 1.1rem;
                }

                .settings-section {
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    border: 1px solid #e9ecef;
                }

                .settings-section-title {
                    color: #495057;
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #dee2e6;
                }

                .settings-section-title i {
                    margin-right: 10px;
                    color: #6366f1;
                }

                .settings-content {
                    padding-top: 10px;
                }

                .setting-item {
                    margin-bottom: 20px;
                    padding: 15px 0;
                    border-bottom: 1px solid #f8f9fa;
                }

                .setting-item:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }

                .setting-item label {
                    display: block;
                    font-weight: 500;
                    color: #495057;
                    margin-bottom: 8px;
                }

                .setting-item label input[type="checkbox"] {
                    margin-right: 8px;
                }

                .form-control {
                    width: 100%;
                    padding: 10px 15px;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }

                .form-control:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .form-range {
                    width: 100%;
                    margin: 10px 0;
                }

                .setting-description {
                    font-size: 0.9rem;
                    color: #6c757d;
                    margin-top: 5px;
                    font-style: italic;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    font-size: 14px;
                }

                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn-success {
                    background: linear-gradient(135deg, #10b981, #059669);
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

                .btn-outline-secondary {
                    background: transparent;
                    color: #6c757d;
                    border: 1px solid #6c757d;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }

                .about-info h4 {
                    color: #333;
                    margin-bottom: 15px;
                }

                .about-info p {
                    margin-bottom: 8px;
                    color: #495057;
                }

                .links {
                    margin-top: 20px;
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .link-btn {
                    padding: 8px 16px;
                    background: #f8f9fa;
                    color: #495057;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    border: 1px solid #dee2e6;
                    transition: all 0.2s ease;
                }

                .link-btn:hover {
                    background: #e9ecef;
                    color: #333;
                    transform: translateY(-1px);
                }

                .settings-footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 30px;
                    border-top: 2px solid #e9ecef;
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                /* Styles pour les sections de backup */
                .backup-status {
                    padding: 10px 15px;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    margin: 10px 0;
                }

                .status-active {
                    background: #d1fae5;
                    color: #065f46;
                    border: 1px solid #10b981;
                }

                .status-browser {
                    background: #dbeafe;
                    color: #1e40af;
                    border: 1px solid #3b82f6;
                }

                .backup-status-text {
                    font-size: 0.9rem;
                    color: #6c757d;
                    margin-left: 10px;
                }

                .backup-details {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    margin-top: 10px;
                }

                .backup-details p {
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .settings-container {
                        padding: 15px;
                    }
                    
                    .settings-section {
                        padding: 20px;
                    }
                    
                    .settings-footer {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .links {
                        justify-content: center;
                    }
                }

                /* Animation pour l'affichage */
                .settings-section {
                    animation: slideInUp 0.5s ease forwards;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    attachEventListeners() {
        // Attendre que la page soit créée
        setTimeout(() => {
            this.setupFormHandlers();
            this.setupFileHandlers();
            this.setupResetHandlers();
            this.loadSettings();
        }, 100);
    }

    setupFormHandlers() {
        // Sauvegarde des paramètres
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Réinitialisation
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }

        // Taille de police en temps réel
        const fontSizeRange = document.getElementById('font-size');
        const fontSizeValue = document.getElementById('font-size-value');
        if (fontSizeRange && fontSizeValue) {
            fontSizeRange.addEventListener('input', (e) => {
                fontSizeValue.textContent = e.target.value + 'px';
                document.documentElement.style.fontSize = e.target.value + 'px';
            });
        }

        // Changement de thème
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }

        // Auto-sauvegarde sur les changements
        const formElements = document.querySelectorAll('#settings-page input, #settings-page select');
        formElements.forEach(element => {
            element.addEventListener('change', () => {
                this.autoSave();
            });
        });
    }

    setupFileHandlers() {
        // Export des données
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Import des données
        const importFile = document.getElementById('import-file');
        const importBtn = document.getElementById('import-data-btn');
        
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

    setupResetHandlers() {
        // Réinitialiser les catégories
        const resetCategoriesBtn = document.getElementById('reset-categories-btn');
        if (resetCategoriesBtn) {
            resetCategoriesBtn.addEventListener('click', () => this.resetCategories());
        }

        // Effacer toutes les données
        const clearDataBtn = document.getElementById('clear-data-btn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
            
            // Charger les valeurs dans les champs
            this.setFieldValue('user-name', settings.userName || '');
            this.setFieldValue('user-email', settings.userEmail || '');
            this.setFieldValue('auto-sort', settings.autoSort !== false);
            this.setFieldValue('theme-select', settings.theme || 'light');
            this.setFieldValue('language-select', settings.language || 'fr');
            this.setFieldValue('font-size', settings.fontSize || 14);
            this.setFieldValue('notifications-enabled', settings.notifications !== false);
            this.setFieldValue('sound-notifications', settings.soundNotifications || false);
            this.setFieldValue('email-notifications', settings.emailNotifications || false);
            this.setFieldValue('auto-create-categories', settings.autoCreateCategories || false);
            this.setFieldValue('max-categories', settings.maxCategories || 20);
            this.setFieldValue('analytics-enabled', settings.analytics || false);
            this.setFieldValue('auto-logout', settings.autoLogout || false);

            // Appliquer le thème
            this.applyTheme(settings.theme || 'light');
            
            // Mettre à jour l'affichage de la taille de police
            const fontSizeValue = document.getElementById('font-size-value');
            if (fontSizeValue) {
                fontSizeValue.textContent = (settings.fontSize || 14) + 'px';
            }

            console.log('[Settings] Paramètres chargés');
            
        } catch (error) {
            console.error('[Settings] Erreur chargement paramètres:', error);
        }
    }

    saveSettings() {
        try {
            const settings = {
                userName: this.getFieldValue('user-name'),
                userEmail: this.getFieldValue('user-email'),
                autoSort: this.getFieldValue('auto-sort'),
                theme: this.getFieldValue('theme-select'),
                language: this.getFieldValue('language-select'),
                fontSize: parseInt(this.getFieldValue('font-size')),
                notifications: this.getFieldValue('notifications-enabled'),
                soundNotifications: this.getFieldValue('sound-notifications'),
                emailNotifications: this.getFieldValue('email-notifications'),
                autoCreateCategories: this.getFieldValue('auto-create-categories'),
                maxCategories: parseInt(this.getFieldValue('max-categories')),
                analytics: this.getFieldValue('analytics-enabled'),
                autoLogout: this.getFieldValue('auto-logout'),
                lastSaved: new Date().toISOString()
            };

            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            
            // Déclencher un événement pour notifier les autres composants
            document.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
            
            this.showNotification('Paramètres sauvegardés avec succès!', 'success');
            console.log('[Settings] Paramètres sauvegardés:', settings);
            
        } catch (error) {
            console.error('[Settings] Erreur sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde des paramètres', 'error');
        }
    }

    autoSave() {
        // Sauvegarde automatique avec un délai pour éviter trop d'appels
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveSettings();
        }, 1000);
    }

    resetSettings() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
            localStorage.removeItem('emailsortpro_settings');
            this.loadSettings();
            this.showNotification('Paramètres réinitialisés', 'info');
        }
    }

    // ================================================
    // GESTION DES THÈMES
    // ================================================
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
        
        console.log(`[Settings] Thème appliqué: ${theme}`);
    }

    // ================================================
    // IMPORT/EXPORT
    // ================================================
    
    exportData() {
        try {
            const data = {
                version: '4.0',
                timestamp: new Date().toISOString(),
                settings: JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}'),
                categories: this.getCategoriesData(),
                tasks: this.getTasksData(),
                preferences: this.getPreferencesData()
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

            this.showNotification('Données exportées avec succès!', 'success');
            
        } catch (error) {
            console.error('[Settings] Erreur export:', error);
            this.showNotification('Erreur lors de l\'exportation', 'error');
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
                
                if (!data.version || !data.settings) {
                    throw new Error('Format de fichier invalide');
                }

                if (confirm('Êtes-vous sûr de vouloir importer ces données ? Cela remplacera vos paramètres actuels.')) {
                    // Importer les paramètres
                    if (data.settings) {
                        localStorage.setItem('emailsortpro_settings', JSON.stringify(data.settings));
                    }

                    // Importer les autres données si disponibles
                    if (data.categories && window.categoryManager) {
                        this.importCategories(data.categories);
                    }

                    if (data.tasks && window.taskManager) {
                        this.importTasks(data.tasks);
                    }

                    // Recharger la page pour appliquer les changements
                    this.loadSettings();
                    
                    this.showNotification('Données importées avec succès!', 'success');
                }
                
            } catch (error) {
                console.error('[Settings] Erreur import:', error);
                this.showNotification('Erreur lors de l\'importation: fichier invalide', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    // ================================================
    // ACTIONS SPÉCIFIQUES
    // ================================================
    
    resetCategories() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les catégories ? Cette action est irréversible.')) {
            if (window.categoryManager && typeof window.categoryManager.resetCategories === 'function') {
                window.categoryManager.resetCategories();
                this.showNotification('Catégories réinitialisées', 'info');
            } else {
                // Fallback: supprimer des localStorage
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes('category')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                this.showNotification('Catégories réinitialisées', 'info');
            }
        }
    }

    clearAllData() {
        const confirmation = prompt(
            'ATTENTION: Cette action supprimera TOUTES vos données.\n' +
            'Tapez "SUPPRIMER" pour confirmer:'
        );
        
        if (confirmation === 'SUPPRIMER') {
            // Sauvegarder les clés importantes à ne pas supprimer
            const keepKeys = ['emailsortpro_backup_config'];
            const savedData = {};
            keepKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) savedData[key] = value;
            });

            // Tout supprimer
            localStorage.clear();
            
            // Restaurer les clés importantes
            Object.entries(savedData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });

            this.showNotification('Toutes les données ont été supprimées', 'info');
            
            // Recharger la page après un délai
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
        
        if (field.type === 'checkbox') {
            return field.checked;
        }
        return field.value;
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

    getCategoriesData() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getCategories === 'function') {
                return window.categoryManager.getCategories();
            }
            return {};
        } catch (error) {
            return {};
        }
    }

    getTasksData() {
        try {
            if (window.taskManager && typeof window.taskManager.getAllTasks === 'function') {
                return window.taskManager.getAllTasks();
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    getPreferencesData() {
        const preferences = {};
        const prefKeys = ['theme', 'language', 'notifications', 'autoSort'];
        
        prefKeys.forEach(key => {
            const fullKey = `emailsortpro_pref_${key}`;
            const value = localStorage.getItem(fullKey);
            if (value) {
                try {
                    preferences[key] = JSON.parse(value);
                } catch {
                    preferences[key] = value;
                }
            }
        });
        
        return preferences;
    }

    importCategories(categories) {
        if (window.categoryManager && typeof window.categoryManager.importCategories === 'function') {
            window.categoryManager.importCategories(categories);
        }
    }

    importTasks(tasks) {
        if (window.taskManager && typeof window.taskManager.importTasks === 'function') {
            window.taskManager.importTasks(tasks);
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[Settings] ${type.toUpperCase()}: ${message}`);
        
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            // Fallback simple
            alert(message);
        }
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
            
            // Afficher la page paramètres
            settingsPage.style.display = 'block';
            
            // Recharger les paramètres
            this.loadSettings();
            
            console.log('[Settings] Page paramètres affichée');
        }
    }

    hide() {
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            settingsPage.style.display = 'none';
        }
    }

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
        } catch {
            return {};
        }
    }

    updateSetting(key, value) {
        try {
            const settings = this.getSettings();
            settings[key] = value;
            settings.lastModified = new Date().toISOString();
            
            localStorage.setItem('emailsortpro_settings', JSON.stringify(settings));
            
            // Déclencher l'événement de changement
            document.dispatchEvent(new CustomEvent('settingsChanged', { 
                detail: { key, value, settings } 
            }));
            
            return true;
        } catch (error) {
            console.error('[Settings] Erreur mise à jour:', error);
            return false;
        }
    }
}

// ================================================
// INITIALISATION
// ================================================

// Créer l'instance globale
window.categoryPage = new CategoryPage();

// Fonctions globales pour l'intégration
window.showSettings = () => window.categoryPage?.show();
window.hideSettings = () => window.categoryPage?.hide();
window.getAppSettings = () => window.categoryPage?.getSettings();
window.updateAppSetting = (key, value) => window.categoryPage?.updateSetting(key, value);

// Écouter les événements d'affichage des pages
document.addEventListener('showPage', (e) => {
    if (e.detail === 'settings') {
        window.categoryPage?.show();
    }
});

console.log('✅ Page paramètres chargée avec intégration backup');
console.log('⚙️ Fonctions disponibles: showSettings(), hideSettings(), getAppSettings()');
console.log('🔧 La section backup sera automatiquement ajoutée par backup.js');
