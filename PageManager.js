// PageManager.js - Version 13.0 - Correction méthode renderSettings

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // Gestion de la synchronisation
        this.lastSettingsSync = 0;
        this.syncInProgress = false;
        this.taskPreselectedCategories = [];
        this.autoPreselectionEnabled = true;
        
        // Page renderers - AVEC CORRECTION renderSettings
        this.pages = {
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container), // CORRIGÉ
            ranger: (container) => this.renderRanger(container)
        };
        
        this.setupEventListeners();
        this.loadCurrentParameters();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 13.0 - Correction méthode renderSettings');
    }

    // ================================================
    // MÉTHODE RENDERSETTINGS - COMPLÈTEMENT CORRIGÉE
    // ================================================
    async renderSettings(container) {
        console.log('[PageManager] 🎯 === DÉBUT RENDER SETTINGS (PageManager) ===');
        
        try {
            // Vérifier si CategoriesPage existe et a la méthode renderSettings
            if (window.categoriesPage && typeof window.categoriesPage.renderSettings === 'function') {
                console.log('[PageManager] ✅ Utilisation CategoriesPage.renderSettings');
                window.categoriesPage.renderSettings(container);
                return;
            }
            
            // Fallback si CategoriesPage n'est pas disponible
            console.log('[PageManager] ⚠️ CategoriesPage non disponible, utilisation fallback');
            
            container.innerHTML = `
                <div class="settings-page-fallback">
                    <div class="page-header">
                        <h1>Paramètres</h1>
                        <p>Configuration de l'application</p>
                    </div>
                    
                    <div class="status-message">
                        <div class="status-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="status-content">
                            <h3>Module de paramètres en cours de chargement</h3>
                            <p>Le module CategoriesPage n'est pas encore disponible. Veuillez patienter ou recharger la page.</p>
                        </div>
                    </div>
                    
                    <div class="settings-actions">
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-redo"></i>
                            Recharger la page
                        </button>
                        <button class="btn btn-secondary" onclick="window.pageManager.loadPage('dashboard')">
                            <i class="fas fa-home"></i>
                            Retour au tableau de bord
                        </button>
                    </div>
                    
                    <div class="debug-info">
                        <h4>Informations de débogage</h4>
                        <ul>
                            <li>CategoriesPage disponible: ${!!window.categoriesPage}</li>
                            <li>Méthode renderSettings: ${!!(window.categoriesPage && typeof window.categoriesPage.renderSettings === 'function')}</li>
                            <li>CategoryManager disponible: ${!!window.categoryManager}</li>
                            <li>Timestamp: ${new Date().toLocaleString()}</li>
                        </ul>
                    </div>
                </div>
                
                <style>
                    .settings-page-fallback {
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    
                    .page-header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #e5e7eb;
                    }
                    
                    .page-header h1 {
                        font-size: 32px;
                        font-weight: 700;
                        color: #1f2937;
                        margin-bottom: 8px;
                    }
                    
                    .page-header p {
                        font-size: 16px;
                        color: #6b7280;
                        margin: 0;
                    }
                    
                    .status-message {
                        display: flex;
                        align-items: flex-start;
                        gap: 16px;
                        background: #fef3c7;
                        border: 1px solid #f59e0b;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .status-icon {
                        color: #f59e0b;
                        font-size: 24px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                    
                    .status-content h3 {
                        margin: 0 0 8px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #92400e;
                    }
                    
                    .status-content p {
                        margin: 0;
                        color: #92400e;
                        line-height: 1.5;
                    }
                    
                    .settings-actions {
                        display: flex;
                        gap: 12px;
                        justify-content: center;
                        margin-bottom: 40px;
                    }
                    
                    .btn {
                        padding: 12px 20px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        text-decoration: none;
                        border: none;
                        font-size: 14px;
                    }
                    
                    .btn.btn-primary {
                        background: #3b82f6;
                        color: white;
                    }
                    
                    .btn.btn-primary:hover {
                        background: #2563eb;
                        transform: translateY(-1px);
                    }
                    
                    .btn.btn-secondary {
                        background: #f3f4f6;
                        color: #374151;
                        border: 1px solid #d1d5db;
                    }
                    
                    .btn.btn-secondary:hover {
                        background: #e5e7eb;
                        transform: translateY(-1px);
                    }
                    
                    .debug-info {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 16px;
                    }
                    
                    .debug-info h4 {
                        margin: 0 0 12px 0;
                        font-size: 16px;
                        font-weight: 600;
                        color: #374151;
                    }
                    
                    .debug-info ul {
                        margin: 0;
                        padding-left: 20px;
                        color: #6b7280;
                        font-size: 14px;
                        line-height: 1.6;
                    }
                </style>
            `;
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur renderSettings:', error);
            container.innerHTML = this.renderErrorPage(error);
        }
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES ACTUELS
    // ================================================
    loadCurrentParameters() {
        console.log('[PageManager] 📥 === CHARGEMENT PARAMÈTRES ACTUELS ===');
        
        try {
            // Priorité 1: CategoryManager
            if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                console.log('[PageManager] ✅ Paramètres chargés depuis CategoryManager:', this.taskPreselectedCategories);
                
            } else if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
                this.taskPreselectedCategories = window.categoriesPage.getTaskPreselectedCategories();
                console.log('[PageManager] ✅ Paramètres chargés depuis CategoriesPage:', this.taskPreselectedCategories);
                
            } else {
                // Fallback localStorage
                try {
                    const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
                    this.taskPreselectedCategories = settings.taskPreselectedCategories || [];
                    console.log('[PageManager] ✅ Paramètres chargés depuis localStorage:', this.taskPreselectedCategories);
                } catch (error) {
                    console.warn('[PageManager] ⚠️ Erreur localStorage, paramètres par défaut');
                    this.taskPreselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
                }
            }
            
            this.lastSettingsSync = Date.now();
            console.log('[PageManager] 📊 Catégories pré-sélectionnées actuelles:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur chargement paramètres:', error);
            this.taskPreselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
        }
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres depuis CategoriesPage
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 Paramètres changés reçus:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        // Écouter les changements génériques de paramètres
        window.addEventListener('settingsChanged', (event) => {
            console.log('[PageManager] 📨 Changement générique reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        });

        // Écouter la synchronisation forcée
        window.addEventListener('forceSynchronization', (event) => {
            console.log('[PageManager] 🔄 Synchronisation forcée reçue:', event.detail);
            this.handleForcedSynchronization(event.detail);
        });

        // Écouter la recatégorisation des emails
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] Emails recatégorisés, mise à jour interface');
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.refreshEmailsView();
                }, 100);
            }
        });

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] Scan terminé, données mises à jour');
            this.lastScanData = event.detail;
            if (this.currentPage === 'emails') {
                this.loadPage('emails');
            }
        });
    }

    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 === TRAITEMENT CHANGEMENT PARAMÈTRES ===');
        console.log('[PageManager] 📊 Données reçues:', settingsData);
        
        // Mise à jour des paramètres locaux
        if (settingsData.settings?.taskPreselectedCategories) {
            const oldCategories = [...this.taskPreselectedCategories];
            this.taskPreselectedCategories = [...settingsData.settings.taskPreselectedCategories];
            
            console.log('[PageManager] 📋 Catégories pré-sélectionnées mises à jour:');
            console.log('  - Anciennes:', oldCategories);
            console.log('  - Nouvelles:', this.taskPreselectedCategories);
            
            // Mise à jour immédiate de la pré-sélection si on est sur la page emails
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.updateEmailPreselection();
                    this.refreshEmailsView();
                }, 100);
            }
        }
        
        // Si c'est un changement de catégories pré-sélectionnées, forcer la re-catégorisation
        if (settingsData.settings?.taskPreselectedCategories) {
            // Déclencher la re-catégorisation si des emails existent
            if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                console.log('[PageManager] 🔄 Déclenchement re-catégorisation...');
                setTimeout(() => {
                    window.emailScanner.recategorizeEmails?.();
                }, 150);
            }
        }
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[PageManager] 🔧 === TRAITEMENT CHANGEMENT GÉNÉRIQUE ===');
        console.log('[PageManager] 📊 Données:', changeData);
        
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[PageManager] 📋 Catégories pour tâches changées:', value);
                
                const oldCategories = [...this.taskPreselectedCategories];
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                
                console.log('[PageManager] 📊 Mise à jour catégories:');
                console.log('  - Anciennes:', oldCategories);
                console.log('  - Nouvelles:', this.taskPreselectedCategories);
                
                // Mettre à jour le auto-analyzer si disponible
                if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
                
                // Mise à jour immédiate de la pré-sélection
                if (this.currentPage === 'emails') {
                    setTimeout(() => {
                        this.updateEmailPreselection();
                        this.refreshEmailsView();
                    }, 100);
                }
                break;
                
            case 'activeCategories':
                console.log('[PageManager] 🏷️ Catégories actives changées:', value);
                // Déclencher la re-catégorisation
                if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                    setTimeout(() => {
                        window.emailScanner.recategorizeEmails?.();
                    }, 150);
                }
                break;
                
            case 'preferences':
                console.log('[PageManager] ⚙️ Préférences changées:', value);
                // Mettre à jour l'affichage selon les nouvelles préférences
                if (this.currentPage === 'emails') {
                    setTimeout(() => {
                        this.refreshEmailsView();
                    }, 100);
                }
                break;
        }
    }

    handleForcedSynchronization(syncData) {
        console.log('[PageManager] 🚀 === SYNCHRONISATION FORCÉE ===');
        console.log('[PageManager] 📊 Données sync:', syncData);
        
        // Recharger tous les paramètres
        this.loadCurrentParameters();
        
        // Si on est sur la page emails, mise à jour immédiate
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.updateEmailPreselection();
                this.refreshEmailsView();
            }, 100);
        }
    }

    // ================================================
    // PAGE LOADING
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManager] Chargement page: ${pageName}`);

        // IGNORER complètement le dashboard
        if (pageName === 'dashboard') {
            console.log('[PageManager] Dashboard ignoré - géré par index.html');
            this.updateNavigation(pageName);
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.style.display = 'block';
                pageContent.style.opacity = '1';
            }
            return;
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] Container de contenu non trouvé');
            return;
        }

        this.updateNavigation(pageName);
        window.uiManager?.showLoading(`Chargement ${pageName}...`);

        try {
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
                
                // Si c'est la page emails, appliquer la pré-sélection
                if (pageName === 'emails') {
                    setTimeout(() => {
                        this.updateEmailPreselection();
                    }, 200);
                }
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            window.uiManager?.hideLoading();

        } catch (error) {
            console.error(`[PageManager] Erreur chargement page:`, error);
            window.uiManager?.hideLoading();
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = this.renderErrorPage(error);
        }
    }

    renderErrorPage(error) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="empty-state-title">Erreur de chargement</h3>
                <p class="empty-state-text">${error.message}</p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('dashboard')">
                    Retour au tableau de bord
                </button>
            </div>
        `;
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ================================================
    // AUTRES PAGES (placeholders)
    // ================================================
    async renderScanner(container) {
        console.log('[PageManager] Rendu page scanner...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                console.log('[PageManager] Utilisation ScanStartModule moderne');
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule, fallback:', error);
            }
        }
        
        console.log('[PageManager] Utilisation interface scanner fallback');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="empty-title">Scanner d'emails</h3>
                <p class="empty-text">Module de scan en cours de chargement...</p>
            </div>
        `;
    }

    async renderEmails(container) {
        // Recharger les paramètres avant le rendu
        this.loadCurrentParameters();
        
        // Récupérer les emails depuis EmailScanner centralisé
        const emails = window.emailScanner?.getAllEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManager] === RENDU PAGE EMAILS ===`);
        console.log(`[PageManager] 📧 Total emails: ${emails.length}`);
        console.log(`[PageManager] 📋 Catégories pré-sélectionnées: ${this.taskPreselectedCategories.join(', ')}`);
        console.log(`[PageManager] ⭐ Emails actuellement sélectionnés: ${this.selectedEmails.size}`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        // Simuler le rendu des emails
        container.innerHTML = `
            <div class="page-header">
                <h1>Emails</h1>
                <p>${emails.length} emails trouvés</p>
            </div>
            
            <div class="emails-grid">
                ${emails.slice(0, 10).map(email => `
                    <div class="email-card">
                        <h3>${email.subject || 'Sans sujet'}</h3>
                        <p>De: ${email.from?.emailAddress?.name || 'Inconnu'}</p>
                        <span class="email-category">${email.category || 'autre'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEmptyEmailsState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">Aucun email trouvé</h3>
                <p class="empty-state-text">
                    Utilisez le scanner pour récupérer et analyser vos emails.
                </p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    Aller au scanner
                </button>
            </div>
        `;
    }

    async renderTasks(container) {
        if (window.tasksView && window.tasksView.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Tâches</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-title">Aucune tâche</h3>
                    <p class="empty-text">Créez des tâches à partir de vos emails</p>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        const categories = window.categoryManager?.getCategories() || {};
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Catégories</h1>
            </div>
            
            <div class="categories-grid">
                ${Object.entries(categories).map(([id, cat]) => `
                    <div class="category-card">
                        <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                            ${cat.icon}
                        </div>
                        <h3>${cat.name}</h3>
                        <p>${cat.description || ''}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderRanger(container) {
        if (window.domainOrganizer && window.domainOrganizer.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Ranger par domaine</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-folder-tree"></i>
                    </div>
                    <h3 class="empty-title">Module de rangement</h3>
                    <p class="empty-text">Module de rangement en cours de chargement...</p>
                </div>
            `;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES - PLACEHOLDERS
    // ================================================
    updateEmailPreselection() {
        console.log('[PageManager] ⭐ Mise à jour pré-sélection emails (placeholder)');
    }

    refreshEmailsView() {
        console.log('[PageManager] 🔄 Rafraîchissement vue emails (placeholder)');
    }

    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }
}

// Créer l'instance globale
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v13.0 loaded - Correction méthode renderSettings');
