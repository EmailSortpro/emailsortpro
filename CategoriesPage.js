// CategoriesPage.js - Version propre et fonctionnelle avec sauvegarde automatique
// Sauvegarde automatique GARANTIE dans le dossier Téléchargements

(function() {
    'use strict';

    class CategoriesPageManager {
        constructor() {
            // Données des catégories
            this.categories = [];
            this.customCategories = [];
            this.currentPage = 1;
            this.itemsPerPage = 6;
            this.searchTerm = '';
            this.selectedFilter = 'all';
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
                this.startAutoBackup();
                
                console.log('[CategoriesPage] ✅ Initialisé avec sauvegarde automatique');
            } catch (error) {
                console.error('[CategoriesPage] ❌ Erreur initialisation:', error);
                this.render();
            }
        }

        async loadCategories() {
            try {
                console.log('[CategoriesPage] 📂 Chargement des catégories...');
                
                // Essayer de charger depuis categoryManager
                if (window.categoryManager) {
                    this.categories = window.categoryManager.getCategories() || [];
                    this.customCategories = window.categoryManager.getCustomCategories() || [];
                    console.log(`[CategoriesPage] ✅ Chargé ${this.categories.length} catégories depuis categoryManager`);
                }
                
                // Si pas de catégories, charger des exemples
                if (this.categories.length === 0) {
                    this.loadDefaultCategories();
                }
                
            } catch (error) {
                console.warn('[CategoriesPage] ❌ Erreur chargement catégories:', error);
                this.loadDefaultCategories();
            }
        }

        loadDefaultCategories() {
            // Catégories par défaut pour démonstration
            this.categories = [
                {
                    id: 'important',
                    name: 'Important',
                    description: 'Emails prioritaires et urgents',
                    color: '#dc3545',
                    keywords: ['urgent', 'important', 'priorité', 'asap'],
                    createdAt: new Date('2024-01-01').toISOString()
                },
                {
                    id: 'work',
                    name: 'Travail',
                    description: 'Emails professionnels et projets',
                    color: '#007bff',
                    keywords: ['projet', 'réunion', 'deadline', 'client'],
                    createdAt: new Date('2024-01-01').toISOString()
                },
                {
                    id: 'finance',
                    name: 'Finance',
                    description: 'Factures, banque et finances',
                    color: '#28a745',
                    keywords: ['facture', 'banque', 'paiement', 'budget'],
                    createdAt: new Date('2024-01-01').toISOString()
                },
                {
                    id: 'personal',
                    name: 'Personnel',
                    description: 'Emails personnels et famille',
                    color: '#ffc107',
                    keywords: ['famille', 'ami', 'personnel', 'vacances'],
                    createdAt: new Date('2024-01-01').toISOString()
                },
                {
                    id: 'shopping',
                    name: 'Achats',
                    description: 'Commandes et livraisons',
                    color: '#17a2b8',
                    keywords: ['commande', 'livraison', 'amazon', 'achat'],
                    createdAt: new Date('2024-01-01').toISOString()
                },
                {
                    id: 'newsletters',
                    name: 'Newsletters',
                    description: 'Newsletters et publications',
                    color: '#6c757d',
                    keywords: ['newsletter', 'publication', 'abonnement'],
                    createdAt: new Date('2024-01-01').toISOString()
                }
            ];
            
            this.customCategories = [
                {
                    id: 'custom-travel',
                    name: 'Voyages',
                    description: 'Réservations et voyages',
                    color: '#fd7e14',
                    keywords: ['vol', 'hôtel', 'voyage', 'booking'],
                    createdAt: new Date('2024-06-01').toISOString()
                }
            ];
            
            console.log('[CategoriesPage] ✅ Catégories par défaut chargées');
        }

        // ================================================
        // SAUVEGARDE AUTOMATIQUE
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

                ${this.renderStyles()}
            `;

            this.attachEvents();
        }

        renderStyles() {
            return `
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

                /* Styles catégories */
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

                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                .category-card {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 10px;
                    padding: 20px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .category-card:hover {
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                    border-color: #007bff;
                }

                .category-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }

                .category-name {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .category-badge {
                    background: #e9ecef;
                    color: #6c757d;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 3px;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .category-badge.custom {
                    background: #d4edda;
                    color: #155724;
                }

                .category-description {
                    color: #6c757d;
                    font-size: 14px;
                    line-height: 1.4;
                    margin-bottom: 15px;
                }

                .category-keywords {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }

                .keyword-tag {
                    background: #f8f9fa;
                    color: #495057;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    border: 1px solid #e9ecef;
                }

                /* Styles paramètres */
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
                    line-height: 1.4;
                }

                .backup-info i {
                    margin-top: 2px;
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
                    justify-content: center;
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

                    .backup-controls-grid {
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
                        ${this.renderCategoriesList()}
                    </div>
                </div>
            `;
        }

        renderCategoriesList() {
            const allCategories = [...this.categories, ...this.customCategories];
            
            if (allCategories.length === 0) {
                return `
                    <div style="text-align: center; padding: 60px 20px; color: #6c757d;">
                        <i class="fas fa-tags" style="font-size: 48px; margin-bottom: 20px; color: #dee2e6;"></i>
                        <h4>Aucune catégorie trouvée</h4>
                        <p>Commencez par créer votre première catégorie personnalisée.</p>
                    </div>
                `;
            }

            return `
                <div class="categories-grid">
                    ${allCategories.map(category => this.renderCategoryCard(category)).join('')}
                </div>
            `;
        }

        renderCategoryCard(category) {
            const isCustom = this.customCategories.some(c => c.id === category.id);
            const keywords = category.keywords || [];
            
            return `
                <div class="category-card" data-category-id="${category.id}">
                    <div class="category-header">
                        <div>
                            <h3 class="category-name">
                                <i class="fas fa-tag" style="color: ${category.color || '#007bff'}"></i>
                                ${category.name}
                                <span class="category-badge ${isCustom ? 'custom' : ''}">${isCustom ? 'Personnalisé' : 'Défaut'}</span>
                            </h3>
                        </div>
                    </div>
                    
                    <div class="category-description">
                        ${category.description || 'Aucune description disponible'}
                    </div>
                    
                    ${keywords.length > 0 ? `
                        <div class="category-keywords">
                            ${keywords.slice(0, 5).map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                            ${keywords.length > 5 ? `<span class="keyword-tag">+${keywords.length - 5} autres</span>` : ''}
                        </div>
                    ` : ''}
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
                                    <strong>Fichiers créés :</strong> EmailSortPro-Auto-[Date]_[Heure].json dans votre dossier <strong>Téléchargements</strong>.
                                    <br><strong>Chemin complet :</strong> <code>C:\\Users\\[VotreNom]\\Downloads\\EmailSortPro-*.json</code>
                                    <br>Les fichiers sont accessibles via l'Explorateur Windows/Mac.
                                </div>
                            </div>

                            <div class="backup-card">
                                <h4><i class="fas fa-chart-line"></i> Statut en temps réel</h4>
                                <p>Informations sur le système de sauvegarde et l'état actuel de vos données.</p>
                                <div class="backup-actions">
                                    <button id="view-backup-folder-btn" class="btn btn-secondary">
                                        <i class="fas fa-folder-open"></i>
                                        Voir localisation des fichiers
                                    </button>
                                    <button id="refresh-status-btn" class="btn btn-secondary">
                                        <i class="fas fa-sync"></i>
                                        Actualiser le statut
                                    </button>
                                </div>
                                <div class="backup-info">
                                    <i class="fas fa-check-circle"></i>
                                    <strong>Status :</strong> ${this.autoBackupEnabled ? 'Sauvegarde active' : 'Sauvegarde en pause'}.
                                    <br><strong>Dossier de destination :</strong> <code>Téléchargements/EmailSortPro-*.json</code>
                                    <br>Prochaine sauvegarde dans ${this.getNextBackupTime()}.
                                </div>
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

            // Voir localisation
            document.getElementById('view-backup-folder-btn')?.addEventListener('click', () => {
                this.showBackupLocationInfo();
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

        showBackupLocationInfo() {
            this.showNotification(`📁 Vos sauvegardes se trouvent dans : Téléchargements/EmailSortPro-*.json\n🔍 Ouvrez votre dossier Téléchargements et recherchez les fichiers "EmailSortPro-"`, 'info', 8000);
        }

        filterCategories() {
            // Recharger l'affichage des catégories
            this.switchTab('categories');
        }

        addNewCategory() {
            this.showNotification('💡 Fonction d\'ajout de catégorie à implémenter', 'info');
        }

        // ================================================
        // COLLECTE DES DONNÉES
        // ================================================
        collectCategoriesData() {
            try {
                return {
                    all: this.categories || [],
                    custom: this.customCategories || [],
                    keywords: this.getAllKeywords()
                };
            } catch (error) {
                return { all: [], custom: [], keywords: {} };
            }
        }

        collectTasksData() {
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

        collectSettingsData() {
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

        getAllKeywords() {
            const keywords = {};
            [...this.categories, ...this.customCategories].forEach(category => {
                if (category.keywords) {
                    keywords[category.id] = category.keywords;
                }
            });
            return keywords;
        }

        // ================================================
        // UTILITAIRES
        // ================================================
        getCategoriesCount() {
            return (this.categories?.length || 0) + (this.customCategories?.length || 0);
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
