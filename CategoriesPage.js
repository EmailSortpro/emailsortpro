// categoryPage.js - Page paramètres avec système de backup simplifié et fonctionnel

class CategoryPage {
    constructor() {
        this.backupService = null;
        this.initPage();
        this.initBackupService();
    }

    initPage() {
        this.createSettingsPage();
        this.attachEventListeners();
    }

    initBackupService() {
        this.backupService = new SimpleBackupService();
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

                    <!-- Section Sauvegarde Simplifiée -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <i class="fas fa-save"></i> Sauvegarde
                        </h3>
                        <div class="settings-content">
                            <!-- Statut de la sauvegarde -->
                            <div class="setting-item">
                                <div class="backup-status-display">
                                    <div class="status-indicator">
                                        <i class="fas fa-circle" id="backup-status-icon"></i>
                                        <span id="backup-status-text">Non configuré</span>
                                    </div>
                                    <p id="backup-status-detail">Configurez un dossier de sauvegarde pour protéger vos données</p>
                                </div>
                            </div>

                            <!-- Configuration du dossier -->
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" id="backup-enabled">
                                    Activer les sauvegardes automatiques
                                </label>
                            </div>

                            <div class="setting-item">
                                <button id="select-backup-folder-btn" class="btn btn-primary">
                                    <i class="fas fa-folder-open"></i> Choisir le dossier de sauvegarde
                                </button>
                                <p class="setting-description">
                                    Sélectionnez un dossier sur votre ordinateur pour sauvegarder vos données
                                </p>
                                <div id="backup-folder-display" style="display: none;">
                                    <p class="folder-path"><strong>Dossier :</strong> <span id="backup-folder-path">Aucun</span></p>
                                </div>
                            </div>

                            <!-- Fréquence de sauvegarde -->
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
                                    <button id="manual-backup-btn" class="btn btn-success" disabled>
                                        <i class="fas fa-save"></i> Sauvegarder maintenant
                                    </button>
                                    <button id="export-backup-btn" class="btn btn-secondary">
                                        <i class="fas fa-download"></i> Exporter vers fichier
                                    </button>
                                </div>
                            </div>

                            <!-- Import/Restauration -->
                            <div class="setting-item">
                                <label for="import-backup-file">Restaurer depuis une sauvegarde :</label>
                                <input type="file" id="import-backup-file" accept=".json" class="form-control">
                                <button id="import-backup-btn" class="btn btn-info" disabled>
                                    <i class="fas fa-upload"></i> Restaurer les données
                                </button>
                                <p class="setting-description">
                                    Sélectionnez un fichier de sauvegarde (.json) pour restaurer vos données
                                </p>
                            </div>

                            <!-- Informations -->
                            <div class="setting-item">
                                <div class="backup-info">
                                    <h5>Informations de sauvegarde :</h5>
                                    <p><strong>Dernière sauvegarde :</strong> <span id="last-backup-time">Jamais</span></p>
                                    <p><strong>Nombre de fichiers :</strong> <span id="backup-files-count">0</span></p>
                                    <p><strong>Taille estimée :</strong> <span id="backup-size">0 KB</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

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

                .btn-info {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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

                /* Styles spécifiques pour la sauvegarde */
                .backup-status-display {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 16px;
                    border: 1px solid #e9ecef;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .status-indicator i {
                    font-size: 16px;
                }

                .status-indicator.active i {
                    color: #10b981;
                }

                .status-indicator.inactive i {
                    color: #ef4444;
                }

                .status-indicator.warning i {
                    color: #f59e0b;
                }

                .backup-actions {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .folder-path {
                    background: #e3f2fd;
                    padding: 8px 12px;
                    border-radius: 4px;
                    border-left: 3px solid #2196f3;
                    margin-top: 10px;
                    font-size: 13px;
                }

                .backup-info {
                    background: #f0f9ff;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #bae6fd;
                }

                .backup-info h5 {
                    margin: 0 0 10px 0;
                    color: #0369a1;
                }

                .backup-info p {
                    margin: 5px 0;
                    font-size: 14px;
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

                    .backup-actions {
                        flex-direction: column;
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
            this.setupBackupHandlers();
            this.loadSettings();
        }, 100);
    }

    setupBackupHandlers() {
        // Activer/Désactiver les sauvegardes
        const backupEnabled = document.getElementById('backup-enabled');
        if (backupEnabled) {
            backupEnabled.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.backupService.enable();
                } else {
                    this.backupService.disable();
                }
                this.updateBackupUI();
            });
        }

