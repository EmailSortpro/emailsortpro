// PageManager.js - Version 2.0 - CORRIGÉE AVEC VÉRIFICATIONS DOM

class PageManager {
    constructor() {
        this.currentPage = 'scan';
        this.pages = {};
        this.isInitialized = false;
        this.initializationComplete = false;
        
        // Initialisation différée pour s'assurer que le DOM est prêt
        this.deferredInit();
        
        console.log('[PageManager] ✅ Constructor v2.0 - Version corrigée avec vérifications DOM');
    }

    async deferredInit() {
        try {
            // Attendre que le DOM soit complètement chargé
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Petite pause supplémentaire pour s'assurer que tout est prêt
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Vérifier que le conteneur existe
            await this.waitForContainer();
            
            // Initialiser maintenant
            this.init();
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur lors de l\'initialisation différée:', error);
            this.initializationComplete = true; // Marquer comme terminé même en cas d'erreur
        }
    }

    async waitForContainer() {
        // Attendre que le conteneur de page existe
        let attempts = 0;
        const maxAttempts = 50; // 5 secondes max
        
        while (attempts < maxAttempts) {
            const container = document.getElementById('page-content');
            if (container) {
                console.log('[PageManager] ✅ Conteneur de page trouvé');
                return container;
            }
            
            // Essayer d'autres sélecteurs possibles
            const altContainer = document.querySelector('.page-content, #content, .content, main, .main-content');
            if (altContainer) {
                console.log('[PageManager] ✅ Conteneur alternatif trouvé:', altContainer.id || altContainer.className);
                // Créer l'ID attendu s'il n'existe pas
                if (!altContainer.id) {
                    altContainer.id = 'page-content';
                }
                return altContainer;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // Si aucun conteneur n'est trouvé, en créer un
        console.warn('[PageManager] ⚠️ Aucun conteneur trouvé, création automatique');
        return this.createContainer();
    }

    createContainer() {
        // Créer un conteneur de page automatiquement
        const container = document.createElement('div');
        container.id = 'page-content';
        container.style.cssText = `
            width: 100%;
            height: 100vh;
            overflow: auto;
            position: relative;
        `;
        
        // Essayer de l'insérer dans le body ou un conteneur approprié
        const targetParent = document.querySelector('body') || document.documentElement;
        targetParent.appendChild(container);
        
        console.log('[PageManager] ✅ Conteneur créé automatiquement');
        return container;
    }

    init() {
        try {
            console.log('[PageManager] 🔄 Initialisation...');
            
            // Initialiser les pages
            this.initializePages();
            
            // Configurer les événements
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.initializationComplete = true;
            
            console.log('[PageManager] ✅ Initialisation terminée');
            
            // Charger la page par défaut
            setTimeout(() => {
                this.loadPage('scan');
            }, 100);
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur d\'initialisation:', error);
            this.initializationComplete = true;
        }
    }

    initializePages() {
        // Page de scan (défaut)
        this.pages.scan = (container) => {
            try {
                if (window.minimalScanModule && typeof window.minimalScanModule.render === 'function') {
                    window.minimalScanModule.render(container);
                } else {
                    container.innerHTML = this.getDefaultScanContent();
                }
            } catch (error) {
                console.error('[PageManager] Erreur page scan:', error);
                container.innerHTML = this.getErrorContent('Scanner', error);
            }
        };

        // Page des emails
        this.pages.emails = (container) => {
            try {
                container.innerHTML = this.getEmailsPageContent();
            } catch (error) {
                console.error('[PageManager] Erreur page emails:', error);
                container.innerHTML = this.getErrorContent('Emails', error);
            }
        };

        // Page des tâches
        this.pages.tasks = (container) => {
            try {
                if (window.taskManager && typeof window.taskManager.renderTasksView === 'function') {
                    window.taskManager.renderTasksView(container);
                } else {
                    container.innerHTML = this.getTasksPageContent();
                }
            } catch (error) {
                console.error('[PageManager] Erreur page tâches:', error);
                container.innerHTML = this.getErrorContent('Tâches', error);
            }
        };

        // Page dashboard
        this.pages.dashboard = (container) => {
            try {
                if (window.dashboardModule && typeof window.dashboardModule.render === 'function') {
                    window.dashboardModule.render(container);
                } else {
                    container.innerHTML = this.getDashboardPageContent();
                }
            } catch (error) {
                console.error('[PageManager] Erreur page dashboard:', error);
                container.innerHTML = this.getErrorContent('Dashboard', error);
            }
        };

        // Page des paramètres
        this.pages.settings = (container) => {
            try {
                if (window.categoriesPage && typeof window.categoriesPage.renderSettings === 'function') {
                    window.categoriesPage.renderSettings(container);
                } else {
                    container.innerHTML = this.getSettingsPageContent();
                }
            } catch (error) {
                console.error('[PageManager] Erreur page paramètres:', error);
                container.innerHTML = this.getErrorContent('Paramètres', error);
            }
        };

        console.log('[PageManager] ✅ Pages initialisées:', Object.keys(this.pages));
    }

    setupEventListeners() {
        try {
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

            console.log('[PageManager] ✅ Event listeners configurés');
        } catch (error) {
            console.error('[PageManager] ❌ Erreur configuration listeners:', error);
        }
    }

    loadPage(pageName) {
        try {
            console.log(`[PageManager] 🔄 Chargement de la page: ${pageName}`);
            
            // Vérifier que l'initialisation est terminée
            if (!this.initializationComplete) {
                console.warn('[PageManager] ⚠️ Initialisation non terminée, report du chargement');
                setTimeout(() => this.loadPage(pageName), 100);
                return;
            }
            
            // Vérifier que la page existe
            if (!this.pages[pageName]) {
                console.warn(`[PageManager] ⚠️ Page "${pageName}" non trouvée, chargement de scan`);
                pageName = 'scan';
            }

            // Trouver le conteneur
            const container = this.findContainer();
            if (!container) {
                console.error('[PageManager] ❌ Conteneur introuvable');
                return;
            }

            // Mettre à jour la navigation
            this.updateNavigation(pageName);
            
            // Charger le contenu de la page
            try {
                // Vider le conteneur d'abord
                container.innerHTML = '';
                
                // Charger la nouvelle page
                this.pages[pageName](container);
                this.currentPage = pageName;
                
                console.log(`[PageManager] ✅ Page "${pageName}" chargée avec succès`);
                
                // Mettre à jour le titre
                this.updatePageTitle(pageName);
                
            } catch (error) {
                console.error(`[PageManager] ❌ Erreur lors du chargement de la page "${pageName}":`, error);
                container.innerHTML = this.getErrorContent(pageName, error);
            }

        } catch (error) {
            console.error(`[PageManager] ❌ Erreur critique lors du chargement de la page "${pageName}":`, error);
        }
    }

    findContainer() {
        // Essayer plusieurs sélecteurs
        const selectors = [
            '#page-content',
            '.page-content',
            '#content',
            '.content',
            'main',
            '.main-content',
            '#app-content',
            '.app-content'
        ];
        
        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                // S'assurer que l'ID est correct
                if (!container.id) {
                    container.id = 'page-content';
                }
                return container;
            }
        }
        
        // Si aucun conteneur n'est trouvé, en créer un
        return this.createContainer();
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
            
            console.log(`[PageManager] ✅ Navigation mise à jour pour: ${activePage}`);
        } catch (error) {
            console.error('[PageManager] ❌ Erreur mise à jour navigation:', error);
        }
    }

    updatePageTitle(pageName) {
        try {
            const titles = {
                scan: 'Scanner',
                emails: 'Emails',
                tasks: 'Tâches',
                dashboard: 'Dashboard',
                settings: 'Paramètres'
            };
            
            const title = titles[pageName] || 'Scanner';
            document.title = `EmailSortPro - ${title}`;
        } catch (error) {
            console.error('[PageManager] ❌ Erreur mise à jour titre:', error);
        }
    }

    // Contenus par défaut pour chaque page
    getDefaultScanContent() {
        return `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; padding: 40px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="width: 60px; height: 60px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 24px;">
                        📧
                    </div>
                    <h2 style="margin: 0 0 10px 0; color: #333;">Scanner Email</h2>
                    <p style="margin: 0 0 20px 0; color: #666;">Le module de scan se charge...</p>
                    <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
    }

    getEmailsPageContent() {
        return `
            <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="margin: 0 0 20px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 32px;">📧</span>
                        Mes Emails
                    </h1>
                    <p style="color: #666; margin-bottom: 30px;">Consultez et gérez vos emails analysés</p>
                    
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 15px 0; color: #6c757d;">Cette page affichera vos emails analysés</p>
                        <button onclick="window.pageManager.loadPage('scan')" 
                                style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            Analyser mes emails
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getTasksPageContent() {
        return `
            <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="margin: 0 0 20px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 32px;">✅</span>
                        Mes Tâches
                    </h1>
                    <p style="color: #666; margin-bottom: 30px;">Gérez vos tâches créées depuis vos emails</p>
                    
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 15px 0; color: #6c757d;">Aucune tâche pour le moment</p>
                        <button onclick="window.pageManager.loadPage('scan')" 
                                style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            Créer des tâches
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getDashboardPageContent() {
        return `
            <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="margin: 0 0 20px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 32px;">📊</span>
                        Dashboard
                    </h1>
                    <p style="color: #666; margin-bottom: 30px;">Vue d'ensemble de vos emails et tâches</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                            <h3 style="margin: 0 0 10px 0; color: #495057;">Emails analysés</h3>
                            <div style="font-size: 36px; font-weight: bold; color: #667eea;">0</div>
                        </div>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                            <h3 style="margin: 0 0 10px 0; color: #495057;">Tâches créées</h3>
                            <div style="font-size: 36px; font-weight: bold; color: #28a745;">0</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <button onclick="window.pageManager.loadPage('scan')" 
                                style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            Commencer l'analyse
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsPageContent() {
        return `
            <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="margin: 0 0 20px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 32px;">⚙️</span>
                        Paramètres
                    </h1>
                    <p style="color: #666; margin-bottom: 30px;">Configurez votre expérience EmailSortPro</p>
                    
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 15px 0; color: #6c757d;">Le module de paramètres se charge...</p>
                        <div style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
    }

    getErrorContent(pageName, error) {
        return `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; text-align: center;">
                    <h2 style="color: #721c24; margin: 0 0 10px 0;">Erreur de chargement</h2>
                    <p style="color: #721c24; margin: 0 0 20px 0;">
                        Impossible de charger la page "${pageName}"
                    </p>
                    <p style="color: #856404; font-size: 14px; margin: 0 0 20px 0;">
                        ${error?.message || 'Erreur inconnue'}
                    </p>
                    <button onclick="window.pageManager.loadPage('scan')" 
                            style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                        Retour au scanner
                    </button>
                    <button onclick="location.reload()" 
                            style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        Recharger la page
                    </button>
                </div>
            </div>
        `;
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
            console.log(`[PageManager] ✅ Page "${name}" ajoutée`);
        } else {
            console.error(`[PageManager] ❌ Fonction de rendu invalide pour "${name}"`);
        }
    }

    removePage(name) {
        if (this.pages[name]) {
            delete this.pages[name];
            console.log(`[PageManager] ✅ Page "${name}" supprimée`);
        }
    }

    refreshCurrentPage() {
        console.log('[PageManager] 🔄 Actualisation de la page courante');
        this.loadPage(this.currentPage);
    }

    // Méthodes de debug
    getDebugInfo() {
        return {
            currentPage: this.currentPage,
            availablePages: Object.keys(this.pages),
            isInitialized: this.isInitialized,
            initializationComplete: this.initializationComplete
        };
    }

    // Nettoyage
    destroy() {
        this.pages = {};
        this.currentPage = null;
        this.isInitialized = false;
        this.initializationComplete = false;
        console.log('[PageManager] ✅ Instance détruite');
    }
}

// Création de l'instance globale avec protection complète
try {
    // Détruire l'ancienne instance si elle existe
    if (window.pageManager) {
        window.pageManager.destroy?.();
    }
    
    // Créer la nouvelle instance
    window.pageManager = new PageManager();
    
    console.log('✅ PageManager v2.0 chargé et initialisé avec succès');
    
} catch (error) {
    console.error('❌ Erreur critique lors de l\'initialisation du PageManager:', error);
    
    // Fallback minimal
    window.pageManager = {
        loadPage: (page) => console.warn(`[PageManager] Fallback - tentative de chargement: ${page}`),
        getCurrentPage: () => 'scan',
        getAvailablePages: () => ['scan'],
        isInitialized: false,
        initializationComplete: false
    };
}
