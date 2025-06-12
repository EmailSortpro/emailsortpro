// PageManager.js - Version corrigée simple

class PageManager {
    constructor() {
        this.currentPage = 'scan';
        this.pages = {};
        this.isInitialized = false;
        
        this.init();
        console.log('[PageManager] ✅ Initialized - Version corrigée');
    }

    init() {
        try {
            // Initialiser les pages de base
            this.initializePages();
            
            // Configurer les événements
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[PageManager] ✅ Initialization complete');
            
        } catch (error) {
            console.error('[PageManager] ❌ Initialization error:', error);
        }
    }

    initializePages() {
        // Page de scan (défaut)
        this.pages.scan = (container) => {
            if (window.minimalScanModule && typeof window.minimalScanModule.render === 'function') {
                window.minimalScanModule.render(container);
            } else {
                container.innerHTML = '<div style="padding: 20px; text-align: center;">Scanner non disponible</div>';
            }
        };

        // Page des emails
        this.pages.emails = (container) => {
            container.innerHTML = `
                <div style="padding: 20px;">
                    <h2>📧 Mes Emails</h2>
                    <p>Cette page sera développée prochainement.</p>
                    <button onclick="window.pageManager.loadPage('scan')" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Retour au scanner
                    </button>
                </div>
            `;
        };

        // Page des tâches
        this.pages.tasks = (container) => {
            if (window.taskManager && typeof window.taskManager.renderTasksView === 'function') {
                window.taskManager.renderTasksView(container);
            } else {
                container.innerHTML = `
                    <div style="padding: 20px;">
                        <h2>✅ Mes Tâches</h2>
                        <p>TaskManager non disponible.</p>
                        <button onclick="window.pageManager.loadPage('scan')" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Retour au scanner
                        </button>
                    </div>
                `;
            }
        };

        // Page dashboard
        this.pages.dashboard = (container) => {
            if (window.dashboardModule && typeof window.dashboardModule.render === 'function') {
                window.dashboardModule.render(container);
            } else {
                container.innerHTML = `
                    <div style="padding: 20px;">
                        <h2>📊 Dashboard</h2>
                        <p>Dashboard en cours de développement.</p>
                        <button onclick="window.pageManager.loadPage('scan')" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Retour au scanner
                        </button>
                    </div>
                `;
            }
        };

        // Page des paramètres
        this.pages.settings = (container) => {
            if (window.categoriesPage && typeof window.categoriesPage.renderSettings === 'function') {
                window.categoriesPage.renderSettings(container);
            } else {
                container.innerHTML = `
                    <div style="padding: 20px;">
                        <h2>⚙️ Paramètres</h2>
                        <p>Page des paramètres non disponible.</p>
                        <button onclick="window.pageManager.loadPage('scan')" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Retour au scanner
                        </button>
                    </div>
                `;
            }
        };

        console.log('[PageManager] Pages initialized:', Object.keys(this.pages));
    }

    setupEventListeners() {
        // Écouter les clics sur la navigation
        document.addEventListener('click', (event) => {
            const navItem = event.target.closest('.nav-item');
            if (navItem && navItem.dataset.page) {
                event.preventDefault();
                this.loadPage(navItem.dataset.page);
            }
        });

        // Écouter les événements personnalisés
        window.addEventListener('pageChangeRequest', (event) => {
            if (event.detail && event.detail.page) {
                this.loadPage(event.detail.page);
            }
        });

        console.log('[PageManager] Event listeners setup complete');
    }

    loadPage(pageName) {
        try {
            console.log(`[PageManager] Loading page: ${pageName}`);
            
            if (!this.pages[pageName]) {
                console.warn(`[PageManager] Page "${pageName}" not found, loading scan`);
                pageName = 'scan';
            }

            // Mettre à jour la navigation
            this.updateNavigation(pageName);
            
            // Charger le contenu de la page
            const container = document.getElementById('page-content');
            if (container) {
                try {
                    this.pages[pageName](container);
                    this.currentPage = pageName;
                    console.log(`[PageManager] ✅ Page "${pageName}" loaded successfully`);
                } catch (error) {
                    console.error(`[PageManager] ❌ Error loading page "${pageName}":`, error);
                    container.innerHTML = `
                        <div style="padding: 20px; text-align: center;">
                            <h2>Erreur de chargement</h2>
                            <p>Impossible de charger la page "${pageName}"</p>
                            <button onclick="window.pageManager.loadPage('scan')" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Retour au scanner
                            </button>
                        </div>
                    `;
                }
            } else {
                console.error('[PageManager] ❌ Page container not found');
            }

        } catch (error) {
            console.error(`[PageManager] ❌ Critical error loading page "${pageName}":`, error);
        }
    }

    updateNavigation(activePage) {
        try {
            // Mettre à jour les éléments de navigation
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                if (item.dataset.page === activePage) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Mettre à jour le titre de la page si nécessaire
            const pageTitle = this.getPageTitle(activePage);
            if (pageTitle) {
                document.title = `EmailSortPro - ${pageTitle}`;
            }

        } catch (error) {
            console.error('[PageManager] ❌ Error updating navigation:', error);
        }
    }

    getPageTitle(pageName) {
        const titles = {
            scan: 'Scanner',
            emails: 'Emails',
            tasks: 'Tâches',
            dashboard: 'Dashboard',
            settings: 'Paramètres'
        };
        return titles[pageName] || 'Scanner';
    }

    // Méthodes publiques
    getCurrentPage() {
        return this.currentPage;
    }

    getAvailablePages() {
        return Object.keys(this.pages);
    }

    addPage(name, renderFunction) {
        if (typeof renderFunction === 'function') {
            this.pages[name] = renderFunction;
            console.log(`[PageManager] ✅ Page "${name}" added successfully`);
        } else {
            console.error(`[PageManager] ❌ Invalid render function for page "${name}"`);
        }
    }

    removePage(name) {
        if (this.pages[name]) {
            delete this.pages[name];
            console.log(`[PageManager] ✅ Page "${name}" removed successfully`);
        }
    }

    // Méthodes de compatibilité
    forceSynchronization() {
        console.log('[PageManager] 🔄 Force synchronization requested');
        
        // Recharger la page courante
        if (this.currentPage && this.pages[this.currentPage]) {
            this.loadPage(this.currentPage);
        }
    }

    refreshCurrentPage() {
        console.log('[PageManager] 🔄 Refreshing current page');
        this.loadPage(this.currentPage);
    }

    // Méthodes de debug
    getDebugInfo() {
        return {
            currentPage: this.currentPage,
            availablePages: Object.keys(this.pages),
            isInitialized: this.isInitialized
        };
    }

    // Nettoyage
    destroy() {
        this.pages = {};
        this.currentPage = null;
        this.isInitialized = false;
        console.log('[PageManager] Instance destroyed');
    }
}

// Créer l'instance globale
try {
    if (window.pageManager) {
        window.pageManager.destroy?.();
    }
    
    window.pageManager = new PageManager();
    
    // Charger la page par défaut après un court délai
    setTimeout(() => {
        if (window.pageManager && window.pageManager.isInitialized) {
            window.pageManager.loadPage('scan');
        }
    }, 100);
    
    console.log('✅ PageManager loaded and initialized successfully');
    
} catch (error) {
    console.error('❌ Critical error initializing PageManager:', error);
}
