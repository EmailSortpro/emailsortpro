/* Header compact */
            .settings-header {
                margin-bottom: 2rem;
            }

            .header-content {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 1.5rem;
                background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                border-radius: var(--radius);
                color: white;
                box-shadow: var(--shadow);
            }

            .header-icon {
                width: 2.5rem;
                height: 2.5rem;
                background: rgba(255, 255, 255, 0.2);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }

            .header-text h1 {
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0 0 0.25rem 0;
            }

            .header-text p {
                font-size: 0.875rem;
                opacity: 0.9;
                margin: 0;
            }

            /* Navigation compacte */
            .settings-navigation {
                margin-bottom: 2rem;
            }

            .nav-container {
                display: flex;
                gap: 0.5rem;
                background: var(--bg-secondary);
                padding: 0.25rem;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
            }

            .nav-item {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                border: none;
                background: none;
                border-radius: 0.25rem;
                cursor: pointer;
                transition: all 0.2s;
                color: var(--text-secondary);
            }

            .nav-item:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }

            .nav-item.active {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .nav-icon {
                width: 2rem;
                height: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }

            .nav-item.active .nav-icon {
                background: rgba(255, 255, 255, 0.2);
            }

            .nav-text {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .nav-title {
                font-weight: 600;
                font-size: 0.875rem;
            }

            .nav-subtitle {
                font-size: 0.75rem;
                opacity: 0.7;
            }

            /* Container principal */
            .settings-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 1.5rem;
                background: var(--bg-primary);
                min-height: 100vh;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            .settings-main {
                background: var(--bg-secondary);
                border-radius: var(--radius);
                box-shadow: var(--shadow);
                overflow: hidden;
            }

            .tab-content {
                display: none;
                padding: 1.5rem;
            }

            .tab-content.active {
                display: block;
            }

            /* Toolbar compact */
            .categories-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .section-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .filter-tabs {
                display: flex;
                gap: 0.25rem;
                background: var(--bg-tertiary);
                padding: 0.25rem;
                border-radius: var(--radius);
            }

            .filter-tab {
                padding: 0.5rem 0.75rem;
                border: none;
                background: none;
                border-radius: 0.25rem;
                cursor: pointer;
                font-size: 0.75rem;
                font-weight: 500;
                color: var(--text-secondary);
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .filter-tab:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .filter-tab.active {
                background: var(--primary);
                color: white;
            }

            .btn-modern {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: var(--radius);
                font-weight: 600;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
            }

            .btn-primary {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .btn-primary:hover {
                background: var(--primary-dark);
                transform: translateY(-1px);
            }

            .btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border);
            }

            .btn-secondary:hover {
                background: var(--bg-secondary);
                border-color: var(--primary);
                color: var(--primary);
            }

            /* États vides compacts */
            .empty-state-compact {
                text-align: center;
                padding: 2rem;
                color: var(--text-secondary);
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }

            .empty-state-mini {
                text-align: center;
                padding: 1rem;
                color: var(--text-secondary);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.875rem;
            }

            /* Responsive */
            @media (max-width: 1024px) {
                .categories-grid {
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                }

                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @media (max-width: 768px) {
                .settings-container {
                    padding: 1rem;
                }

                .header-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 0.75rem;
                }

                .nav-container {
                    flex-direction: column;
                }

                .nav-item {
                    justify-content: center;
                }

                .categories-toolbar {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 1rem;
                }

                .toolbar-center {
                    order: -1;
                }

                .categories-grid {
                    grid-template-columns: 1fr;
                }

                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .category-card-compact {
                    padding: 1rem;
                }

                .category-actions-mini {
                    gap: 0.5rem;
                }

                .action-btn-mini {
                    width: 2rem;
                    height: 2rem;
                }
            }

            @media (max-width: 480px) {
                .tab-content {
                    padding: 1rem;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .filter-tabs {
                    justify-content: center;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// ================================================
// GESTIONNAIRE DE BACKUP V2 AVEC DÉTECTION UTILISATEUR
// ================================================

            .category-card-compact {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 0.75rem;
                transition: all 0.2s ease;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .category-card-compact:hover {
                border-color: var(--category-color);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transform: translateY(-1px);
            }

            .category-card-compact.inactive {
                opacity: 0.6;
                background: var(--bg-tertiary);
            }

            .category-icon-mini {
                width: 2rem;
                height: 2rem;
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                color: white;
                flex-shrink: 0;
            }

            .category-info-compact {
                flex: 1;
                min-width: 0;
            }

            .category-name-mini {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .category-stats-mini {
                font-size: 0.75rem;
                color: var(--text-secondary);
                display: flex;
                gap: 0.5rem;
            }

            .category-actions-mini {
                display: flex;
                gap: 0.25rem;
                flex-shrink: 0;
            }

            .action-btn-mini {
                width: 1.75rem;
                height: 1.75rem;
                border: 1px solid var(--border);
                background: var(--bg-secondary);
                border-radius: 0.25rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                color: var(--text-secondary);
                font-size: 0.75rem;
            }

            .action-btn-mini:hover {
                border-color: var(--primary);
                color: var(--primary);
                transform: scale(1.1);
            }

            .action-btn-mini.active {
                background: var(--success);
                border-color: var(--success);
                color: white;
            }

            .action-btn-mini.inactive {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            .action-btn-mini.selected {
                background: var(--warning);
                border-color: var(--warning);
                color: white;
            }

            .action-btn-mini.danger:hover {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            /* Stats compactes */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .stat-card-mini {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
                text-align: center;
                transition: all 0.2s;
                cursor: pointer;
                border-left: 3px solid var(--stat-color);
            }

            .stat-card-mini:hover {
                border-color: var(--stat-color);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transform: translateY(-1px);
            }

            .stat-card-mini.primary { --stat-color: var(--primary); }
            .stat-card-mini.success { --stat-color: var(--success); }
            .stat-card-mini.warning { --stat-color: var(--warning); }
            .stat-card-mini.info { --stat-color: var(--info); }

            .stat-icon-mini {
                width: 2rem;
                height: 2rem;
                background: var(--stat-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                margin: 0 auto 0.5rem;
            }

            .stat-number-mini {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--stat-color);
                line-height: 1;
                margin-bottom: 0.25rem;
            }

            .stat-label-mini {
                font-size: 0.75rem;
                font-weight: 500;
                color: var(--text-secondary);
            }

            /* Backup compact */
            .backup-status-compact {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
                margin-bottom: 1.5rem;
            }

            .status-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .status-info-compact {
                display: flex;
                align-items: center;
                gap: 1rem;
                font-weight: 500;
            }

            .status-indicator-mini {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
            }

            .details-compact {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .detail-mini {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.75rem;
                color: var(--text-secondary);
            }

            .detail-mini code {
                background: var(--bg-tertiary);
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-size: 0.625rem;
            }

            .backup-actions-compact {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .action-card-mini {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
            }

            .action-card-mini:hover {
                border-color: var(--card-color);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .action-card-mini.primary { --card-color: var(--primary); }
            .action-card-mini.secondary { --card-color: var(--secondary); }
            .action-card-mini.accent { --card-color: var(--info); }

            .card-header-mini {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
            }

            .card-header-mini i {
                width: 2rem;
                height: 2rem;
                background: var(--card-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
            }

            .card-header-mini strong {
                font-size: 0.875rem;
                color: var(--text-primary);
            }

            .card-header-mini small {
                font-size: 0.75rem;
                color: var(--text-secondary);
            }

            .btn-compact {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: var(--radius);
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                white-space: nowrap;
            }

            .btn-compact.btn-primary {
                background: var(--primary);
                color: white;
            }

            .btn-compact.btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border);
            }

            .btn-compact.btn-accent {
                background: var(--info);
                color: white;
            }

            .btn-compact:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            /* Historique compact */
            .backup-history-compact {
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                padding: 1rem;
            }

            .history-header-mini {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                font-size: 0.875rem;
            }

            .btn-mini {
                width: 2rem;
                height: 2rem;
                border: 1px solid var(--border);
                background: var(--bg-secondary);
                border-radius: 0.25rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                color: var(--text-secondary);
                transition: all 0.2s;
            }

            .btn-mini:hover {
                border-color: var(--primary);
                color: var(--primary);
            }

            .history-list-compact {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .history-item-mini {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 0.75rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
            }

            .history-item-mini:hover {
                border-color: var(--primary);
            }

            .history-info-mini {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
                min-width: 0;
            }

            .history-info-mini i {
                color: var(--primary);
                font-size: 1rem;
            }

            .history-name-mini {
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--text-primary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .history-meta-mini {
                font-size: 0.625rem;
                color: var(--text-secondary);
            }

            .history-actions-mini {
                display: flex;
                gap: 0.25rem;
            }

            .btn-icon-mini {
                width: 1.5rem;
                height: 1.5rem;
                border: 1px solid var(--border);
                background: var(--bg-secondary);
                border-radius: 0.25rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.625rem;
                color: var(--text-secondary);
                transition: all 0.2s;
            }

            .btn-icon-mini:hover {
                border-color: var(--primary);
                color: var(--primary);
            }

            .btn-icon-mini.danger:hover {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            /* États vides compacts */
            .empty-state-compact {
                text-align: center;
                padding: 2rem;
                color: var(--text-secondary);
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }

            .empty-state-mini {
                text-align: center;
                padding: 1rem;
                color: var(--text-secondary);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.875rem;
            }

            /* Toolbar compact */
            .categories-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .section-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .filter-tabs {
                display: flex;
                gap: 0.25rem;
                background: var(--bg-tertiary);
                padding: 0.25rem;
                border-radius: var(--radius);
            }

            .filter-tab {
                padding: 0.5rem 0.75rem;
                border: none;
                background: none;
                border-radius: 0.25rem;
                cursor: pointer;
                font-size: 0.75rem;
                font-weight: 500;
                color: var(--text-secondary);
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .filter-tab:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .filter-tab.active {
                background: var(--primary);
                color: white;
            }

            /* Instructions modales */
            .modal-instructions {
                max-width: 700px;
            }

            .instructions-content {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .step-card {
                display: flex;
                gap: 1rem;
                padding: 1rem;
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                border-left: 3px solid var(--primary);
            }

            .step-number {
                width: 2rem;
                height: 2rem;
                background: var(--primary);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                flex-shrink: 0;
            }

            .step-content h4 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--text-primary);
            }

            .step-content p {
                margin: 0;
                font-size: 0.875rem;
                color: var(--text-secondary);
                line-height: 1.4;
            }

            .path-display {
                display: flex;
                gap: 0.5rem;
                align-items: center;
                margin-top: 0.5rem;
                padding: 0.5rem;
                background: var(--bg-secondary);
                border-radius: 0.25rem;
                border: 1px solid var(--border);
            }

            .path-display code {
                flex: 1;
                background: none;
                border: none;
                font-size: 0.75rem;
                word-break: break-all;
            }

            .btn-copy-path {
                padding: 0.25rem 0.5rem;
                border: 1px solid var(--border);
                background: var(--bg-tertiary);
                border-radius: 0.25rem;
                cursor: pointer;
                font-size: 0.625rem;
                transition: all 0.2s;
            }

            .btn-copy-path:hover {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .tips-section {
                background: var(--info)10;
                border: 1px solid var(--info)30;
                border-radius: var(--radius);
                padding: 1rem;
            }

            .tips-section h4 {
                margin: 0 0 0.5rem 0;
                color: var(--info);
                font-size: 0.875rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .folder-instructions {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .step-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }

            .step-item {
                font-size: 0.875rem;
                color: var(--text-secondary);
                display: flex;
                gap: 0.5rem;
            }

            .alternative-method {
                margin-top: 1rem;
                padding: 0.75rem;
                background: var(--warning)10;
                border-radius: 0.25rem;
                font-size: 0.875rem;
                color: var(--warning);
            }

            .note-section {
                background: var(--success)10;
                border: 1px solid var(--success)30;
                border-radius: var(--radius);
                padding: 1rem;
            }

            .note-section p// SettingsPage.js - Version 2.0 Moderne et Fonctionnelle
console.log('[SettingsPage] 🚀 Loading SettingsPage v2.0...');

// Nettoyer toute instance précédente
if (window.settingsPage) {
    console.log('[SettingsPage] 🧹 Nettoyage instance précédente...');
    delete window.settingsPage;
}

class SettingsPageV2 {
    constructor() {
        this.currentTab = 'categories';
        this.currentFilter = 'all';
        this.backupManager = new BackupManagerV2();
        this.editingCategoryId = null;
        this.currentModal = null;
        this.colors = [
            '#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
            '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899',
            '#64748b', '#dc2626', '#ea580c', '#059669', '#0284c7'
        ];
        this.icons = [
            '📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌',
            '💰', '🛒', '👤', '📱', '🔧', '🎨', '📚', '🎵', '🍕', '✈️'
        ];
        
        this.initializeEventListeners();
        console.log('[SettingsPage] ✅ Interface v2.0 initialisée');
    }

    // ================================================
    // RENDU PRINCIPAL
    // ================================================
    render(container) {
        if (!container) {
            console.error('[SettingsPage] ❌ Container manquant');
            return;
        }

        console.log('[SettingsPage] 🎨 Rendu de la page de paramètres...');

        try {
            container.innerHTML = this.renderMainStructure();
            this.addModernStyles();
            this.initializeComponents();
            console.log('[SettingsPage] ✅ Page de paramètres rendue avec succès');
            
        } catch (error) {
            console.error('[SettingsPage] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError();
        }
    }

    renderMainStructure() {
        return `
            <div class="settings-container">
                <!-- Header moderne -->
                <div class="settings-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-cog"></i>
                        </div>
                        <div class="header-text">
                            <h1>Paramètres</h1>
                            <p>Configurez vos catégories et gérez vos sauvegardes</p>
                        </div>
                    </div>
                </div>

                <!-- Navigation moderne -->
                <div class="settings-navigation">
                    <div class="nav-container">
                        <button class="nav-item active" data-tab="categories" onclick="window.settingsPage.switchTab('categories')">
                            <div class="nav-icon">
                                <i class="fas fa-tags"></i>
                            </div>
                            <div class="nav-text">
                                <span class="nav-title">Catégories</span>
                                <span class="nav-subtitle">Gérer vos catégories</span>
                            </div>
                        </button>
                        
                        <button class="nav-item" data-tab="backup" onclick="window.settingsPage.switchTab('backup')">
                            <div class="nav-icon">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <div class="nav-text">
                                <span class="nav-title">Sauvegarde</span>
                                <span class="nav-subtitle">Backup & restauration</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="settings-main">
                    <!-- Onglet Catégories -->
                    <div id="categories-content" class="tab-content active">
                        ${this.renderCategoriesContent()}
                    </div>

                    <!-- Onglet Backup -->
                    <div id="backup-content" class="tab-content">
                        ${this.renderBackupContent()}
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // CONTENU CATÉGORIES
    // ================================================
    renderCategoriesContent() {
        return `
            <!-- Dashboard Stats -->
            <div class="stats-dashboard">
                <div class="stats-grid" id="categories-stats">
                    ${this.renderCategoriesStats()}
                </div>
            </div>

            <!-- Actions et filtres -->
            <div class="categories-toolbar">
                <div class="toolbar-left">
                    <h2 class="section-title">
                        <i class="fas fa-layer-group"></i>
                        Mes catégories
                    </h2>
                </div>
                
                <div class="toolbar-center">
                    <div class="filter-tabs">
                        <button class="filter-tab active" data-filter="all" onclick="window.settingsPage.filterCategories('all')">
                            <i class="fas fa-list"></i>
                            Toutes
                        </button>
                        <button class="filter-tab" data-filter="custom" onclick="window.settingsPage.filterCategories('custom')">
                            <i class="fas fa-user"></i>
                            Personnalisées
                        </button>
                        <button class="filter-tab" data-filter="active" onclick="window.settingsPage.filterCategories('active')">
                            <i class="fas fa-toggle-on"></i>
                            Actives
                        </button>
                    </div>
                </div>
                
                <div class="toolbar-right">
                    <button class="btn-modern btn-secondary" onclick="window.settingsPage.exportCategories()">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                    <button class="btn-modern btn-primary" onclick="window.settingsPage.showCreateCategoryModal()">
                        <i class="fas fa-plus"></i>
                        Nouvelle catégorie
                    </button>
                </div>
            </div>

            <!-- Grille des catégories -->
            <div class="categories-container">
                <div class="categories-grid" id="categories-grid">
                    ${this.renderCategoriesGrid()}
                </div>
            </div>
        `;
    }

    renderCategoriesStats() {
        const categories = this.getCategories();
        const stats = this.calculateStats(categories);
        
        return `
            <div class="stat-card-mini primary" onclick="window.settingsPage.filterCategories('all')">
                <div class="stat-icon-mini">
                    <i class="fas fa-tags"></i>
                </div>
                <div class="stat-content-mini">
                    <div class="stat-number-mini">${stats.total}</div>
                    <div class="stat-label-mini">Total</div>
                </div>
            </div>

            <div class="stat-card-mini success" onclick="window.settingsPage.filterCategories('active')">
                <div class="stat-icon-mini">
                    <i class="fas fa-toggle-on"></i>
                </div>
                <div class="stat-content-mini">
                    <div class="stat-number-mini">${stats.active}</div>
                    <div class="stat-label-mini">Actives</div>
                </div>
            </div>

            <div class="stat-card-mini warning">
                <div class="stat-icon-mini">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-content-mini">
                    <div class="stat-number-mini">${stats.preselected}</div>
                    <div class="stat-label-mini">Pré-sélect.</div>
                </div>
            </div>

            <div class="stat-card-mini info">
                <div class="stat-icon-mini">
                    <i class="fas fa-user"></i>
                </div>
                <div class="stat-content-mini">
                    <div class="stat-number-mini">${stats.custom}</div>
                    <div class="stat-label-mini">Perso.</div>
                </div>
            </div>
        `;
    }

    renderCategoriesGrid() {
        const categories = this.getCategories();
        const settings = this.loadSettings();
        
        if (Object.keys(categories).length === 0) {
            return `
                <div class="empty-state-compact">
                    <i class="fas fa-folder-open"></i>
                    <span>Aucune catégorie</span>
                    <button class="btn-compact btn-primary" onclick="window.settingsPage.showCreateCategoryModal()">
                        <i class="fas fa-plus"></i>
                        Créer
                    </button>
                </div>
            `;
        }

        return Object.entries(categories)
            .filter(([id, category]) => this.shouldShowCategory(category))
            .map(([id, category]) => {
                const isActive = settings.activeCategories?.includes(id) ?? true;
                const isPreselected = settings.preselectedCategories?.includes(id) ?? false;
                const stats = this.getCategoryStats(id);
                
                return `
                    <div class="category-card-compact ${!isActive ? 'inactive' : ''}" 
                         style="--category-color: ${category.color}"
                         onclick="window.settingsPage.toggleCategorySelection('${id}')">
                        
                        <div class="category-icon-mini" style="background: ${category.color}">
                            ${category.icon || '📁'}
                        </div>
                        
                        <div class="category-info-compact">
                            <div class="category-name-mini">${category.name}</div>
                            <div class="category-stats-mini">
                                ${stats.emails}📧 ${stats.keywords}🔑
                                ${isPreselected ? ' ⭐' : ''}
                                ${category.isCustom ? ' 👤' : ''}
                            </div>
                        </div>

                        <div class="category-actions-mini" onclick="event.stopPropagation()">
                            <button class="action-btn-mini ${isActive ? 'active' : 'inactive'}" 
                                    onclick="window.settingsPage.toggleCategory('${id}')"
                                    title="${isActive ? 'Désactiver' : 'Activer'}">
                                <i class="fas fa-${isActive ? 'toggle-on' : 'toggle-off'}"></i>
                            </button>
                            
                            <button class="action-btn-mini ${isPreselected ? 'selected' : ''}" 
                                    onclick="window.settingsPage.togglePreselection('${id}')"
                                    title="Pré-sélection">
                                <i class="fas fa-star"></i>
                            </button>
                            
                            <button class="action-btn-mini" 
                                    onclick="window.settingsPage.editCategory('${id}')"
                                    title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            
                            ${category.isCustom ? `
                                <button class="action-btn-mini danger" 
                                        onclick="window.settingsPage.deleteCategory('${id}')"
                                        title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
    }

    // ================================================
    // CONTENU BACKUP
    // ================================================
    renderBackupContent() {
        return `
            <!-- Status compact -->
            <div class="backup-status-compact">
                <div class="status-row">
                    <div class="status-info-compact">
                        <i class="fas fa-shield-alt"></i>
                        <span>Système de sauvegarde</span>
                        <div class="status-indicator-mini" id="backup-status">
                            <span class="status-dot loading"></span>
                            <span>Init...</span>
                        </div>
                    </div>
                    <div class="status-details-compact" id="backup-details">
                        <!-- Sera rempli par JS -->
                    </div>
                </div>
            </div>

            <!-- Actions compactes -->
            <div class="backup-actions-compact">
                <div class="action-card-mini primary">
                    <div class="card-header-mini">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <div>
                            <strong>Sauvegarde complète</strong>
                            <small>Toutes vos données</small>
                        </div>
                    </div>
                    <button class="btn-compact btn-primary" onclick="window.settingsPage.createFullBackup()" id="backup-btn">
                        <i class="fas fa-save"></i>
                        Créer
                    </button>
                </div>

                <div class="action-card-mini secondary">
                    <div class="card-header-mini">
                        <i class="fas fa-file-import"></i>
                        <div>
                            <strong>Restauration</strong>
                            <small>Importer fichier JSON</small>
                        </div>
                    </div>
                    <button class="btn-compact btn-secondary" onclick="window.settingsPage.importBackup()">
                        <i class="fas fa-upload"></i>
                        Importer
                    </button>
                </div>

                <div class="action-card-mini accent">
                    <div class="card-header-mini">
                        <i class="fas fa-folder-open"></i>
                        <div>
                            <strong>Ouvrir dossier</strong>
                            <small>Dossier de sauvegarde</small>
                        </div>
                    </div>
                    <button class="btn-compact btn-accent" onclick="window.settingsPage.openBackupFolder()">
                        <i class="fas fa-external-link-alt"></i>
                        Ouvrir
                    </button>
                </div>
            </div>

            <!-- Historique compact -->
            <div class="backup-history-compact">
                <div class="history-header-mini">
                    <strong><i class="fas fa-history"></i> Historique</strong>
                    <button class="btn-mini" onclick="window.settingsPage.refreshBackupHistory()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="history-list-compact" id="backup-history">
                    ${this.renderBackupHistoryCompact()}
                </div>
            </div>
        `;
    }

    renderBackupHistoryCompact() {
        const history = this.backupManager.getHistory();
        
        if (history.length === 0) {
            return `
                <div class="empty-state-mini">
                    <i class="fas fa-clock"></i>
                    <span>Aucune sauvegarde</span>
                </div>
            `;
        }

        return history.slice(0, 5).map(backup => `
            <div class="history-item-mini">
                <div class="history-info-mini">
                    <i class="fas fa-file-archive"></i>
                    <div>
                        <div class="history-name-mini">${backup.name.substring(0, 30)}...</div>
                        <div class="history-meta-mini">
                            ${new Date(backup.date).toLocaleDateString('fr-FR')} • ${this.formatFileSize(backup.size)}
                        </div>
                    </div>
                </div>
                <div class="history-actions-mini">
                    <button class="btn-icon-mini" onclick="window.settingsPage.downloadBackup('${backup.id}')" title="Télécharger">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon-mini danger" onclick="window.settingsPage.deleteBackupRecord('${backup.id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tabName) {
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });

        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });

        this.currentTab = tabName;

        // Actions spécifiques
        if (tabName === 'backup') {
            this.initializeBackup();
        }
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    filterCategories(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour les boutons de filtre
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        // Re-rendre la grille
        this.refreshCategoriesGrid();
    }

    shouldShowCategory(category) {
        const settings = this.loadSettings();
        
        switch (this.currentFilter) {
            case 'custom':
                return category.isCustom;
            case 'active':
                return settings.activeCategories?.includes(category.id) ?? true;
            case 'preselected':
                return settings.preselectedCategories?.includes(category.id) ?? false;
            default:
                return true;
        }
    }

    toggleCategory(categoryId) {
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories || [];
        
        if (activeCategories.includes(categoryId)) {
            activeCategories = activeCategories.filter(id => id !== categoryId);
            this.showToast('Catégorie désactivée', 'info');
        } else {
            activeCategories.push(categoryId);
            this.showToast('Catégorie activée', 'success');
        }
        
        settings.activeCategories = activeCategories;
        this.saveSettings(settings);
        this.refreshCategoriesGrid();
        this.refreshStats();
    }

    togglePreselection(categoryId) {
        const settings = this.loadSettings();
        let preselectedCategories = settings.preselectedCategories || [];
        
        if (preselectedCategories.includes(categoryId)) {
            preselectedCategories = preselectedCategories.filter(id => id !== categoryId);
            this.showToast('Pré-sélection supprimée', 'info');
        } else {
            preselectedCategories.push(categoryId);
            this.showToast('Catégorie pré-sélectionnée', 'success');
        }
        
        settings.preselectedCategories = preselectedCategories;
        this.saveSettings(settings);
        this.refreshCategoriesGrid();
        this.refreshStats();
    }

    toggleCategorySelection(categoryId) {
        // Toggle de sélection visuelle (pour les interactions rapides)
        const card = document.querySelector(`[onclick*="${categoryId}"]`);
        if (card) {
            card.classList.toggle('selected');
        }
    }

    editCategory(categoryId) {
        const category = this.getCategory(categoryId);
        if (!category) {
            this.showToast('Catégorie introuvable', 'error');
            return;
        }

        this.showEditCategoryModal(category);
    }

    deleteCategory(categoryId) {
        const category = this.getCategory(categoryId);
        if (!category || !category.isCustom) return;

        if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\nCette action est irréversible.`)) {
            // Supprimer via CategoryManager si disponible
            if (window.categoryManager?.deleteCustomCategory) {
                window.categoryManager.deleteCustomCategory(categoryId);
            }
            
            // Nettoyer les paramètres
            const settings = this.loadSettings();
            settings.activeCategories = settings.activeCategories?.filter(id => id !== categoryId) || [];
            settings.preselectedCategories = settings.preselectedCategories?.filter(id => id !== categoryId) || [];
            this.saveSettings(settings);

            this.refreshCategoriesGrid();
            this.refreshStats();
            this.showToast('Catégorie supprimée', 'success');
        }
    }

    // ================================================
    // MODALS
    // ================================================
    showCreateCategoryModal() {
        const modal = this.createModal('Nouvelle catégorie', this.renderCreateCategoryForm());
        document.body.appendChild(modal);
    }

    renderCreateCategoryForm() {
        return `
            <div class="form-modern">
                <div class="form-group">
                    <label class="form-label">Nom de la catégorie</label>
                    <input type="text" class="form-input" id="category-name" 
                           placeholder="Ex: Factures, Newsletter, Projets..." 
                           autocomplete="off">
                </div>

                <div class="form-group">
                    <label class="form-label">Icône</label>
                    <div class="icon-grid">
                        ${this.icons.map((icon, i) => `
                            <button type="button" class="icon-option ${i === 0 ? 'selected' : ''}" 
                                    onclick="window.settingsPage.selectIcon('${icon}', this)">
                                ${icon}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Couleur</label>
                    <div class="color-grid">
                        ${this.colors.map((color, i) => `
                            <button type="button" class="color-option ${i === 0 ? 'selected' : ''}" 
                                    style="background: ${color}"
                                    onclick="window.settingsPage.selectColor('${color}', this)">
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-modern btn-secondary" onclick="window.settingsPage.closeModal()">
                    <i class="fas fa-times"></i>
                    Annuler
                </button>
                <button class="btn-modern btn-primary" onclick="window.settingsPage.saveNewCategory()">
                    <i class="fas fa-save"></i>
                    Créer la catégorie
                </button>
            </div>
        `;
    }

    showEditCategoryModal(category) {
        const modal = this.createModal(`Éditer "${category.name}"`, this.renderEditCategoryForm(category));
        document.body.appendChild(modal);
        this.editingCategoryId = category.id;
    }

    renderEditCategoryForm(category) {
        const keywords = this.getCategoryKeywords(category.id);
        
        return `
            <div class="edit-tabs">
                <button class="edit-tab active" data-tab="info" onclick="window.settingsPage.switchEditTab('info')">
                    <i class="fas fa-info-circle"></i>
                    Informations
                </button>
                <button class="edit-tab" data-tab="keywords" onclick="window.settingsPage.switchEditTab('keywords')">
                    <i class="fas fa-key"></i>
                    Mots-clés
                </button>
            </div>

            <div class="edit-content">
                <!-- Onglet Informations -->
                <div class="edit-panel active" id="edit-info">
                    <div class="form-modern">
                        <div class="form-group">
                            <label class="form-label">Nom de la catégorie</label>
                            <input type="text" class="form-input" id="edit-category-name" 
                                   value="${category.name}" ${!category.isCustom ? 'disabled' : ''}>
                        </div>

                        ${category.isCustom ? `
                            <div class="form-group">
                                <label class="form-label">Icône</label>
                                <div class="icon-grid">
                                    ${this.icons.map(icon => `
                                        <button type="button" class="icon-option ${icon === category.icon ? 'selected' : ''}" 
                                                onclick="window.settingsPage.selectIcon('${icon}', this)">
                                            ${icon}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Couleur</label>
                                <div class="color-grid">
                                    ${this.colors.map(color => `
                                        <button type="button" class="color-option ${color === category.color ? 'selected' : ''}" 
                                                style="background: ${color}"
                                                onclick="window.settingsPage.selectColor('${color}', this)">
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Onglet Mots-clés -->
                <div class="edit-panel" id="edit-keywords">
                    ${this.renderKeywordsEditor(keywords)}
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-modern btn-secondary" onclick="window.settingsPage.closeModal()">
                    <i class="fas fa-times"></i>
                    Annuler
                </button>
                <button class="btn-modern btn-primary" onclick="window.settingsPage.saveEditedCategory()">
                    <i class="fas fa-save"></i>
                    Enregistrer
                </button>
            </div>
        `;
    }

    renderKeywordsEditor(keywords) {
        return `
            <div class="keywords-editor">
                <div class="keywords-section">
                    <h4><i class="fas fa-star" style="color: #ef4444"></i> Mots-clés absolus</h4>
                    <p class="section-desc">Déclenchent automatiquement cette catégorie</p>
                    <div class="keyword-input-group">
                        <input type="text" class="keyword-input" placeholder="Ajouter un mot-clé..." 
                               onkeypress="if(event.key==='Enter') window.settingsPage.addKeyword('absolute', this)">
                        <button class="btn-add" onclick="window.settingsPage.addKeyword('absolute', this.previousElementSibling)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="keywords-list" id="absolute-keywords">
                        ${(keywords.absolute || []).map(kw => `
                            <span class="keyword-tag absolute" data-keyword="${kw}">
                                ${kw}
                                <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="keywords-section">
                    <h4><i class="fas fa-bolt" style="color: #f97316"></i> Mots-clés forts</h4>
                    <p class="section-desc">Ont un poids important dans la classification</p>
                    <div class="keyword-input-group">
                        <input type="text" class="keyword-input" placeholder="Ajouter un mot-clé..." 
                               onkeypress="if(event.key==='Enter') window.settingsPage.addKeyword('strong', this)">
                        <button class="btn-add" onclick="window.settingsPage.addKeyword('strong', this.previousElementSibling)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="keywords-list" id="strong-keywords">
                        ${(keywords.strong || []).map(kw => `
                            <span class="keyword-tag strong" data-keyword="${kw}">
                                ${kw}
                                <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="keywords-section">
                    <h4><i class="fas fa-feather" style="color: #3b82f6"></i> Mots-clés faibles</h4>
                    <p class="section-desc">Ont un poids modéré dans la classification</p>
                    <div class="keyword-input-group">
                        <input type="text" class="keyword-input" placeholder="Ajouter un mot-clé..." 
                               onkeypress="if(event.key==='Enter') window.settingsPage.addKeyword('weak', this)">
                        <button class="btn-add" onclick="window.settingsPage.addKeyword('weak', this.previousElementSibling)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="keywords-list" id="weak-keywords">
                        ${(keywords.weak || []).map(kw => `
                            <span class="keyword-tag weak" data-keyword="${kw}">
                                ${kw}
                                <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-modern">
                <div class="modal-header">
                    <h2><i class="fas fa-cog"></i> ${title}</h2>
                    <button class="btn-close" onclick="window.settingsPage.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
        this.currentModal = null;
        this.editingCategoryId = null;
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================
    async initializeBackup() {
        try {
            this.updateBackupStatus('loading', 'Initialisation...');
            await this.backupManager.initialize();
            this.updateBackupStatus('ready', 'Système opérationnel');
            this.updateBackupDetails();
        } catch (error) {
            console.error('[SettingsPage] Erreur backup:', error);
            this.updateBackupStatus('error', 'Erreur de configuration');
        }
    }

    updateBackupStatus(status, message) {
        const statusEl = document.getElementById('backup-status');
        if (!statusEl) return;

        const icons = {
            loading: 'loading',
            ready: 'ready',
            error: 'error'
        };

        statusEl.innerHTML = `
            <span class="status-dot ${icons[status]}"></span>
            <span>${message}</span>
        `;
    }

    updateBackupDetails() {
        const detailsEl = document.getElementById('backup-details');
        if (!detailsEl) return;

        const username = this.backupManager.getUsername() || 'utilisateur';
        const backupPath = this.backupManager.getBackupPath() || 'Dossier de téléchargement';

        detailsEl.innerHTML = `
            <div class="details-compact">
                <div class="detail-mini">
                    <i class="fas fa-user"></i>
                    <span>Utilisateur: <strong>${username}</strong></span>
                </div>
                <div class="detail-mini">
                    <i class="fas fa-folder"></i>
                    <span>Dossier: <code>${backupPath}</code></span>
                </div>
                <div class="detail-mini">
                    <i class="fas fa-shield-alt"></i>
                    <span>100% local et sécurisé</span>
                </div>
            </div>
        `;
    }

    openBackupFolder() {
        const backupPath = this.backupManager.getBackupPath();
        const username = this.backupManager.getUsername();
        
        if (!backupPath || !username) {
            this.showToast('Chemin de sauvegarde non configuré', 'warning');
            return;
        }

        // Créer une modal avec instructions pour ouvrir le dossier
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-modern">
                <div class="modal-header">
                    <h2><i class="fas fa-folder-open"></i> Ouvrir le dossier de sauvegarde</h2>
                    <button class="btn-close" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="folder-instructions">
                        <div class="path-section">
                            <h4>📁 Chemin du dossier</h4>
                            <div class="path-display">
                                <code>${backupPath}</code>
                                <button class="btn-copy-path" onclick="navigator.clipboard.writeText('${backupPath.replace(/\\/g, '\\\\')}'); this.innerHTML='✅ Copié!'">
                                    📋 Copier
                                </button>
                            </div>
                        </div>

                        <div class="instructions-steps">
                            <h4>🔍 Comment y accéder :</h4>
                            <div class="step-list">
                                <div class="step-item">
                                    <strong>1.</strong> Appuyez sur <kbd>Win + R</kbd>
                                </div>
                                <div class="step-item">
                                    <strong>2.</strong> Collez le chemin ci-dessus
                                </div>
                                <div class="step-item">
                                    <strong>3.</strong> Appuyez sur <kbd>Entrée</kbd>
                                </div>
                            </div>
                            
                            <div class="alternative-method">
                                <strong>Ou :</strong> Ouvrez l'Explorateur de fichiers → Documents → Créez "MailSort Pro"
                            </div>
                        </div>

                        <div class="note-section">
                            <p><i class="fas fa-info-circle"></i> <strong>Note :</strong> Si le dossier n'existe pas, créez-le manuellement. Les sauvegardes futures y seront automatiquement suggérées.</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-modern btn-primary" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-check"></i>
                        Compris
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async createFullBackup() {
        const btn = document.getElementById('backup-btn');
        const originalContent = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
        btn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation

            const backupData = await this.backupManager.createBackup();
            this.refreshBackupHistory();
            this.showToast('Sauvegarde créée avec succès!', 'success');
            
        } catch (error) {
            console.error('[SettingsPage] Erreur backup:', error);
            this.showToast('Erreur lors de la création de la sauvegarde', 'error');
        } finally {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    }

    async importBackup() {
        try {
            const file = await this.selectFile('.json');
            if (!file) return;

            const text = await file.text();
            const data = JSON.parse(text);

            if (this.validateBackupData(data)) {
                await this.restoreFromBackup(data);
                this.showToast('Sauvegarde importée avec succès!', 'success');
                setTimeout(() => location.reload(), 2000);
            } else {
                this.showToast('Fichier de sauvegarde invalide', 'error');
            }
        } catch (error) {
            console.error('[SettingsPage] Erreur import:', error);
            this.showToast('Erreur lors de l\'import', 'error');
        }
    }

    configureAutoBackup() {
        this.showToast('Fonctionnalité en développement', 'info');
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    getCategories() {
        return window.categoryManager?.getCategories() || {
            'factures': {
                id: 'factures',
                name: 'Factures',
                icon: '💰',
                color: '#ef4444',
                isCustom: false
            },
            'newsletters': {
                id: 'newsletters',
                name: 'Newsletters',
                icon: '📧',
                color: '#3b82f6',
                isCustom: false
            },
            'work': {
                id: 'work',
                name: 'Travail',
                icon: '💼',
                color: '#10b981',
                isCustom: true
            }
        };
    }

    getCategory(id) {
        const categories = this.getCategories();
        return categories[id];
    }

    getCategoryKeywords(categoryId) {
        return window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
    }

    calculateStats(categories) {
        const settings = this.loadSettings();
        const total = Object.keys(categories).length;
        const custom = Object.values(categories).filter(cat => cat.isCustom).length;
        const active = settings.activeCategories?.length || total;
        const preselected = settings.preselectedCategories?.length || 0;
        const emails = Math.floor(Math.random() * 3000 + 1000); // Simulation

        return { total, custom, active, preselected, emails };
    }

    getCategoryStats(categoryId) {
        return {
            emails: Math.floor(Math.random() * 200 + 10),
            keywords: Math.floor(Math.random() * 15 + 3)
        };
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('mailsort-settings');
            return saved ? JSON.parse(saved) : {
                activeCategories: null,
                preselectedCategories: []
            };
        } catch (error) {
            return { activeCategories: null, preselectedCategories: [] };
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('mailsort-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('[SettingsPage] Erreur sauvegarde:', error);
        }
    }

    refreshCategoriesGrid() {
        const grid = document.getElementById('categories-grid');
        if (grid) {
            grid.innerHTML = this.renderCategoriesGrid();
        }
    }

    refreshStats() {
        const stats = document.getElementById('categories-stats');
        if (stats) {
            stats.innerHTML = this.renderCategoriesStats();
        }
    }

    refreshBackupHistory() {
        const history = document.getElementById('backup-history');
        if (history) {
            history.innerHTML = this.renderBackupHistory();
        }
    }

    selectFile(accept) {
        return new Promise(resolve => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.onchange = e => resolve(e.target.files[0]);
            input.click();
        });
    }

    validateBackupData(data) {
        return data && 
               typeof data === 'object' && 
               data.timestamp && 
               data.version && 
               (data.categories || data.settings);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-modern ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            </div>
            <div class="toast-content">${message}</div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    renderError() {
        return `
            <div style="padding: 3rem; text-align: center; color: #ef4444; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.75rem; padding: 2rem; max-width: 500px; margin: 0 auto;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h2 style="margin: 0 0 1rem 0; color: #dc2626; font-size: 1.5rem;">Erreur de chargement</h2>
                    <p style="margin: 0 0 1.5rem 0; color: #7f1d1d; line-height: 1.6;">
                        Une erreur est survenue lors du chargement de la page de paramètres. 
                        Cela peut être dû à un problème de compatibilité ou de ressources.
                    </p>
                    <button onclick="location.reload()" 
                            style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; 
                                   border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                        🔄 Recharger la page
                    </button>
                    <div style="margin-top: 1rem; font-size: 0.75rem; color: #991b1b;">
                        Si le problème persiste, vérifiez la console pour plus de détails.
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS MODAL
    // ================================================
    selectIcon(icon, element) {
        document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedIcon = icon;
    }

    selectColor(color, element) {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedColor = color;
    }

    saveNewCategory() {
        const name = document.getElementById('category-name')?.value?.trim();
        if (!name) {
            this.showToast('Le nom de la catégorie est requis', 'error');
            return;
        }

        const categoryData = {
            name,
            icon: this.selectedIcon || '📁',
            color: this.selectedColor || this.colors[0],
            isCustom: true,
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };

        // Créer via CategoryManager si disponible
        if (window.categoryManager?.createCustomCategory) {
            window.categoryManager.createCustomCategory(categoryData);
        }

        this.closeModal();
        this.refreshCategoriesGrid();
        this.refreshStats();
        this.showToast('Catégorie créée avec succès!', 'success');
    }

    switchEditTab(tabName) {
        document.querySelectorAll('.edit-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.querySelectorAll('.edit-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `edit-${tabName}`);
        });
    }

    addKeyword(type, input) {
        const keyword = input.value.trim();
        if (!keyword) return;

        const list = document.getElementById(`${type}-keywords`);
        if (!list) return;

        // Vérifier les doublons
        const existing = list.querySelector(`[data-keyword="${keyword}"]`);
        if (existing) {
            this.showToast('Ce mot-clé existe déjà', 'warning');
            return;
        }

        // Ajouter le mot-clé
        const tag = document.createElement('span');
        tag.className = `keyword-tag ${type}`;
        tag.setAttribute('data-keyword', keyword);
        tag.innerHTML = `
            ${keyword}
            <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;

        list.appendChild(tag);
        input.value = '';
        input.focus();
    }

    saveEditedCategory() {
        if (!this.editingCategoryId) return;

        const category = this.getCategory(this.editingCategoryId);
        if (!category) return;

        // Sauvegarder les modifications de base
        if (category.isCustom) {
            const name = document.getElementById('edit-category-name')?.value?.trim();
            if (name && name !== category.name) {
                category.name = name;
            }
            if (this.selectedIcon) category.icon = this.selectedIcon;
            if (this.selectedColor) category.color = this.selectedColor;
        }

        // Sauvegarder les mots-clés
        const keywords = {
            absolute: this.collectKeywords('absolute-keywords'),
            strong: this.collectKeywords('strong-keywords'),
            weak: this.collectKeywords('weak-keywords'),
            exclusions: []
        };

        // Mettre à jour via CategoryManager si disponible
        if (window.categoryManager) {
            if (window.categoryManager.updateCategoryKeywords) {
                window.categoryManager.updateCategoryKeywords(this.editingCategoryId, keywords);
            }
        }

        this.closeModal();
        this.refreshCategoriesGrid();
        this.showToast('Catégorie mise à jour!', 'success');
    }

    collectKeywords(listId) {
        const list = document.getElementById(listId);
        if (!list) return [];

        return Array.from(list.querySelectorAll('.keyword-tag'))
            .map(tag => tag.getAttribute('data-keyword'))
            .filter(Boolean);
    }

    exportCategories() {
        const categories = this.getCategories();
        const settings = this.loadSettings();
        
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            categories,
            settings,
            metadata: {
                exportedAt: new Date().toISOString(),
                application: 'MailSort Pro v2.0'
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mailsort-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Export réalisé avec succès!', 'success');
    }

    deleteBackupRecord(backupId) {
        if (confirm('Supprimer cette entrée de l\'historique ?')) {
            this.backupManager.deleteBackup(backupId);
            this.refreshBackupHistory();
            this.showToast('Entrée supprimée', 'info');
        }
    }

    downloadBackup(backupId) {
        this.showToast('Téléchargement en cours...', 'info');
    }

    // ================================================
    // INITIALISATION
    // ================================================
    initializeComponents() {
        this.refreshStats();
        this.refreshCategoriesGrid();
        this.selectedIcon = this.icons[0];
        this.selectedColor = this.colors[0];
    }

    initializeEventListeners() {
        // Écouter les changements de catégories
        window.addEventListener('categoryChanged', () => {
            this.refreshCategoriesGrid();
            this.refreshStats();
        });

        // Fermeture des modals avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // ================================================
    // STYLES MODERNES
    // ================================================
    addModernStyles() {
        if (document.getElementById('settingsPageStylesV2')) return;

        const styles = document.createElement('style');
        styles.id = 'settingsPageStylesV2';
        styles.textContent = `
            :root {
                --primary: #6366f1;
                --primary-light: #a5b4fc;
                --primary-dark: #4f46e5;
                --secondary: #64748b;
                --success: #10b981;
                --warning: #f59e0b;
                --danger: #ef4444;
                --info: #3b82f6;
                --bg-primary: #fafbff;
                --bg-secondary: #ffffff;
                --bg-tertiary: #f1f5f9;
                --text-primary: #0f172a;
                --text-secondary: #475569;
                --text-muted: #94a3b8;
                --border: #e2e8f0;
                --border-light: #f1f5f9;
                --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                --radius: 12px;
                --radius-lg: 16px;
                --radius-xl: 20px;
            }

            .settings-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 2rem;
                background: var(--bg-primary);
                min-height: 100vh;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            /* Header moderne */
            .settings-header {
                margin-bottom: 3rem;
            }

            .header-content {
                display: flex;
                align-items: center;
                gap: 2rem;
                padding: 2rem;
                background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                border-radius: var(--radius-xl);
                color: white;
                box-shadow: var(--shadow-lg);
            }

            .header-icon {
                width: 4rem;
                height: 4rem;
                background: rgba(255, 255, 255, 0.2);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
            }

            .header-text h1 {
                font-size: 2.5rem;
                font-weight: 800;
                margin: 0 0 0.5rem 0;
            }

            .header-text p {
                font-size: 1.125rem;
                opacity: 0.9;
                margin: 0;
            }

            /* Navigation moderne */
            .settings-navigation {
                margin-bottom: 3rem;
            }

            .nav-container {
                display: flex;
                gap: 1rem;
                background: var(--bg-secondary);
                padding: 0.5rem;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow);
            }

            .nav-item {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 1.5rem;
                border: none;
                background: none;
                border-radius: var(--radius);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                color: var(--text-secondary);
            }

            .nav-item:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }

            .nav-item.active {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .nav-icon {
                width: 2.5rem;
                height: 2.5rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }

            .nav-item.active .nav-icon {
                background: rgba(255, 255, 255, 0.2);
            }

            .nav-text {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .nav-title {
                font-weight: 600;
                font-size: 1rem;
            }

            .nav-subtitle {
                font-size: 0.875rem;
                opacity: 0.7;
            }

            /* Contenu principal */
            .settings-main {
                background: var(--bg-secondary);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-xl);
                overflow: hidden;
            }

            .tab-content {
                display: none;
                padding: 3rem;
            }

            .tab-content.active {
                display: block;
            }

            /* Stats Dashboard */
            .stats-dashboard {
                margin-bottom: 3rem;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
            }

            .stat-card {
                background: var(--bg-secondary);
                border: 2px solid var(--border-light);
                border-radius: var(--radius-lg);
                padding: 2rem;
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }

            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--stat-color);
                transition: height 0.3s;
            }

            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-xl);
                border-color: var(--stat-color);
            }

            .stat-card:hover::before {
                height: 6px;
            }

            .stat-card.primary { --stat-color: var(--primary); }
            .stat-card.success { --stat-color: var(--success); }
            .stat-card.warning { --stat-color: var(--warning); }
            .stat-card.info { --stat-color: var(--info); }

            .stat-icon {
                width: 3.5rem;
                height: 3.5rem;
                background: var(--stat-color);
                color: white;
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
                box-shadow: var(--shadow);
            }

            .stat-number {
                font-size: 2.5rem;
                font-weight: 800;
                color: var(--stat-color);
                line-height: 1;
                margin-bottom: 0.5rem;
            }

            .stat-label {
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .stat-trend {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .mini-chart {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 30%;
                height: 60px;
                background: linear-gradient(45deg, var(--stat-color)20, var(--stat-color)40);
                clip-path: polygon(0 100%, 100% calc(100% - var(--percentage)), 100% 100%);
            }

            /* Toolbar */
            .categories-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                gap: 2rem;
                flex-wrap: wrap;
            }

            .section-title {
                font-size: 1.875rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .section-title i {
                color: var(--primary);
            }

            .filter-tabs {
                display: flex;
                gap: 0.5rem;
                background: var(--bg-tertiary);
                padding: 0.5rem;
                border-radius: var(--radius);
            }

            .filter-tab {
                padding: 0.75rem 1.25rem;
                border: none;
                background: none;
                border-radius: var(--radius);
                cursor: pointer;
                font-weight: 500;
                color: var(--text-secondary);
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .filter-tab:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .filter-tab.active {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .btn-modern {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.875rem 1.5rem;
                border: none;
                border-radius: var(--radius);
                font-weight: 600;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none;
            }

            .btn-primary {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .btn-primary:hover {
                background: var(--primary-dark);
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            .btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border);
            }

            .btn-secondary:hover {
                background: var(--bg-secondary);
                border-color: var(--primary);
                color: var(--primary);
            }

            /* Grille des catégories */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 2rem;
            }

            .category-card {
                background: var(--bg-secondary);
                border: 2px solid var(--border-light);
                border-radius: var(--radius-lg);
                padding: 1.5rem;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                cursor: pointer;
                overflow: hidden;
            }

            .category-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 0;
                background: var(--category-color);
                transition: height 0.3s;
            }

            .category-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
                border-color: var(--category-color);
            }

            .category-card:hover::before {
                height: 4px;
            }

            .category-card.inactive {
                opacity: 0.6;
                background: var(--bg-tertiary);
            }

            .category-card.selected {
                border-color: var(--category-color);
                box-shadow: 0 0 0 3px var(--category-color)20;
            }

            .category-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .category-icon {
                width: 3rem;
                height: 3rem;
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
                box-shadow: var(--shadow);
            }

            .category-badges {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                align-items: flex-end;
            }

            .badge {
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .badge.custom {
                background: var(--info);
                color: white;
            }

            .badge.preselected {
                background: var(--warning);
                color: white;
            }

            .badge.status.active {
                background: var(--success);
                color: white;
            }

            .badge.status.inactive {
                background: var(--text-muted);
                color: white;
            }

            .category-body {
                margin-bottom: 1.5rem;
            }

            .category-name {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 1rem 0;
            }

            .category-stats {
                display: flex;
                gap: 1rem;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .category-footer {
                border-top: 1px solid var(--border-light);
                padding-top: 1rem;
            }

            .category-actions {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
            }

            .action-btn {
                width: 2.5rem;
                height: 2.5rem;
                border: 2px solid var(--border);
                background: var(--bg-secondary);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                color: var(--text-secondary);
            }

            .action-btn:hover {
                border-color: var(--primary);
                color: var(--primary);
                transform: scale(1.1);
            }

            .action-btn.active {
                background: var(--success);
                border-color: var(--success);
                color: white;
            }

            .action-btn.inactive {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            .action-btn.selected {
                background: var(--warning);
                border-color: var(--warning);
                color: white;
            }

            .action-btn.danger:hover {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            /* Section Backup */
            .backup-status-section {
                margin-bottom: 3rem;
            }

            .status-card {
                background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
                border: 1px solid var(--border);
                border-radius: var(--radius-lg);
                padding: 2rem;
                box-shadow: var(--shadow);
            }

            .status-header {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .status-icon {
                width: 3rem;
                height: 3rem;
                background: var(--primary);
                color: white;
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .status-info h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 0.5rem 0;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-weight: 500;
            }

            .status-dot {
                width: 0.75rem;
                height: 0.75rem;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .status-dot.loading {
                background: var(--warning);
            }

            .status-dot.ready {
                background: var(--success);
                animation: none;
            }

            .status-dot.error {
                background: var(--danger);
                animation: none;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .status-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }

            .detail-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: var(--bg-secondary);
                border-radius: var(--radius);
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .detail-item i {
                color: var(--primary);
            }

            /* Actions Backup */
            .backup-actions-section {
                margin-bottom: 3rem;
            }

            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2rem;
            }

            .action-card {
                background: var(--bg-secondary);
                border: 2px solid var(--border-light);
                border-radius: var(--radius-lg);
                padding: 2rem;
                text-align: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            .action-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 0;
                background: var(--card-color);
                transition: height 0.3s;
            }

            .action-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-xl);
                border-color: var(--card-color);
            }

            .action-card:hover::before {
                height: 4px;
            }

            .action-card.primary { --card-color: var(--primary); }
            .action-card.secondary { --card-color: var(--secondary); }
            .action-card.accent { --card-color: var(--info); }

            .card-icon {
                width: 4rem;
                height: 4rem;
                background: var(--card-color);
                color: white;
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                margin: 0 auto 1.5rem;
                box-shadow: var(--shadow);
            }

            .card-content h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 1rem 0;
            }

            .card-content p {
                color: var(--text-secondary);
                margin: 0 0 1.5rem 0;
                line-height: 1.6;
            }

            .card-features {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-bottom: 2rem;
            }

            .card-features span {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .card-features i {
                color: var(--success);
            }

            .btn-card {
                width: 100%;
                padding: 1rem 2rem;
                border: none;
                border-radius: var(--radius);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
            }

            .btn-card.btn-primary {
                background: var(--primary);
                color: white;
            }

            .btn-card.btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border);
            }

            .btn-card.btn-accent {
                background: var(--info);
                color: white;
            }

            .btn-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            /* Historique Backup */
            .backup-history-section {
                background: var(--bg-tertiary);
                border-radius: var(--radius-lg);
                padding: 2rem;
            }

            .history-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }

            .history-header h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .history-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .history-item {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1.5rem;
                display: flex;
                align-items: center;
                gap: 1.5rem;
                transition: all 0.3s;
            }

            .history-item:hover {
                border-color: var(--primary);
                box-shadow: var(--shadow);
            }

            .history-icon {
                width: 3rem;
                height: 3rem;
                background: var(--primary)15;
                color: var(--primary);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                flex-shrink: 0;
            }

            .history-info {
                flex: 1;
            }

            .history-name {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .history-meta {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .history-actions {
                display: flex;
                gap: 0.5rem;
            }

            .btn-icon {
                width: 2.5rem;
                height: 2.5rem;
                border: 1px solid var(--border);
                background: var(--bg-secondary);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                color: var(--text-secondary);
            }

            .btn-icon:hover {
                border-color: var(--primary);
                color: var(--primary);
            }

            .btn-icon.danger:hover {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            /* Modals */
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                animation: fadeIn 0.3s forwards;
            }

            @keyframes fadeIn {
                to { opacity: 1; }
            }

            .modal-modern {
                background: var(--bg-secondary);
                border-radius: var(--radius-xl);
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: var(--shadow-xl);
                transform: scale(0.9);
                animation: modalSlideIn 0.3s 0.1s forwards;
            }

            @keyframes modalSlideIn {
                to { transform: scale(1); }
            }

            .modal-header {
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h2 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .btn-close {
                width: 3rem;
                height: 3rem;
                border: none;
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                color: var(--text-secondary);
            }

            .btn-close:hover {
                background: var(--danger);
                color: white;
                transform: scale(1.1);
            }

            .modal-body {
                padding: 2rem;
                max-height: 60vh;
                overflow-y: auto;
            }

            .modal-footer {
                padding: 1rem 2rem 2rem;
                border-top: 1px solid var(--border);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }

            /* Formulaires */
            .form-modern {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .form-label {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 1rem;
            }

            .form-input {
                padding: 1rem;
                border: 2px solid var(--border);
                border-radius: var(--radius);
                font-size: 1rem;
                transition: all 0.3s;
                background: var(--bg-secondary);
            }

            .form-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px var(--primary)20;
            }

            .icon-grid, .color-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(3rem, 1fr));
                gap: 1rem;
            }

            .icon-option, .color-option {
                width: 3rem;
                height: 3rem;
                border: 2px solid var(--border);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                font-size: 1.25rem;
                background: var(--bg-secondary);
            }

            .icon-option:hover, .color-option:hover {
                transform: scale(1.1);
                border-color: var(--primary);
            }

            .icon-option.selected, .color-option.selected {
                border-color: var(--primary);
                background: var(--primary)15;
                transform: scale(1.1);
            }

            /* Éditeur de mots-clés */
            .edit-tabs {
                display: flex;
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                padding: 0.25rem;
                margin-bottom: 2rem;
            }

            .edit-tab {
                flex: 1;
                padding: 0.75rem 1rem;
                border: none;
                background: none;
                border-radius: var(--radius);
                cursor: pointer;
                font-weight: 500;
                color: var(--text-secondary);
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .edit-tab:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .edit-tab.active {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .edit-content {
                max-height: 50vh;
                overflow-y: auto;
            }

            .edit-panel {
                display: none;
            }

            .edit-panel.active {
                display: block;
            }

            .keywords-editor {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .keywords-section {
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                padding: 1.5rem;
            }

            .keywords-section h4 {
                font-size: 1.125rem;
                font-weight: 600;
                margin: 0 0 0.5rem 0;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .section-desc {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin: 0 0 1.5rem 0;
            }

            .keyword-input-group {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .keyword-input {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid var(--border);
                border-radius: var(--radius);
                font-size: 0.875rem;
            }

            .btn-add {
                width: 3rem;
                height: 3rem;
                border: none;
                border-radius: var(--radius);
                background: var(--primary);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .btn-add:hover {
                transform: scale(1.05);
                box-shadow: var(--shadow);
            }

            .keywords-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                min-height: 2rem;
            }

            .keyword-tag {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.3s;
            }

            .keyword-tag.absolute {
                background: #ef444415;
                color: #ef4444;
                border: 1px solid #ef444440;
            }

            .keyword-tag.strong {
                background: #f9731615;
                color: #f97316;
                border: 1px solid #f9731640;
            }

            .keyword-tag.weak {
                background: #3b82f615;
                color: #3b82f6;
                border: 1px solid #3b82f640;
            }

            .keyword-tag button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                transition: all 0.2s;
                opacity: 0.7;
            }

            .keyword-tag button:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.2);
            }

            /* États vides */
            .empty-state {
                text-align: center;
                padding: 4rem 2rem;
                color: var(--text-secondary);
            }

            .empty-icon {
                width: 5rem;
                height: 5rem;
                background: var(--bg-tertiary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                margin: 0 auto 2rem;
                color: var(--text-muted);
            }

            .empty-state h3 {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0 0 1rem 0;
                color: var(--text-primary);
            }

            .empty-state p {
                margin: 0 0 2rem 0;
                line-height: 1.6;
            }

            /* Toast */
            .toast-modern {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem 1.5rem;
                box-shadow: var(--shadow-lg);
                z-index: 2000;
                transform: translateX(400px);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 1rem;
                max-width: 400px;
                border-left: 4px solid var(--toast-color);
            }

            .toast-modern.show {
                transform: translateX(0);
            }

            .toast-modern.success { --toast-color: var(--success); }
            .toast-modern.error { --toast-color: var(--danger); }
            .toast-modern.info { --toast-color: var(--info); }
            .toast-modern.warning { --toast-color: var(--warning); }

            .toast-icon {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                background: var(--toast-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                flex-shrink: 0;
            }

            .toast-content {
                font-weight: 500;
                color: var(--text-primary);
            }

            /* Responsive */
            @media (max-width: 1024px) {
                .settings-container {
                    padding: 1.5rem;
                }

                .header-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 1.5rem;
                }

                .categories-toolbar {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 1.5rem;
                }

                .toolbar-center {
                    order: -1;
                }

                .stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                }

                .categories-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                }

                .actions-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .settings-container {
                    padding: 1rem;
                }

                .tab-content {
                    padding: 2rem;
                }

                .header-text h1 {
                    font-size: 2rem;
                }

                .nav-container {
                    flex-direction: column;
                }

                .nav-item {
                    justify-content: center;
                }

                .categories-grid {
                    grid-template-columns: 1fr;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .modal-modern {
                    margin: 1rem;
                    max-width: none;
                }

                .icon-grid, .color-grid {
                    grid-template-columns: repeat(5, 1fr);
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// ================================================
// GESTIONNAIRE DE BACKUP V2
// ================================================
class BackupManagerV2 {
    constructor() {
        this.isInitialized = false;
        this.history = this.loadHistory();
        this.backupPath = null;
        this.username = null;
    }

    async initialize() {
        try {
            // Détecter le nom d'utilisateur
            this.username = await this.detectUsername();
            
            // Définir le chemin de sauvegarde
            this.backupPath = `C:\\Users\\${this.username}\\Documents\\MailSort Pro`;
            
            // Créer le dossier (simulation - en réalité on ne peut pas créer de dossiers depuis le navigateur)
            this.isInitialized = true;
            
            console.log('[BackupManager] ✅ Initialisé - Dossier:', this.backupPath);
            return this.backupPath;
        } catch (error) {
            console.error('[BackupManager] Erreur initialisation:', error);
            this.backupPath = 'Dossier Téléchargements';
            this.isInitialized = true;
        }
    }

    async detectUsername() {
        try {
            // Méthode 1: Via l'utilisateur Windows/OS connecté
            if (window.navigator.userAgentData) {
                // API moderne (limitée)
                console.log('[BackupManager] Tentative détection via UserAgentData...');
            }

            // Méthode 2: Via les variables d'environnement (si Electron)
            if (typeof process !== 'undefined' && process.env) {
                const envUsername = process.env.USERNAME || process.env.USER;
                if (envUsername && envUsername !== 'User') {
                    console.log('[BackupManager] ✅ Nom utilisateur détecté via ENV:', envUsername);
                    return envUsername;
                }
            }

            // Méthode 3: Via l'authentification Microsoft (si disponible)
            if (window.authService && window.authService.isAuthenticated && window.authService.isAuthenticated()) {
                try {
                    const userInfo = await window.authService.getUserInfo();
                    if (userInfo && userInfo.userPrincipalName) {
                        const emailPart = userInfo.userPrincipalName.split('@')[0];
                        let username = emailPart.split('.')[0];
                        username = username.replace(/[^a-zA-Z0-9]/g, '');
                        
                        if (username && username.length > 2) {
                            console.log('[BackupManager] ✅ Nom utilisateur extrait de l\'email:', username);
                            return username;
                        }
                    }
                } catch (error) {
                    console.log('[BackupManager] ⚠️ Erreur auth Microsoft:', error);
                }
            }

            // Méthode 4: Demander à l'utilisateur
            const userInput = this.askUserForUsername();
            if (userInput) {
                console.log('[BackupManager] ✅ Nom utilisateur saisi:', userInput);
                localStorage.setItem('mailsort-username', userInput);
                return userInput;
            }

            // Méthode 5: Utiliser celui sauvegardé
            const savedUsername = localStorage.getItem('mailsort-username');
            if (savedUsername) {
                console.log('[BackupManager] ✅ Nom utilisateur sauvegardé:', savedUsername);
                return savedUsername;
            }

            // Fallback
            console.log('[BackupManager] ⚠️ Utilisation du fallback');
            return 'utilisateur';
            
        } catch (error) {
            console.error('[BackupManager] ❌ Erreur détection nom utilisateur:', error);
            return 'utilisateur';
        }
    }

    askUserForUsername() {
        const username = prompt(`🔍 Détection du nom d'utilisateur Windows

Pour créer le dossier de sauvegarde au bon endroit, veuillez saisir votre nom d'utilisateur Windows.

Le dossier sera créé dans :
C:\\Users\\[VOTRE_NOM]\\Documents\\MailSort Pro

Nom d'utilisateur Windows :`);

        if (username && username.trim().length > 0) {
            return username.trim().replace(/[^a-zA-Z0-9._-]/g, '');
        }
        return null;
    }

    getBackupPath() {
        return this.backupPath;
    }

    getUsername() {
        return this.username;
    }

    async createBackup() {
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            categories: window.settingsPage.getCategories(),
            settings: window.settingsPage.loadSettings(),
            metadata: {
                totalCategories: Object.keys(window.settingsPage.getCategories()).length,
                createdAt: new Date().toISOString(),
                application: 'MailSort Pro v2.0',
                userAgent: navigator.userAgent,
                username: this.username,
                backupPath: this.backupPath,
                instructions: `Fichier à placer dans : ${this.backupPath}`
            }
        };

        const filename = `mailsort-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });

        // Créer un lien de téléchargement avec instructions
        this.downloadWithInstructions(blob, filename);

        // Ajouter à l'historique
        const record = {
            id: Date.now().toString(),
            name: filename,
            date: new Date().toISOString(),
            size: blob.size,
            categories: Object.keys(backupData.categories).length,
            type: 'complete',
            path: `${this.backupPath}\\${filename}`
        };

        this.history.unshift(record);
        this.history = this.history.slice(0, 20);
        this.saveHistory();

        return backupData;
    }

    downloadWithInstructions(blob, filename) {
        // Télécharger le fichier
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Afficher les instructions
        setTimeout(() => {
            this.showBackupInstructions(filename);
        }, 1000);
    }

    showBackupInstructions(filename) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-modern modal-instructions">
                <div class="modal-header">
                    <h2><i class="fas fa-info-circle"></i> Instructions de sauvegarde</h2>
                    <button class="btn-close" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="instructions-content">
                        <div class="step-card">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>Fichier téléchargé</h4>
                                <p>Le fichier <code>${filename}</code> a été téléchargé dans votre dossier Téléchargements.</p>
                            </div>
                        </div>

                        <div class="step-card">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>Créer le dossier de destination</h4>
                                <p>Créez le dossier suivant s'il n'existe pas :</p>
                                <div class="path-display">
                                    <code>${this.backupPath}</code>
                                    <button class="btn-copy-path" onclick="navigator.clipboard.writeText('${this.backupPath.replace(/\\/g, '\\\\')}'); this.innerHTML='✅ Copié!'">
                                        📋 Copier
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="step-card">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h4>Déplacer le fichier</h4>
                                <p>Déplacez le fichier téléchargé vers le dossier créé pour une organisation optimale.</p>
                            </div>
                        </div>

                        <div class="tips-section">
                            <h4><i class="fas fa-lightbulb"></i> Conseil</h4>
                            <p>Vous pouvez également laisser le fichier dans Téléchargements, il sera fonctionnel partout !</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-modern btn-secondary" onclick="window.settingsPage.openBackupFolder()">
                        <i class="fas fa-folder-open"></i>
                        Ouvrir le dossier
                    </button>
                    <button class="btn-modern btn-primary" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-check"></i>
                        Compris
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    getHistory() {
        return this.history;
    }

    deleteBackup(backupId) {
        this.history = this.history.filter(backup => backup.id !== backupId);
        this.saveHistory();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('mailsort-backup-history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('mailsort-backup-history', JSON.stringify(this.history));
        } catch (error) {
            console.error('[BackupManager] Erreur sauvegarde historique:', error);
        }
    }
}

// ================================================
// INTÉGRATION GLOBALE - CORRECTION
// ================================================
window.settingsPage = new SettingsPageV2();

// Intégration avec PageManager - Version corrigée
if (window.pageManager && window.pageManager.pages) {
    console.log('[SettingsPage] 🔗 Intégration avec PageManager...');
    window.pageManager.pages.settings = (container) => {
        console.log('[SettingsPage] 📄 Rendu demandé par PageManager, container:', container);
        try {
            window.settingsPage.render(container);
        } catch (error) {
            console.error('[SettingsPage] ❌ Erreur lors du rendu via PageManager:', error);
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #ef4444;">
                    <h2>❌ Erreur de chargement</h2>
                    <p>Impossible de charger la page de paramètres</p>
                    <p style="font-size: 0.875rem; color: #666;">${error.message}</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                        🔄 Recharger la page
                    </button>
                </div>
            `;
        }
    };
    console.log('[SettingsPage] ✅ Intégration PageManager réussie');
} else {
    console.warn('[SettingsPage] ⚠️ PageManager non disponible, attente...');
    
    // Attendre que PageManager soit disponible
    let retryCount = 0;
    const maxRetries = 50;
    
    const waitForPageManager = () => {
        retryCount++;
        if (window.pageManager && window.pageManager.pages) {
            console.log('[SettingsPage] 🔗 PageManager trouvé, intégration...');
            window.pageManager.pages.settings = (container) => {
                console.log('[SettingsPage] 📄 Rendu demandé par PageManager (retry), container:', container);
                window.settingsPage.render(container);
            };
            console.log('[SettingsPage] ✅ Intégration PageManager réussie (après attente)');
        } else if (retryCount < maxRetries) {
            setTimeout(waitForPageManager, 100);
        } else {
            console.error('[SettingsPage] ❌ PageManager non trouvé après', maxRetries, 'tentatives');
        }
    };
    
    setTimeout(waitForPageManager, 100);
}

// Méthode alternative d'accès direct
window.loadSettingsPage = (container) => {
    console.log('[SettingsPage] 🎯 Accès direct demandé');
    if (window.settingsPage) {
        window.settingsPage.render(container);
    } else {
        console.error('[SettingsPage] Instance non trouvée');
    }
};

console.log('[SettingsPage] ✅ SettingsPage v2.0 chargée et intégrée!');

// Debug pour vérifier l'état
console.log('[SettingsPage] 🔍 État du système:');
console.log('- window.settingsPage:', !!window.settingsPage);
console.log('- window.pageManager:', !!window.pageManager);
console.log('- window.pageManager.pages:', !!window.pageManager?.pages);
console.log('- window.pageManager.pages.settings:', !!window.pageManager?.pages?.settings);