        // Sélectionner le dossier de sauvegarde
        const selectFolderBtn = document.getElementById('select-backup-folder-btn');
        if (selectFolderBtn) {
            selectFolderBtn.addEventListener('click', async () => {
                selectFolderBtn.disabled = true;
                selectFolderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sélection...';

                const success = await this.backupService.selectBackupFolder();
                
                selectFolderBtn.disabled = false;
                selectFolderBtn.innerHTML = '<i class="fas fa-folder-open"></i> Choisir le dossier de sauvegarde';
                
                if (success) {
                    this.updateBackupUI();
                    this.showNotification('Dossier de sauvegarde configuré avec succès!', 'success');
                }
            });
        }

        // Changer la fréquence
        const frequencySelect = document.getElementById('backup-frequency');
        if (frequencySelect) {
            frequencySelect.addEventListener('change', (e) => {
                const minutes = parseInt(e.target.value);
                this.backupService.setFrequency(minutes);
                this.showNotification(`Fréquence mise à jour: toutes les ${this.formatFrequency(minutes)}`, 'info');
            });
        }

        // Sauvegarde manuelle
        const manualBackupBtn = document.getElementById('manual-backup-btn');
        if (manualBackupBtn) {
            manualBackupBtn.addEventListener('click', async () => {
                manualBackupBtn.disabled = true;
                manualBackupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';

                const success = await this.backupService.performManualBackup();
                
                manualBackupBtn.disabled = false;
                manualBackupBtn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder maintenant';
                
                if (success) {
                    this.showNotification('Sauvegarde effectuée avec succès!', 'success');
                    this.updateBackupUI();
                } else {
                    this.showNotification('Erreur lors de la sauvegarde', 'error');
                }
            });
        }

        // Export vers fichier
        const exportBackupBtn = document.getElementById('export-backup-btn');
        if (exportBackupBtn) {
            exportBackupBtn.addEventListener('click', () => {
                this.backupService.exportToFile();
            });
        }

        // Import de sauvegarde
        const importBackupFile = document.getElementById('import-backup-file');
        const importBackupBtn = document.getElementById('import-backup-btn');
        
        if (importBackupFile) {
            importBackupFile.addEventListener('change', (e) => {
                if (importBackupBtn) {
                    importBackupBtn.disabled = !e.target.files.length;
                }
            });
        }

        if (importBackupBtn) {
            importBackupBtn.addEventListener('click', async () => {
                const file = importBackupFile.files[0];
                if (!file) return;

                importBackupBtn.disabled = true;
                importBackupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restauration...';

                const success = await this.backupService.importFromFile(file);
                
                importBackupBtn.disabled = false;
                importBackupBtn.innerHTML = '<i class="fas fa-upload"></i> Restaurer les données';
                
                if (success) {
                    this.showNotification('Données restaurées avec succès!', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    this.showNotification('Erreur lors de la restauration', 'error');
                }
            });
        }

        // Mettre à jour l'interface au démarrage
        this.updateBackupUI();
    }

    formatFrequency(minutes) {
        if (minutes < 60) {
            return `${minutes} minutes`;
        } else if (minutes === 60) {
            return 'heure';
        } else if (minutes < 1440) {
            return `${minutes / 60} heures`;
        } else {
            return `${minutes / 1440} jour(s)`;
        }
    }

    updateBackupUI() {
        const status = this.backupService.getStatus();
        
        // Statut principal
        const statusIcon = document.getElementById('backup-status-icon');
        const statusText = document.getElementById('backup-status-text');
        const statusDetail = document.getElementById('backup-status-detail');
        
        if (statusIcon && statusText && statusDetail) {
            if (status.folderConfigured && status.enabled) {
                statusIcon.className = 'fas fa-circle';
                statusIcon.parentElement.className = 'status-indicator active';
                statusText.textContent = 'Actif';
                statusDetail.textContent = 'Les sauvegardes automatiques sont activées';
            } else if (status.folderConfigured && !status.enabled) {
                statusIcon.className = 'fas fa-circle';
                statusIcon.parentElement.className = 'status-indicator warning';
                statusText.textContent = 'Désactivé';
                statusDetail.textContent = 'Dossier configuré mais sauvegardes désactivées';
            } else {
                statusIcon.className = 'fas fa-circle';
                statusIcon.parentElement.className = 'status-indicator inactive';
                statusText.textContent = 'Non configuré';
                statusDetail.textContent = 'Configurez un dossier de sauvegarde pour protéger vos données';
            }
        }

        // Affichage du dossier
        const folderDisplay = document.getElementById('backup-folder-display');
        const folderPath = document.getElementById('backup-folder-path');
        
        if (folderDisplay && folderPath) {
            if (status.folderConfigured) {
                folderDisplay.style.display = 'block';
                folderPath.textContent = status.folderName || 'Dossier configuré';
            } else {
                folderDisplay.style.display = 'none';
            }
        }

        // État des contrôles
        const backupEnabled = document.getElementById('backup-enabled');
        const manualBackupBtn = document.getElementById('manual-backup-btn');
        
        if (backupEnabled) {
            backupEnabled.checked = status.enabled;
        }
        
        if (manualBackupBtn) {
            manualBackupBtn.disabled = !status.folderConfigured;
        }

        // Informations
        const lastBackupTime = document.getElementById('last-backup-time');
        const backupFilesCount = document.getElementById('backup-files-count');
        const backupSize = document.getElementById('backup-size');
        
        if (lastBackupTime) {
            lastBackupTime.textContent = status.lastBackup || 'Jamais';
        }
        
        if (backupFilesCount) {
            backupFilesCount.textContent = status.filesCount || 0;
        }
        
        if (backupSize) {
            backupSize.textContent = status.estimatedSize || '0 KB';
        }
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
    // GESTION DES PARAMÈTRES (identique)
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

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
        
        console.log(`[Settings] Thème appliqué: ${theme}`);
    }

