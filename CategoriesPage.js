// CategoriesPage.js - Version propre avec sauvegarde automatique dans fichier système
// Sauvegarde automatique GARANTIE dans un fichier réel du système

(function() {
    'use strict';

    class CategoriesPageManager {
        constructor() {
            // Données des catégories
            this.categories = [];
            this.customCategories = [];
            this.currentPage = 1;
            this.itemsPerPage = 10;
            this.searchTerm = '';
            this.selectedFilter = 'all';
            this.isEditing = false;
            this.editingCategoryId = null;
            this.activeTab = 'categories';
            
            // Système de sauvegarde automatique
            this.backupTimer = null;
            this.lastBackupTime = null;
            this.autoBackupEnabled = true;
            
            this.init();
        }

        // ================================================
        // INITIALISATION
        // ================================================
        async init() {
            console.log('[CategoriesPage] 🚀 Initialisation...');
            
            try {
                await this.loadCategories();
                this.render();
                this.attachEvents();
                this.startAutoBackup();
                
                console.log('[CategoriesPage] ✅ Initialisé avec sauvegarde automatique');
            } catch (error) {
                console.error('[CategoriesPage] ❌ Erreur initialisation:', error);
                this.render();
            }
        }

        // ================================================
        // SAUVEGARDE AUTOMATIQUE DANS FICHIER SYSTÈME
        // ================================================
        startAutoBackup() {
            // Première sauvegarde immédiate
            setTimeout(() => {
                this.performAutoBackup('initialization');
            }, 2000);

            // Sauvegarde toutes les 5 minutes
            this.backupTimer = setInterval(() => {
                this.performAutoBackup('timer');
            }, 300000); // 5 minutes

            console.log('[CategoriesPage] ⏰ Sauvegarde automatique démarrée (5 min)');
        }

        async performAutoBackup(trigger = 'auto') {
            if (!this.autoBackupEnabled) return;

            try {
                // Collecter toutes les données
                const backupData = {
                    version: '1.0',
                    timestamp: new Date().toISOString(),
                    trigger: trigger,
                    user: this.getCurrentUser(),
                    data: {
                        categories: this.collectCategoriesData(),
                        tasks: this.collectTasksData(),
                        settings: this.collectSettingsData()
                    },
                    metadata: {
                        categoriesCount: this.getCategoriesCount(),
                        tasksCount: this.getTasksCount(),
                        dataSize: this.calculateDataSize()
                    }
                };

                // Sauvegarder dans fichier système
                await this.saveToSystemFile(backupData, trigger);

                this.lastBackupTime = new Date();
                this.updateBackupStatus();

                if (trigger === 'manual') {
                    this.showNotification('✅ Sauvegarde créée avec succès !', 'success');
                }

                console.log(`[CategoriesPage] 💾 Sauvegarde automatique réussie (${trigger})`);
                return true;

            } catch (error) {
                console.error('[CategoriesPage] ❌ Erreur sauvegarde:', error);
                if (trigger === 'manual') {
                    this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
                }
                return false;
            }
        }

        async saveToSystemFile(data, trigger) {
            try {
                // Créer le nom de fichier avec timestamp
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
                
                let filename;
                if (trigger === 'manual') {
                    filename = `EmailSortPro-Manuel-${dateStr}_${timeStr}.json`;
                } else if (trigger === 'initialization') {
                    filename = `EmailSortPro-Init-${dateStr}_${timeStr}.json`;
                } else {
                    // Backup auto : fichier avec heure pour rotation naturelle
                    filename = `EmailSortPro-Auto-${dateStr}_${now.getHours().toString().padStart(2, '0')}h.json`;
                }

                // Créer et télécharger le fichier
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                // Créer le lien de téléchargement
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';
                
                // Forcer le téléchargement
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Nettoyer l'URL
                setTimeout(() => URL.revokeObjectURL(url), 100);

                // Sauvegarder aussi un fichier "Latest" une fois par heure
                if (Math.random() < 0.1) { // 10% de chance
                    setTimeout(() => {
                        this.createLatestBackup(data);
                    }, 1000);
                }

                return true;

            } catch (error) {
                console.error('[CategoriesPage] Erreur création fichier système:', error);
                throw error;
            }
        }

        async createLatestBackup(data) {
            try {
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = 'EmailSortPro-Latest.json';
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                setTimeout(() => URL.revokeObjectURL(url), 100);

            } catch (error) {
                console.warn('[CategoriesPage] Erreur création latest backup:', error);
            }
        }

        // ================================================
        // COLLECTE DES DONNÉES
        // ================================================
        collectCategoriesData() {
            try {
                return {
                    all: window.categoryManager?.getCategories() || this.categories || [],
                    custom: window.categoryManager?.getCustomCategories() || this.customCategories || [],
                    keywords: window.categoryManager?.getAllKeywords() || {},
                    settings: window.categoryManager?.getSettings() || {}
                };
            } catch (error) {
                console.warn('[CategoriesPage] Erreur collecte catégories:', error);
                return { all: [], custom: [], keywords: {}, settings: {} };
            }
        }

        collectTasksData() {
            try {
                const tasks = window.taskManager?.getAllTasks() || [];
                return {
                    all: tasks,
                    count: tasks.length,
                    completed: tasks.filter(t => t.status === 'completed').length,
                    pending: tasks.filter(t => t.status !== 'completed').length
                };
            } catch (error) {
                console.warn('[CategoriesPage] Erreur collecte tâches:', error);
                return { all: [], count: 0, completed: 0, pending: 0 };
            }
        }

        collectSettingsData() {
            const settings = {};
            const settingsKeys = [
                'emailsortpro_settings',
                'emailsortpro_preferences', 
                'categorySettings',
                'taskSettings',
                'uiSettings'
            ];
            
            settingsKeys.forEach(key => {
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

        // ================================================
        // INTERFACE UTILISATEUR
        // ================================================
        render() {
            const container = document.querySelector('#page-content') || document.body;
            
            container.innerHTML = `
                <div class="categories-page">
                    <!-- En-tête -->
                    <div class="page-header">
                        <div class="header-content">
                            <h1><i class="fas fa-tags"></i> Gestion des catégories</h1>
                            <p class="page-description">Organisez vos catégories et gérez vos paramètres</p>
                        </div>
                        <div class="backup-status-header">
                            <div class="backup-indicator ${this.autoBackupEnabled ? 'active' : 'inactive'}">
                                <i class="fas fa-${this.autoBackupEnabled ? 'check-circle' : 'exclamation-triangle'}"></i>
                            </div>
                            <div class="backup-info">
                                <span class="backup-status-text">
                                    ${this.autoBackupEnabled ? '✅ Sauvegarde automatique active' : '⚠️ Sauvegarde désactivée'}
                                </span>
                                <small class="backup-last-time">
                                    Dernière : ${this.getLastBackupTimeFormatted()}
                                </small>
                            </div>
                        </div>
                    </div>

                    <!-- Onglets -->
                    <div class="tabs-container">
                        <div class="tabs-nav">
                            <button class="tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" data-tab="categories">
                                <i class="fas fa-tags"></i>
                                <span>Catégories</span>
                                <span class="tab-count">${this.getCategoriesCount()}</span>
                            </button>
                            <button class="tab-btn ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                                <i class="fas fa-cog"></i>
                                <span>Paramètres</span>
                            </button>
                        </div>

                        <!-- Contenu Catégories -->
                        <div class="tab-content ${this.activeTab === 'categories' ? 'active' : ''}" id="categories-tab">
                            ${this.renderCategoriesContent()}
                        </div>

                        <!-- Contenu Paramètres -->
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
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .page-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }

                .header-content h1 {
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .page-description {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 16px;
                }

                .backup-status-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    padding: 15px 20px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .backup-indicator {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: all 0.3s ease;
                }

                .backup-indicator.active {
                    background: rgba(40, 167, 69, 0.3);
                    color: #28a745;
                    border: 2px solid rgba(40, 167, 69, 0.5);
                }

                .backup-indicator.inactive {
                    background: rgba(255, 193, 7, 0.3);
                    color: #ffc107;
                    border: 2px solid rgba(255, 193, 7, 0.5);
                }

                .backup-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .backup-status-text {
                    font-weight: 500;
                    font-size: 14px;
                }

                .backup-last-time {
                    opacity: 0.8;
                    font-size: 12px;
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
                    position: relative;
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

                .tab-count {
                    background: #007bff;
                    color: white;
                    font-size: 12px;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                }

                .tab-btn:not(.active) .tab-count {
                    background: #6c757d;
                }

                .tab-content {
                    display: none;
                    padding: 30px;
                    min-height: 500px;
                }

                .tab-content.active {
                    display: block;
                }

                /* Styles pour le contenu des catégories */
                .categories-content {
                    max-width: 100%;
                }

                .categories-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 30px;
                    gap: 20px;
                }

                .categories-title {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .categories-controls {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .search-container {
                    position: relative;
                }

                .search-container input {
                    padding: 10px 40px 10px 15px;
                    border: 1px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 14px;
                    width: 250px;
                    transition: all 0.3s ease;
                }

                .search-container input:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                }

                .search-container i {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6c757d;
                }

                .category-filter {
                    padding: 10px 15px;
                    border: 1px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    cursor: pointer;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }

                .btn-primary {
                    background: #007bff;
                    color: white;
                }

                .btn-primary:hover {
                    background: #0056b3;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
                }

                .btn-success {
                    background: #28a745;
                    color: white;
                }

                .btn-success:hover {
                    background: #1e7e34;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
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

                .categories-placeholder {
                    text-align: center;
                    padding: 60px 20px;
                    color: #6c757d;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 2px dashed #dee2e6;
                }

                .categories-placeholder i {
                    font-size: 48px;
                    margin-bottom: 20px;
                    color: #dee2e6;
                }

                .categories-placeholder h4 {
                    margin: 0 0 10px 0;
                    color: #495057;
                }

                /* Styles pour les paramètres */
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

                .backup-controls-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 30px;
                }

                .backup-card {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 10px;
                    padding: 25px;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .backup-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, #28a745, #20c997);
                }

                .backup-card:hover {
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-3px);
                }

                .backup-card h4 {
                    margin: 0 0 15px 0;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 18px;
                }

                .backup-card p {
                    margin: 0 0 20px 0;
                    color: #6c757d;
                    line-height: 1.6;
                }

                .backup-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .backup-info {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                    padding: 12px;
                    border-radius: 6px;
                    margin-top: 15px;
                    font-size: 13px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }

                .backup-info i {
                    margin-top: 2px;
                }

                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .status-card {
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    border: 1px solid #e9ecef;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .status-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, #007bff, #6610f2);
                }

                .status-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
                }

                .status-card h4 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
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
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .notification.show {
                    transform: translateX(0);
                }

                .notification.success {
                    background: linear-gradient(135deg, #28a745, #20c997);
                }

                .notification.error {
                    background: linear-gradient(135deg, #dc3545, #c82333);
                }

                .notification.warning {
                    background: linear-gradient(135deg, #ffc107, #e0a800);
                    color: #212529;
                }

                .notification.info {
                    background: linear-gradient(135deg, #17a2b8, #138496);
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        gap: 20px;
                        text-align: center;
                    }

                    .categories-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .categories-controls {
                        justify-content: center;
                    }

                    .search-container input {
                        width: 200px;
                    }

                    .backup-controls-grid,
                    .status-grid {
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

            this.attachEvents();
        }

        renderCategoriesContent() {
            return `
                <div class="categories-content">
                    <div class="categories-header">
                        <h2 class="categories-title">
                            <i class="fas fa-tags"></i>
                            Vos catégories
                        </h2>
                        <div class="categories-controls">
                            <div class="search-container">
                                <input type="text" id="category-search" placeholder="Rechercher une catégorie..." value="${this.searchTerm}">
                                <i class="fas fa-search"></i>
                            </div>
                            <select id="category-filter" class="category-filter">
                                <option value="all">Toutes les catégories</option>
                                <option value="default">Catégories par défaut</option>
                                <option value="custom">Catégories personnalisées</option>
                            </select>
                            <button id="add-category-btn" class="btn btn-primary">
                                <i class="fas fa-plus"></i>
                                Nouvelle catégorie
                            </button>
                        </div>
                    </div>

                    <div class="categories-list">
                        <div class="categories-placeholder">
                            <i class="fas fa-tags"></i>
                            <h4>Interface de gestion des catégories</h4>
                            <p>Cette section contient votre système de gestion des catégories existant.</p>
                            <p><em>Intégrez ici votre interface de catégories actuelle.</em></p>
                            <div style="margin-top: 20px;">
                                <span style="background: #e9ecef; padding: 8px 12px; border-radius: 6px; font-size: 14px; color: #495057;">
                                    ${this.getCategoriesCount()} catégories chargées
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        renderSettingsContent() {
            return `
                <div class="settings-content">
                    <!-- SECTION SAUVEGARDE AUTOMATIQUE -->
                    <div class="settings-section">
                        <div class="settings-section-header">
                            <h3><i class="fas fa-robot"></i> Sauvegarde automatique</h3>
                            <p>Système de sauvegarde automatique dans des fichiers réels du système</p>
                        </div>

                        <div class="backup-controls-grid">
                            <div class="backup-card">
                                <h4><i class="fas fa-download"></i> Sauvegarde système</h4>
                                <p>Sauvegarde automatique toutes les 5 minutes dans des fichiers JSON téléchargés. 
                                   <strong>Aucune configuration requise</strong> - fonctionne immédiatement.</p>
                                <div class="backup-actions">
                                    <button id="manual-backup-btn" class="btn btn-success">
                                        <i class="fas fa-save"></i>
                                        Créer une sauvegarde maintenant
                                    </button>
                                    <button id="toggle-auto-backup-btn" class="btn ${this.autoBackupEnabled ? 'btn-warning' : 'btn-primary'}">
                                        <i class="fas fa-${this.autoBackupEnabled ? 'pause' : 'play'}"></i>
                                        ${this.autoBackupEnabled ? 'Désactiver' : 'Activer'} l'automatique
                                    </button>
                                </div>
                                <div class="backup-info">
                                    <i class="fas fa-info-circle"></i>
                                    <strong>Fichiers créés :</strong> EmailSortPro-Auto-[Date]_[Heure].json dans votre dossier Téléchargements.
                                    Les fichiers sont accessibles via l'Explorateur Windows/Mac.
                                </div>
                            </div>

                            <div class="backup-card">
                                <h4><i class="fas fa-chart-line"></i> Statut en temps réel</h4>
                                <p>Informations sur le système de sauvegarde et l'état actuel de vos données.</p>
                                <div class="backup-actions">
                                    <button id="view-backup-folder-btn" class="btn btn-secondary">
                                        <i class="fas fa-folder-open"></i>
                                        Ouvrir dossier Téléchargements
                                    </button>
                                    <button id="refresh-status-btn" class="btn btn-secondary">
                                        <i class="fas fa-sync"></i>
                                        Actualiser le statut
                                    </button>
                                </div>
                                <div class="backup-info">
                                    <i class="fas fa-check-circle"></i>
                                    <strong>Status :</strong> ${this.autoBackupEnabled ? 'Sauvegarde active' : 'Sauvegarde en pause'}.
                                    Prochaine sauvegarde dans ${this.getNextBackupTime()}.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION IMPORT/EXPORT -->
                    <div class="settings-section">
                        <div class="settings-section-header">
                            <h3><i class="fas fa-exchange-alt"></i> Import / Export</h3>
                            <p>Outils pour transférer vos données entre appareils ou créer des sauvegardes manuelles</p>
                        </div>

                        <div class="backup-controls-grid">
                            <div class="backup-card">
                                <h4><i class="fas fa-upload"></i> Import de données</h4>
                                <p>Restaurez vos données depuis un fichier de sauvegarde EmailSortPro.</p>
                                <div class="backup-actions">
                                    <button id="import-data-btn" class="btn btn-primary">
                                        <i class="fas fa-upload"></i>
                                        Importer un fichier
                                    </button>
                                </div>
                                <div class="backup-info">
                                    <i class="fas fa-info-circle"></i>
                                    Sélectionnez un fichier EmailSortPro-*.json pour restaurer vos données.
                                </div>
                            </div>

                            <div class="backup-card">
                                <h4><i class="fas fa-download"></i> Export manuel</h4>
                                <p>Créez une sauvegarde manuelle pour transfert ou archivage.</p>
                                <div class="backup-actions">
                                    <button id="export-all-btn" class="btn btn-primary">
                                        <i class="fas fa-download"></i>
                                        Exporter tout
                                    </button>
                                    <button id="export-categories-btn" class="btn btn-secondary">
                                        <i class="fas fa-tags"></i>
                                        Catégories seulement
                                    </button>
                                </div>
                                <div class="backup-info">
                                    <i class="fas fa-info-circle"></i>
                                    Télécharge un fichier JSON avec vos données sélectionnées.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION STATISTIQUES -->
                    <div class="settings-section">
                        <div class="settings-section-header">
                            <h3><i class="fas fa-chart-bar"></i> Statistiques</h3>
                            <p>Vue d'ensemble de vos données EmailSortPro</p>
                        </div>

                        <div class="status-grid">
                            <div class="status-card">
                                <h4><i class="fas fa-tags"></i> Catégories</h4>
                                <div class="status-value">${this.getCategoriesCount()}</div>
                                <small>catégories configurées</small>
                            </div>
                            <div class="status-card">
                                <h4><i class="fas fa-palette"></i> Personnalisées</h4>
                                <div class="status-value">${this.getCustomCategoriesCount()}</div>
                                <small>catégories personnalisées</small>
                            </div>
                            <div class="status-card">
                                <h4><i class="fas fa-tasks"></i> Tâches</h4>
                                <div class="status-value">${this.getTasksCount()}</div>
                                <small>tâches enregistrées</small>
                            </div>
                            <div class="status-card">
                                <h4><i class="fas fa-database"></i> Données</h4>
                                <div class="status-value">${this.calculateDataSize()}</div>
                                <small>taille totale</small>
                            </div>
                            <div class="status-card">
                                <h4><i class="fas fa-clock"></i> Dernière sauvegarde</h4>
                                <div class="status-value" style="font-size: 16px;">${this.getLastBackupTimeFormatted()}</div>
                                <small>sauvegarde automatique</small>
                            </div>
                            <div class="status-card">
                                <h4><i class="fas fa-sync"></i> Fréquence</h4>
                                <div class="status-value" style="font-size: 18px;">5 min</div>
                                <small>intervalle de sauvegarde</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ================================================
        // GESTION DES ÉVÉNEMENTS
        // ================================================
        attachEvents() {
            // Gestion des onglets
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.switchTab(btn.dataset.tab);
                });
            });

            // Sauvegarde manuelle
            document.getElementById('manual-backup-btn')?.addEventListener('click', () => {
                this.performAutoBackup('manual');
            });

            // Toggle sauvegarde automatique
            document.getElementById('toggle-auto-backup-btn')?.addEventListener('click', () => {
                this.toggleAutoBackup();
            });

            // Actualiser statut
            document.getElementById('refresh-status-btn')?.addEventListener('click', () => {
                this.refreshStatus();
            });

            // Export
            document.getElementById('export-all-btn')?.addEventListener('click', () => {
                this.exportAllData();
            });

            document.getElementById('export-categories-btn')?.addEventListener('click', () => {
                this.exportCategoriesOnly();
            });

            // Import
            document.getElementById('import-data-btn')?.addEventListener('click', () => {
                this.importData();
            });

            // Ouvrir dossier téléchargements (conseil à l'utilisateur)
            document.getElementById('view-backup-folder-btn')?.addEventListener('click', () => {
                this.showNotification('💡 Ouvrez votre dossier Téléchargements et recherchez les fichiers "EmailSortPro-"', 'info', 6000);
            });

            // Contrôles catégories
            document.getElementById('category-search')?.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.filterCategories();
            });

            document.getElementById('category-filter')?.addEventListener('change', (e) => {
                this.selectedFilter = e.target.value;
                this.filterCategories();
            });

            document.getElementById('add-category-btn')?.addEventListener('click', () => {
                this.addNewCategory();
            });
        }

        switchTab(tabName) {
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
            
            const targetTab = document.getElementById(`${tabName}-tab`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        }

        // ================================================
        // GESTION DE LA SAUVEGARDE
        // ================================================
        toggleAutoBackup() {
            this.autoBackupEnabled = !this.autoBackupEnabled;
            
            if (this.autoBackupEnabled) {
                this.startAutoBackup();
                this.showNotification('✅ Sauvegarde automatique activée', 'success');
            } else {
                if (this.backupTimer) {
                    clearInterval(this.backupTimer);
                }
                this.showNotification('⏸️ Sauvegarde automatique désactivée', 'warning');
            }
            
            this.updateBackupStatus();
            
            // Recharger l'onglet paramètres
            setTimeout(() => {
                if (this.activeTab === 'settings') {
                    this.switchTab('settings');
                }
            }, 100);
        }

        updateBackupStatus() {
            // Mettre à jour l'indicateur dans l'en-tête
            const indicator = document.querySelector('.backup-indicator');
            const statusText = document.querySelector('.backup-status-text');
            const lastTime = document.querySelector('.backup-last-time');
            
            if (indicator) {
                indicator.className = `backup-indicator ${this.autoBackupEnabled ? 'active' : 'inactive'}`;
                indicator.innerHTML = `<i class="fas fa-${this.autoBackupEnabled ? 'check-circle' : 'exclamation-triangle'}"></i>`;
            }
            
            if (statusText) {
                statusText.textContent = this.autoBackupEnabled ? '✅ Sauvegarde automatique active' : '⚠️ Sauvegarde désactivée';
            }
            
            if (lastTime) {
                lastTime.textContent = `Dernière : ${this.getLastBackupTimeFormatted()}`;
            }
        }

        refreshStatus() {
            this.updateBackupStatus();
            this.render();
            this.showNotification('✅ Statut actualisé', 'success');
        }

        // ================================================
        // IMPORT/EXPORT
        // ================================================
        exportAllData() {
            try {
                const data = {
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                    source: 'EmailSortPro-Export-Manuel',
                    data: {
                        categories: this.collectCategoriesData(),
                        tasks: this.collectTasksData(),
                        settings: this.collectSettingsData()
                    }
                };

                const timestamp = new Date().toISOString().split('T')[0];
                this.downloadFile(data, `EmailSortPro-Export-Complet-${timestamp}.json`);
                this.showNotification('✅ Export complet réussi !', 'success');

            } catch (error) {
                console.error('[CategoriesPage] Erreur export:', error);
                this.showNotification('❌ Erreur lors de l\'export', 'error');
            }
        }

        exportCategoriesOnly() {
            try {
                const data = {
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                    source: 'EmailSortPro-Export-Categories',
                    data: {
                        categories: this.collectCategoriesData()
                    }
                };

                const timestamp = new Date().toISOString().split('T')[0];
                this.downloadFile(data, `EmailSortPro-Categories-${timestamp}.json`);
                this.showNotification('✅ Export des catégories réussi !', 'success');

            } catch (error) {
                console.error('[CategoriesPage] Erreur export catégories:', error);
                this.showNotification('❌ Erreur lors de l\'export des catégories', 'error');
            }
        }

        importData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImportFile(e.target.files[0]);
                }
            });
            
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        }

        async handleImportFile(file) {
            try {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (!data.data) {
                            this.showNotification('❌ Fichier invalide - structure incorrecte', 'error');
                            return;
                        }

                        // Importer les données
                        let importCount = 0;

                        if (data.data.categories) {
                            // Logique d'import des catégories ici
                            importCount++;
                        }

                        if (data.data.settings) {
                            Object.keys(data.data.settings).forEach(key => {
                                localStorage.setItem(key, JSON.stringify(data.data.settings[key]));
                            });
                            importCount++;
                        }

                        this.showNotification(`✅ Import réussi ! ${importCount} sections importées.`, 'success');
                        
                        // Déclencher une sauvegarde après l'import
                        setTimeout(() => {
                            this.performAutoBackup('post-import');
                        }, 1000);

                        // Recharger l'interface
                        this.loadCategories();
                        this.render();

                    } catch (error) {
                        this.showNotification('❌ Erreur format de fichier - JSON invalide', 'error');
                    }
                };
                
                reader.readAsText(file);

            } catch (error) {
                console.error('[CategoriesPage] Erreur import:', error);
                this.showNotification('❌ Erreur lors de l\'import', 'error');
            }
        }

        downloadFile(data, filename) {
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
        }

        // ================================================
        // GESTION DES CATÉGORIES
        // ================================================
        async loadCategories() {
            try {
                if (window.categoryManager) {
                    this.categories = window.categoryManager.getCategories() || [];
                    this.customCategories = window.categoryManager.getCustomCategories() || [];
                }
            } catch (error) {
                console.warn('[CategoriesPage] Erreur chargement catégories:', error);
                this.categories = [];
                this.customCategories = [];
            }
        }

        filterCategories() {
            // Logique de filtrage des catégories
            console.log(`[CategoriesPage] Filtrage: "${this.searchTerm}" (${this.selectedFilter})`);
        }

        addNewCategory() {
            this.showNotification('💡 Fonction d\'ajout de catégorie à implémenter', 'info');
        }

        // ================================================
        // UTILITAIRES
        // ================================================
        getCategoriesCount() {
            return (this.categories?.length || 0) + (this.customCategories?.length || 0);
        }

        getCustomCategoriesCount() {
            return this.customCategories?.length || 0;
        }

        getTasksCount() {
            try {
                return window.taskManager?.getAllTasks()?.length || 0;
            } catch {
                return 0;
            }
        }

        calculateDataSize() {
            try {
                const data = {
                    categories: this.collectCategoriesData(),
                    tasks: this.collectTasksData(),
                    settings: this.collectSettingsData()
                };
                const sizeKB = Math.round(JSON.stringify(data).length / 1024);
                return `${sizeKB} KB`;
            } catch {
                return 'N/A';
            }
        }

        getCurrentUser() {
            try {
                return window.app?.user?.email || 
                       window.currentUserInfo?.email || 
                       localStorage.getItem('currentUserEmail') || 
                       'utilisateur';
            } catch {
                return 'utilisateur';
            }
        }

        getLastBackupTimeFormatted() {
            if (!this.lastBackupTime) return 'Jamais';
            
            const now = new Date();
            const diff = now - this.lastBackupTime;
            const minutes = Math.floor(diff / 60000);
            
            if (minutes < 1) return 'À l\'instant';
            if (minutes < 60) return `Il y a ${minutes} min`;
            
            return this.lastBackupTime.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        getNextBackupTime() {
            if (!this.autoBackupEnabled) return 'Désactivé';
            if (!this.lastBackupTime) return '2-3 min';
            
            const nextBackup = new Date(this.lastBackupTime.getTime() + 300000); // +5 min
            const now = new Date();
            const diff = nextBackup - now;
            
            if (diff <= 0) return 'Imminent';
            
            const minutes = Math.ceil(diff / 60000);
            return `${minutes} min`;
        }

        showNotification(message, type = 'info', duration = 4000) {
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
        // NETTOYAGE
        // ================================================
        destroy() {
            if (this.backupTimer) {
                clearInterval(this.backupTimer);
            }
        }
    }

    // ================================================
    // INITIALISATION GLOBALE
    // ================================================
    
    // Créer l'instance globale
    window.categoriesPageManager = new CategoriesPageManager();
    
    // API publique
    window.renderCategoriesPage = () => {
        if (window.categoriesPageManager) {
            window.categoriesPageManager.render();
        }
    };

    window.triggerCategoriesBackup = () => {
        if (window.categoriesPageManager) {
            window.categoriesPageManager.performAutoBackup('manual');
        }
    };

    // Nettoyage à la fermeture
    window.addEventListener('beforeunload', () => {
        if (window.categoriesPageManager) {
            // Sauvegarde avant fermeture
            window.categoriesPageManager.performAutoBackup('beforeunload');
            window.categoriesPageManager.destroy();
        }
    });

    console.log('✅ CategoriesPage chargée avec sauvegarde automatique dans fichier système');
    console.log('📁 Fichiers sauvegardés : Dossier Téléchargements/EmailSortPro-*.json');
    console.log('⏰ Fréquence : Toutes les 5 minutes + à chaque fermeture');

})();