    // ================================================
    // IMPORT/EXPORT (identique)
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
                    if (data.settings) {
                        localStorage.setItem('emailsortpro_settings', JSON.stringify(data.settings));
                    }

                    if (data.categories && window.categoryManager) {
                        this.importCategories(data.categories);
                    }

                    if (data.tasks && window.taskManager) {
                        this.importTasks(data.tasks);
                    }

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
    // ACTIONS SPÉCIFIQUES (identique)
    // ================================================
    
    resetCategories() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les catégories ? Cette action est irréversible.')) {
            if (window.categoryManager && typeof window.categoryManager.resetCategories === 'function') {
                window.categoryManager.resetCategories();
                this.showNotification('Catégories réinitialisées', 'info');
            } else {
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
            const keepKeys = ['emailsortpro_backup_config'];
            const savedData = {};
            keepKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) savedData[key] = value;
            });

            localStorage.clear();
            
            Object.entries(savedData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });

            this.showNotification('Toutes les données ont été supprimées', 'info');
            
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    // ================================================
    // UTILITAIRES (identique)
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
            alert(message);
        }
    }

    // ================================================
    // API PUBLIQUE (identique)
    // ================================================
    
    show() {
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            document.querySelectorAll('.page-content').forEach(page => {
                page.style.display = 'none';
            });
            
            settingsPage.style.display = 'block';
            this.loadSettings();
            this.updateBackupUI();
            
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
// SERVICE DE SAUVEGARDE SIMPLIFIÉ
// ================================================

class SimpleBackupService {
    constructor() {
        this.folderHandle = null;
        this.enabled = false;
        this.frequency = 60; // minutes
        this.timer = null;
        this.lastBackup = null;
        this.filesCount = 0;
        
        this.loadConfig();
    }

    async selectBackupFolder() {
        try {
            // Vérifier le support de l'API File System
            if (!window.showDirectoryPicker) {
                alert('Votre navigateur ne supporte pas la sélection de dossiers.\nVeuillez utiliser Chrome, Edge ou un navigateur compatible.');
                return false;
            }

            // Demander à l'utilisateur de sélectionner un dossier
            this.folderHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-backup-folder'
            });

            // Tester l'accès en écriture
            await this.testWriteAccess();

            // Sauvegarder la configuration
            this.saveConfig();

            console.log('[Backup] Dossier sélectionné avec succès');
            return true;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('[Backup] Sélection annulée par l\'utilisateur');
                return false;
            }
            
            console.error('[Backup] Erreur sélection dossier:', error);
            alert('Erreur lors de la sélection du dossier:\n' + error.message);
            return false;
        }
    }

    async testWriteAccess() {
        try {
            const testFileName = '.emailsortpro-test-' + Date.now();
            const testFileHandle = await this.folderHandle.getFileHandle(testFileName, { create: true });
            const writable = await testFileHandle.createWritable();
            await writable.write('Test EmailSortPro');
            await writable.close();
            await this.folderHandle.removeEntry(testFileName);
            return true;
        } catch (error) {
            throw new Error('Impossible d\'écrire dans ce dossier. Veuillez choisir un autre dossier.');
        }
    }

    enable() {
        if (!this.folderHandle) {
            alert('Veuillez d\'abord sélectionner un dossier de sauvegarde.');
            return false;
        }

        this.enabled = true;
        this.startTimer();
        this.saveConfig();
        console.log('[Backup] Service activé');
        return true;
    }

    disable() {
        this.enabled = false;
        this.stopTimer();
        this.saveConfig();
        console.log('[Backup] Service désactivé');
    }

    setFrequency(minutes) {
        this.frequency = minutes;
        this.saveConfig();
        
        if (this.enabled) {
            this.stopTimer();
            this.startTimer();
        }
        
        console.log(`[Backup] Fréquence: ${minutes} minutes`);
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        const intervalMs = this.frequency * 60 * 1000;
        this.timer = setInterval(() => {
            this.performBackup('auto');
        }, intervalMs);

        console.log(`[Backup] Timer démarré: ${this.frequency} minutes`);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async performManualBackup() {
        return await this.performBackup('manual');
    }

    async performBackup(type = 'auto') {
        if (!this.folderHandle) {
            console.error('[Backup] Aucun dossier configuré');
            return false;
        }

        try {
            // Collecter les données
            const data = this.collectData(type);
            
            // Générer le nom du fichier
            const timestamp = new Date();
            const dateStr = timestamp.toISOString().split('T')[0];
            const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `EmailSortPro-Backup-${dateStr}_${timeStr}.json`;

            // Écrire le fichier de sauvegarde
            const fileHandle = await this.folderHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();

            // Mettre à jour le fichier "latest"
            try {
                const latestHandle = await this.folderHandle.getFileHandle('EmailSortPro-Latest.json', { create: true });
                const latestWritable = await latestHandle.createWritable();
                await latestWritable.write(JSON.stringify(data, null, 2));
                await latestWritable.close();
            } catch (error) {
                // Ignorer l'erreur pour le fichier latest
            }

            // Nettoyer les anciens fichiers
            await this.cleanupOldBackups();

            // Mettre à jour les statistiques
            this.lastBackup = timestamp;
            this.updateFilesCount();
            this.saveConfig();

            if (type === 'manual') {
                console.log(`[Backup] Sauvegarde manuelle: ${fileName}`);
            }

            return true;

        } catch (error) {
            console.error('[Backup] Erreur sauvegarde:', error);
            
            if (error.name === 'NotAllowedError') {
                alert('Accès au dossier refusé. Veuillez reconfigurer le dossier de sauvegarde.');
                this.folderHandle = null;
                this.enabled = false;
                this.saveConfig();
            }
            
            return false;
        }
    }

    collectData(type) {
        return {
            version: '4.0-simple',
            timestamp: new Date().toISOString(),
            backupType: type,
            metadata: {
                backupId: this.generateId(),
                userAgent: navigator.userAgent,
                url: window.location.href
            },
            data: {
                settings: this.collectSettings(),
                categories: this.collectCategories(),
                tasks: this.collectTasks(),
                localStorage: this.collectLocalStorage()
            }
        };
    }

    collectSettings() {
        try {
            return JSON.parse(localStorage.getItem('emailsortpro_settings') || '{}');
        } catch {
            return {};
        }
    }

    collectCategories() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getCategories === 'function') {
                return window.categoryManager.getCategories();
            }
            return {};
        } catch {
            return {};
        }
    }

    collectTasks() {
        try {
            if (window.taskManager && typeof window.taskManager.getAllTasks === 'function') {
                return window.taskManager.getAllTasks();
            }
            return [];
        } catch {
            return [];
        }
    }

    collectLocalStorage() {
        const data = {};
        const relevantKeys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('emailsortpro_') || key.includes('category') || key.includes('task'))) {
                relevantKeys.push(key);
            }
        }
        
        relevantKeys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                data[key] = JSON.parse(value);
            } catch {
                data[key] = localStorage.getItem(key);
            }
        });
        
        return data;
    }

    async cleanupOldBackups() {
        try {
            const backupFiles = [];
            
            // Lister tous les fichiers de sauvegarde
            for await (const [name, handle] of this.folderHandle.entries()) {
                if (name.startsWith('EmailSortPro-Backup-') && name.endsWith('.json')) {
                    backupFiles.push(name);
                }
            }

            // Trier par date (plus récents d'abord)
            backupFiles.sort().reverse();

            // Garder seulement les 20 plus récents
            if (backupFiles.length > 20) {
                const toDelete = backupFiles.slice(20);
                
                for (const fileName of toDelete) {
                    try {
                        await this.folderHandle.removeEntry(fileName);
                    } catch (error) {
                        // Ignorer les erreurs de suppression
                    }
                }
            }

        } catch (error) {
            // Ignorer les erreurs de nettoyage
        }
    }

    async updateFilesCount() {
        try {
            let count = 0;
            for await (const [name] of this.folderHandle.entries()) {
                if (name.startsWith('EmailSortPro-Backup-') && name.endsWith('.json')) {
                    count++;
                }
            }
            this.filesCount = count;
        } catch {
            this.filesCount = 0;
        }
    }

    exportToFile() {
        try {
            const data = this.collectData('export');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `EmailSortPro-Export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('[Backup] Export vers fichier réussi');

        } catch (error) {
            console.error('[Backup] Erreur export:', error);
            alert('Erreur lors de l\'export: ' + error.message);
        }
    }

    async importFromFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.version || !data.data) {
                throw new Error('Format de fichier invalide');
            }

            if (!confirm('Êtes-vous sûr de vouloir restaurer ces données ? Cela remplacera vos données actuelles.')) {
                return false;
            }

            // Restaurer les paramètres
            if (data.data.settings) {
                localStorage.setItem('emailsortpro_settings', JSON.stringify(data.data.settings));
            }

            // Restaurer localStorage
            if (data.data.localStorage) {
                Object.entries(data.data.localStorage).forEach(([key, value]) => {
                    try {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    } catch (error) {
                        console.warn(`[Backup] Impossible de restaurer ${key}:`, error);
                    }
                });
            }

            // Restaurer catégories et tâches si les managers existent
            if (data.data.categories && window.categoryManager) {
                try {
                    if (typeof window.categoryManager.importCategories === 'function') {
                        window.categoryManager.importCategories(data.data.categories);
                    }
                } catch (error) {
                    console.warn('[Backup] Erreur restauration catégories:', error);
                }
            }

            if (data.data.tasks && window.taskManager) {
                try {
                    if (typeof window.taskManager.importTasks === 'function') {
                        window.taskManager.importTasks(data.data.tasks);
                    }
                } catch (error) {
                    console.warn('[Backup] Erreur restauration tâches:', error);
                }
            }

            console.log('[Backup] Import réussi');
            return true;

        } catch (error) {
            console.error('[Backup] Erreur import:', error);
            alert('Erreur lors de l\'import: ' + error.message);
            return false;
        }
    }

    saveConfig() {
        try {
            const config = {
                enabled: this.enabled,
                frequency: this.frequency,
                lastBackup: this.lastBackup ? this.lastBackup.toISOString() : null,
                filesCount: this.filesCount,
                folderConfigured: !!this.folderHandle
            };
            
            localStorage.setItem('emailsortpro_simple_backup_config', JSON.stringify(config));
        } catch (error) {
            console.warn('[Backup] Erreur sauvegarde config:', error);
        }
    }

    loadConfig() {
        try {
            const config = JSON.parse(localStorage.getItem('emailsortpro_simple_backup_config') || '{}');
            
            this.enabled = config.enabled || false;
            this.frequency = config.frequency || 60;
            this.filesCount = config.filesCount || 0;
            
            if (config.lastBackup) {
                this.lastBackup = new Date(config.lastBackup);
            }

            // Note: folderHandle ne peut pas être restauré - l'utilisateur doit le reconfigurer
            
        } catch (error) {
            console.warn('[Backup] Erreur chargement config:', error);
        }
    }

    getStatus() {
        return {
            enabled: this.enabled,
            folderConfigured: !!this.folderHandle,
            folderName: this.folderHandle ? 'Dossier configuré' : null,
            frequency: this.frequency,
            lastBackup: this.lastBackup ? this.lastBackup.toLocaleString('fr-FR') : null,
            filesCount: this.filesCount,
            estimatedSize: this.calculateEstimatedSize()
        };
    }

    calculateEstimatedSize() {
        try {
            const data = this.collectData('estimate');
            const sizeBytes = JSON.stringify(data).length;
            
            if (sizeBytes < 1024) {
                return sizeBytes + ' B';
            } else if (sizeBytes < 1024 * 1024) {
                return Math.round(sizeBytes / 1024) + ' KB';
            } else {
                return Math.round(sizeBytes / (1024 * 1024)) + ' MB';
            }
            
        } catch (error) {
            return 'N/A';
        }
    }

    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

// API de sauvegarde globale
window.backupService = window.categoryPage?.backupService;
window.triggerBackup = () => window.categoryPage?.backupService?.performManualBackup();
window.getBackupStatus = () => window.categoryPage?.backupService?.getStatus();

console.log('✅ Page paramètres chargée avec système de backup simplifié');
console.log('⚙️ Fonctions disponibles: showSettings(), hideSettings(), getAppSettings()');
console.log('💾 Backup fonctionnel: sélection dossier + fréquence + import/export');
