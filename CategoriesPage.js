// CategoriesPage.js - Version v24.0 - Stockage C:// Direct Simplifié
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v24.0 - Direct C:// Storage...');

// Nettoyer toute instance précédente
if (window.categoriesPage) {
    console.log('[CategoriesPage] 🧹 Nettoyage instance précédente...');
    delete window.categoriesPage;
}

class CategoriesPageV24 {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.activeTab = 'categories';
        this.colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ];
        
        // Configuration filesystem simplifiée - DIRECTEMENT vers C://
        this.filesystemConfig = {
            enabled: false,
            defaultPath: 'C:\\EmailSortPro\\Categories\\',
            currentPath: null,
            directoryHandle: null,
            autoSave: true,
            permissions: 'prompt',
            filename: 'EmailSortPro-Categories.json'
        };
        
        this.backupConfig = {
            autoSave: true,
            interval: 30000,
            maxBackups: 10
        };
        
        this.backupTimer = null;
        this.pendingChanges = false;
        this.fileSystemSupported = this.checkFileSystemSupport();
        
        console.log('[CategoriesPage] 🎯 Interface v24.0 - Stockage C:// direct');
        
        this.initializeStorage();
    }

    // ================================================
    // STOCKAGE C:// DIRECT SIMPLIFIÉ
    // ================================================
    checkFileSystemSupport() {
        return 'showDirectoryPicker' in window;
    }

    async initializeStorage() {
        console.log('[CategoriesPage] 📁 Initialisation stockage C:// direct...');
        
        if (!this.fileSystemSupported) {
            console.warn('[CategoriesPage] ⚠️ API non supportée - Configuration basique');
            this.filesystemConfig.currentPath = this.filesystemConfig.defaultPath;
            this.initializeBackup();
            return;
        }

        // Essayer de restaurer l'accès précédent
        await this.restoreDirectoryAccess();
        
        // Si pas configuré, préparer pour configuration manuelle
        if (!this.filesystemConfig.enabled) {
            this.filesystemConfig.currentPath = 'Non configuré - Cliquez "Configurer C://"';
        }
        
        this.initializeBackup();
    }

    async restoreDirectoryAccess() {
        try {
            const savedConfig = localStorage.getItem('emailsortpro_filesystem_v24');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.filesystemConfig.currentPath = config.currentPath;
                console.log('[CategoriesPage] 📂 Configuration restaurée:', config.currentPath);
            }
        } catch (error) {
            console.log('[CategoriesPage] ℹ️ Aucune configuration précédente');
        }
    }

    async configureDirectAccess() {
        if (!this.fileSystemSupported) {
            this.showToast('❌ Votre navigateur ne supporte pas l\'accès aux fichiers', 'error');
            return false;
        }

        try {
            this.showToast('📂 Sélectionnez un dossier sur votre disque C:// (ex: C:\\EmailSortPro)', 'info');
            
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'desktop'
            });
            
            // Tester l'accès
            await this.testDirectoryAccess(directoryHandle);
            
            // Créer sous-dossier Categories si nécessaire
            let categoriesHandle;
            try {
                categoriesHandle = await directoryHandle.getDirectoryHandle('Categories', { create: true });
            } catch (error) {
                categoriesHandle = directoryHandle; // Utiliser le dossier principal
            }
            
            // Configurer
            this.filesystemConfig.directoryHandle = categoriesHandle;
            this.filesystemConfig.enabled = true;
            this.filesystemConfig.permissions = 'granted';
            this.filesystemConfig.currentPath = this.estimateFullPath(directoryHandle);
            
            await this.saveConfig();
            await this.createReadmeFile();
            await this.createBackup('setup');
            
            this.showToast(`✅ Dossier configuré: ${directoryHandle.name}`, 'success');
            this.refreshInterface();
            
            return true;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                this.showToast('📂 Sélection annulée', 'info');
            } else {
                console.error('[CategoriesPage] ❌ Erreur configuration:', error);
                this.showToast('❌ Erreur: ' + error.message, 'error');
            }
            return false;
        }
    }

    estimateFullPath(directoryHandle) {
        const folderName = directoryHandle.name || 'DossierSelectionne';
        
        // Estimation intelligente du chemin
        if (folderName.toLowerCase().includes('desktop')) {
            return `C:\\Users\\[Utilisateur]\\Desktop\\${folderName}\\`;
        } else if (folderName.toLowerCase().includes('documents')) {
            return `C:\\Users\\[Utilisateur]\\Documents\\${folderName}\\`;
        } else {
            return `C:\\${folderName}\\`;
        }
    }

    async testDirectoryAccess(directoryHandle) {
        const testFileName = '.test-emailsortpro-' + Date.now();
        
        try {
            const testFileHandle = await directoryHandle.getFileHandle(testFileName, { create: true });
            const writable = await testFileHandle.createWritable();
            await writable.write('Test EmailSortPro - ' + new Date().toISOString());
            await writable.close();
            await directoryHandle.removeEntry(testFileName);
            
            console.log('[CategoriesPage] ✅ Test accès réussi');
            return true;
        } catch (error) {
            throw new Error('Impossible d\'écrire dans ce dossier: ' + error.message);
        }
    }

    async saveConfig() {
        try {
            const config = {
                enabled: this.filesystemConfig.enabled,
                currentPath: this.filesystemConfig.currentPath,
                permissions: this.filesystemConfig.permissions,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('emailsortpro_filesystem_v24', JSON.stringify(config));
            console.log('[CategoriesPage] 💾 Configuration sauvegardée');
        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Erreur sauvegarde config:', error);
        }
    }

    async createReadmeFile() {
        if (!this.filesystemConfig.directoryHandle) return;
        
        try {
            const readmeContent = `# EmailSortPro - Sauvegarde des Catégories

## 📁 Emplacement
${this.filesystemConfig.currentPath}

## 📂 Fichiers
- EmailSortPro-Categories.json : Sauvegarde principale
- EmailSortPro-Categories-[DATE].json : Sauvegardes horodatées

## 🔄 Fonctionnement
- Sauvegarde automatique toutes les 30 secondes
- Conservation des 10 derniers fichiers
- Format JSON lisible

## 📋 Contenu
- Toutes vos catégories personnalisées
- Mots-clés et filtres
- Paramètres et statistiques

---
Généré par EmailSortPro v24.0
Date: ${new Date().toLocaleString('fr-FR')}
`;

            const readmeHandle = await this.filesystemConfig.directoryHandle.getFileHandle('README-EmailSortPro.txt', { create: true });
            const writable = await readmeHandle.createWritable();
            await writable.write(readmeContent);
            await writable.close();

        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Impossible de créer README:', error);
        }
    }

    // ================================================
    // SYSTÈME DE BACKUP SIMPLIFIÉ
    // ================================================
    initializeBackup() {
        console.log('[CategoriesPage] 🔄 Initialisation backup...');
        
        this.startChangeDetection();
        this.startAutoBackup();
        
        // Backup initial
        setTimeout(() => this.createBackup('initial'), 2000);
    }

    startChangeDetection() {
        // Surveiller les changements dans CategoryManager
        if (window.categoryManager) {
            ['createCustomCategory', 'updateCategoryKeywords', 'deleteCustomCategory'].forEach(method => {
                if (typeof window.categoryManager[method] === 'function') {
                    const original = window.categoryManager[method].bind(window.categoryManager);
                    window.categoryManager[method] = (...args) => {
                        const result = original(...args);
                        this.onCategoriesChanged(method);
                        return result;
                    };
                }
            });
        }
        
        document.addEventListener('categorySettingsChanged', () => {
            this.onCategoriesChanged('settings');
        });
        
        console.log('[CategoriesPage] 👁️ Surveillance activée');
    }

    onCategoriesChanged(source) {
        console.log(`[CategoriesPage] 📝 Changement: ${source}`);
        this.pendingChanges = true;
        
        // Backup immédiat pour changements critiques
        if (['createCustomCategory', 'deleteCustomCategory'].includes(source)) {
            setTimeout(() => this.createBackup('critical'), 1000);
        }
    }

    startAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        
        this.backupTimer = setInterval(() => {
            if (this.pendingChanges) {
                this.createBackup('auto');
                this.pendingChanges = false;
            }
        }, this.backupConfig.interval);
        
        console.log('[CategoriesPage] ⏰ Timer backup démarré');
    }

    async createBackup(type = 'manual') {
        try {
            const backupData = this.collectData(type);
            const dataString = JSON.stringify(backupData, null, 2);
            
            // Backup filesystem si configuré
            let filesystemSuccess = false;
            if (this.filesystemConfig.enabled && this.filesystemConfig.directoryHandle) {
                filesystemSuccess = await this.saveToFilesystem(dataString, type);
            }
            
            // Backup invisible (localStorage + cache)
            const invisibleSuccess = this.saveToInvisible(backupData);
            
            if (type === 'manual') {
                if (filesystemSuccess || invisibleSuccess) {
                    this.showToast('✅ Backup créé avec succès!', 'success');
                } else {
                    this.showToast('❌ Échec du backup', 'error');
                }
            }
            
            return filesystemSuccess || invisibleSuccess;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur backup:', error);
            if (type === 'manual') {
                this.showToast('❌ Erreur backup: ' + error.message, 'error');
            }
            return false;
        }
    }

    async saveToFilesystem(dataString, type) {
        try {
            // Fichier principal
            const mainHandle = await this.filesystemConfig.directoryHandle.getFileHandle(this.filesystemConfig.filename, { create: true });
            const mainWritable = await mainHandle.createWritable();
            await mainWritable.write(dataString);
            await mainWritable.close();
            
            // Fichier horodaté si manuel
            if (type === 'manual') {
                const timestamp = new Date().toISOString().split('T')[0];
                const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
                const timestampedFilename = `EmailSortPro-Categories-${timestamp}_${timeStr}.json`;
                
                const timestampedHandle = await this.filesystemConfig.directoryHandle.getFileHandle(timestampedFilename, { create: true });
                const timestampedWritable = await timestampedHandle.createWritable();
                await timestampedWritable.write(dataString);
                await timestampedWritable.close();
            }
            
            console.log(`[CategoriesPage] ✅ Backup filesystem: ${this.filesystemConfig.filename}`);
            return true;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur backup filesystem:', error);
            
            // Si erreur d'accès, marquer comme non disponible
            if (error.name === 'NotAllowedError') {
                this.filesystemConfig.enabled = false;
                this.filesystemConfig.permissions = 'denied';
            }
            
            return false;
        }
    }

    saveToInvisible(data) {
        try {
            // localStorage principal
            localStorage.setItem('emailsortpro_categories_backup', JSON.stringify(data));
            
            // localStorage avec timestamp
            const timestamp = Date.now();
            localStorage.setItem(`emailsortpro_categories_${timestamp}`, JSON.stringify(data));
            
            // Nettoyer anciens
            this.cleanupLocalStorage();
            
            console.log('[CategoriesPage] ✅ Backup invisible créé');
            return true;
        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Erreur backup invisible:', error);
            return false;
        }
    }

    cleanupLocalStorage() {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith('emailsortpro_categories_') && key.includes('_'))
                .sort()
                .reverse();
            
            if (keys.length > 5) {
                keys.slice(5).forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            // Ignore
        }
    }

    collectData(type) {
        const data = {
            version: '24.0-categories-direct',
            timestamp: new Date().toISOString(),
            type: type,
            filesystem: {
                enabled: this.filesystemConfig.enabled,
                path: this.filesystemConfig.currentPath
            },
            categories: {},
            settings: {}
        };
        
        try {
            if (window.categoryManager) {
                data.categories = {
                    all: window.categoryManager.getCategories() || {},
                    custom: window.categoryManager.getCustomCategories ? 
                           window.categoryManager.getCustomCategories() : {},
                    activeCategories: window.categoryManager.getActiveCategories ? 
                                    window.categoryManager.getActiveCategories() : null
                };
            }
            
            data.settings = this.loadSettings();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur collecte données:', error);
            data.error = error.message;
        }
        
        return data;
    }

    // ================================================
    // INTERFACE UTILISATEUR SIMPLIFIÉE
    // ================================================
    render(container) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant');
            return;
        }

        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            container.innerHTML = `
                <div class="categories-page-container">
                    <!-- Header -->
                    <div class="page-header">
                        <div class="header-content">
                            <div class="header-info">
                                <h1><i class="fas fa-tags"></i> Gestion des Catégories</h1>
                                <p>Organisez vos catégories avec sauvegarde C://</p>
                            </div>
                            <button class="btn-create" onclick="window.categoriesPageV24.showCreateModal()">
                                <i class="fas fa-plus"></i> Nouvelle catégorie
                            </button>
                        </div>
                    </div>
                    
                    <!-- Onglets -->
                    <div class="tabs-container">
                        <div class="tabs-nav">
                            <button class="tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV24.switchTab('categories')">
                                <i class="fas fa-tags"></i> Catégories
                                <span class="count">${Object.keys(categories).length}</span>
                            </button>
                            <button class="tab-btn ${this.activeTab === 'backup' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV24.switchTab('backup')">
                                <i class="fas fa-hdd"></i> Sauvegarde C://
                                <span class="status ${this.filesystemConfig.enabled ? 'ok' : 'warning'}"></span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Contenu -->
                    <div class="tab-content">
                        <div id="categories-tab" class="tab-panel ${this.activeTab === 'categories' ? 'active' : ''}">
                            ${this.renderCategoriesTab(categories)}
                        </div>
                        
                        <div id="backup-tab" class="tab-panel ${this.activeTab === 'backup' ? 'active' : ''}">
                            ${this.renderBackupTab()}
                        </div>
                    </div>
                </div>
            `;
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = '<div class="error">Erreur de chargement</div>';
        }
    }

    renderCategoriesTab(categories) {
        const filtered = this.filterCategories(categories);
        
        return `
            <!-- Recherche -->
            <div class="search-section">
                <div class="search-input">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Rechercher..." 
                           onkeyup="window.categoriesPageV24.handleSearch(this.value)">
                </div>
            </div>
            
            <!-- Grille catégories -->
            <div class="categories-grid" id="categories-container">
                ${this.renderCategories(filtered)}
            </div>
        `;
    }

    renderCategories(categories) {
        if (Object.keys(categories).length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>Aucune catégorie</h3>
                    <p>Créez votre première catégorie</p>
                </div>
            `;
        }
        
        return Object.entries(categories)
            .map(([id, category]) => this.renderCategoryCard(id, category))
            .join('');
    }

    renderCategoryCard(id, category) {
        return `
            <div class="category-card" onclick="window.categoriesPageV24.openModal('${id}')">
                <div class="card-header">
                    <div class="category-icon" style="background: ${category.color};">
                        <i class="fas fa-tag"></i>
                    </div>
                    <div class="category-info">
                        <div class="category-name">${category.name}</div>
                        <div class="category-desc">${category.description || 'Catégorie personnalisée'}</div>
                    </div>
                </div>
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="window.categoriesPageV24.openModal('${id}')" 
                            title="Configurer">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderBackupTab() {
        const isConfigured = this.filesystemConfig.enabled;
        const currentPath = this.filesystemConfig.currentPath || 'Non configuré';
        
        return `
            <div class="backup-content">
                <!-- Status -->
                <div class="status-card ${isConfigured ? 'configured' : 'not-configured'}">
                    <div class="status-header">
                        <div class="status-icon">
                            <i class="fas fa-${isConfigured ? 'check-circle' : 'cog'}"></i>
                        </div>
                        <div class="status-info">
                            <h3>${isConfigured ? 'Sauvegarde Configurée' : 'Configuration Requise'}</h3>
                            <p class="path"><i class="fas fa-folder"></i> ${currentPath}</p>
                        </div>
                    </div>
                    
                    <div class="status-actions">
                        <button class="btn-action primary" onclick="window.categoriesPageV24.createBackup('manual')">
                            <i class="fas fa-save"></i> Sauvegarder
                        </button>
                        
                        ${this.fileSystemSupported ? `
                            <button class="btn-action ${isConfigured ? 'secondary' : 'warning'}" 
                                    onclick="window.categoriesPageV24.configureDirectAccess()">
                                <i class="fas fa-folder-open"></i> 
                                ${isConfigured ? 'Changer Dossier' : 'Configurer C://'}
                            </button>
                        ` : `
                            <p class="browser-notice">
                                <i class="fas fa-info-circle"></i>
                                Utilisez Chrome ou Edge pour l'accès aux fichiers C://
                            </p>
                        `}
                    </div>
                </div>
                
                ${isConfigured ? `
                    <!-- Actions -->
                    <div class="actions-card">
                        <h4><i class="fas fa-tools"></i> Actions</h4>
                        <div class="actions-grid">
                            <button class="action-item" onclick="window.categoriesPageV24.createBackup('manual')">
                                <i class="fas fa-save"></i>
                                <div>
                                    <div class="action-title">Backup Immédiat</div>
                                    <div class="action-desc">Créer maintenant</div>
                                </div>
                            </button>
                            
                            <button class="action-item" onclick="window.categoriesPageV24.showPathInfo()">
                                <i class="fas fa-info"></i>
                                <div>
                                    <div class="action-title">Infos Dossier</div>
                                    <div class="action-desc">Voir emplacement</div>
                                </div>
                            </button>
                            
                            <button class="action-item" onclick="window.categoriesPageV24.downloadBackup()">
                                <i class="fas fa-download"></i>
                                <div>
                                    <div class="action-title">Télécharger</div>
                                    <div class="action-desc">Fichier de sauvegarde</div>
                                </div>
                            </button>
                            
                            <button class="action-item" onclick="window.categoriesPageV24.testAccess()">
                                <i class="fas fa-vial"></i>
                                <div>
                                    <div class="action-title">Test Accès</div>
                                    <div class="action-desc">Vérifier permissions</div>
                                </div>
                            </button>
                        </div>
                    </div>
                ` : `
                    <!-- Guide -->
                    <div class="guide-card">
                        <h4><i class="fas fa-lightbulb"></i> Configuration C://</h4>
                        <ol>
                            <li>Cliquez sur "Configurer C://"</li>
                            <li>Sélectionnez un dossier sur votre disque C:// (ex: C:\\EmailSortPro)</li>
                            <li>Accordez les permissions de lecture/écriture</li>
                            <li>Vos backups seront automatiquement sauvegardés !</li>
                        </ol>
                        <p class="note">
                            <i class="fas fa-shield-alt"></i>
                            Vos données restent privées sur votre ordinateur
                        </p>
                    </div>
                `}
                
                <!-- Info technique -->
                <div class="tech-info">
                    <details>
                        <summary><i class="fas fa-info-circle"></i> Informations Techniques</summary>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Support API:</strong>
                                <span class="${this.fileSystemSupported ? 'ok' : 'error'}">
                                    ${this.fileSystemSupported ? '✅ Supporté' : '❌ Non supporté'}
                                </span>
                            </div>
                            <div class="info-item">
                                <strong>Permissions:</strong>
                                <span class="${this.filesystemConfig.permissions === 'granted' ? 'ok' : 'warning'}">
                                    ${this.filesystemConfig.permissions === 'granted' ? '✅ Accordées' : 
                                      this.filesystemConfig.permissions === 'denied' ? '❌ Refusées' : '⚠️ En attente'}
                                </span>
                            </div>
                            <div class="info-item">
                                <strong>Auto-sauvegarde:</strong>
                                <span class="ok">✅ Activée (30s)</span>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS UTILISATEUR
    // ================================================
    switchTab(tabName) {
        this.activeTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tabName));
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.updateCategoriesDisplay();
    }

    filterCategories(categories) {
        if (!this.searchTerm) return categories;
        
        const filtered = {};
        Object.entries(categories).forEach(([id, category]) => {
            if (category.name.toLowerCase().includes(this.searchTerm)) {
                filtered[id] = category;
            }
        });
        return filtered;
    }

    updateCategoriesDisplay() {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        const categories = window.categoryManager?.getCategories() || {};
        container.innerHTML = this.renderCategories(this.filterCategories(categories));
    }

    showCreateModal() {
        this.showModal('Nouvelle Catégorie', `
            <div class="create-form">
                <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" id="category-name" placeholder="Ex: Projets, Factures..." autofocus>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" id="category-desc" placeholder="Description (optionnel)">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Couleur</label>
                        <select id="category-color">
                            <option value="#3B82F6">🔵 Bleu</option>
                            <option value="#10B981">🟢 Vert</option>
                            <option value="#F59E0B">🟡 Orange</option>
                            <option value="#EF4444">🔴 Rouge</option>
                            <option value="#8B5CF6">🟣 Violet</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Mots-clés de base</label>
                    <input type="text" id="category-keywords" placeholder="Séparés par des virgules">
                    <small>Ces mots-clés seront utilisés pour la détection automatique</small>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-secondary" onclick="window.categoriesPageV24.closeModal()">Annuler</button>
                <button class="btn-primary" onclick="window.categoriesPageV24.createCategory()">Créer</button>
            </div>
        `);
    }

    createCategory() {
        const name = document.getElementById('category-name')?.value?.trim();
        const desc = document.getElementById('category-desc')?.value?.trim();
        const color = document.getElementById('category-color')?.value || '#3B82F6';
        const keywords = document.getElementById('category-keywords')?.value?.trim();
        
        if (!name) {
            this.showToast('⚠️ Le nom est requis', 'warning');
            return;
        }
        
        const categoryData = {
            name,
            description: desc,
            color,
            priority: 30,
            isCustom: true,
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };
        
        if (keywords) {
            const keywordList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
            categoryData.keywords.strong = keywordList;
        }
        
        try {
            const newCategory = window.categoryManager?.createCustomCategory(categoryData);
            
            if (newCategory) {
                this.closeModal();
                this.showToast(`✅ Catégorie "${name}" créée!`, 'success');
                this.updateCategoriesDisplay();
                this.onCategoriesChanged('create');
            } else {
                this.showToast('❌ Erreur lors de la création', 'error');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur création:', error);
            this.showToast('❌ Erreur: ' + error.message, 'error');
        }
    }

    openModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        this.showModal(`Configuration - ${category.name}`, `
            <div class="category-config">
                <div class="config-section">
                    <h4>Informations</h4>
                    <div class="info-display">
                        <div class="info-item">
                            <strong>Nom:</strong> ${category.name}
                        </div>
                        <div class="info-item">
                            <strong>Couleur:</strong>
                            <span class="color-box" style="background: ${category.color};"></span>
                            ${category.color}
                        </div>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4>Actions</h4>
                    <div class="actions-row">
                        <button class="btn-secondary" onclick="window.categoriesPageV24.editCategory('${categoryId}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        ${category.isCustom ? `
                            <button class="btn-danger" onclick="window.categoriesPageV24.deleteCategory('${categoryId}')">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `);
    }

    editCategory(categoryId) {
        this.showToast('🔧 Modification - Fonctionnalité à venir', 'info');
        this.closeModal();
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Supprimer "${category.name}" ?\n\nCette action est irréversible.`)) {
            try {
                const success = window.categoryManager?.deleteCustomCategory(categoryId);
                
                if (success) {
                    this.closeModal();
                    this.showToast(`🗑️ "${category.name}" supprimée`, 'success');
                    this.updateCategoriesDisplay();
                    this.onCategoriesChanged('delete');
                } else {
                    this.showToast('❌ Erreur suppression', 'error');
                }
            } catch (error) {
                this.showToast('❌ Erreur: ' + error.message, 'error');
            }
        }
    }

    async showPathInfo() {
        const path = this.filesystemConfig.currentPath;
        
        this.showModal('Emplacement des Sauvegardes', `
            <div class="path-info">
                <div class="path-display">
                    <i class="fas fa-folder"></i>
                    <span class="path-text">${path}</span>
                    <button class="btn-copy" onclick="window.categoriesPageV24.copyPath('${path.replace(/\\/g, '\\\\')}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                
                <div class="path-details">
                    <h4>Fichiers créés :</h4>
                    <ul>
                        <li><strong>EmailSortPro-Categories.json</strong> - Sauvegarde principale</li>
                        <li><strong>EmailSortPro-Categories-[DATE].json</strong> - Sauvegardes horodatées</li>
                        <li><strong>README-EmailSortPro.txt</strong> - Documentation</li>
                    </ul>
                </div>
            </div>
        `);
    }

    async copyPath(path) {
        try {
            await navigator.clipboard.writeText(path);
            this.showToast('📋 Chemin copié!', 'success');
        } catch (error) {
            this.showToast('❌ Impossible de copier', 'error');
        }
    }

    async downloadBackup() {
        try {
            const data = this.collectData('download');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `EmailSortPro-Categories-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showToast('📥 Backup téléchargé!', 'success');
        } catch (error) {
            this.showToast('❌ Erreur téléchargement', 'error');
        }
    }

    async testAccess() {
        if (!this.filesystemConfig.directoryHandle) {
            this.showToast('❌ Aucun dossier configuré', 'error');
            return;
        }
        
        try {
            await this.testDirectoryAccess(this.filesystemConfig.directoryHandle);
            this.showToast('✅ Test d\'accès réussi!', 'success');
        } catch (error) {
            this.showToast('❌ Test échoué: ' + error.message, 'error');
        }
    }

    refreshInterface() {
        // Recharger l'interface si on est sur l'onglet backup
        if (this.activeTab === 'backup') {
            const container = document.querySelector('.categories-page-container').parentElement;
            if (container) this.render(container);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    showModal(title, content) {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="window.categoriesPageV24.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">${content}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }

    showToast(message, type = 'info') {
        console.log(`[CategoriesPage] ${type.toUpperCase()}: ${message}`);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type, 3000);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }

    destroy() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        console.log('[CategoriesPage] 🧹 Instance détruite');
    }

    // ================================================
    // STYLES COMPACTS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStylesV24')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStylesV24';
        styles.textContent = `
            .categories-page-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            }

            .page-header {
                background: white;
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 24px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-content h1 {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .header-content p {
                font-size: 14px;
                color: #6b7280;
                margin: 4px 0 0 0;
            }

            .btn-create {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.15s ease;
            }

            .btn-create:hover {
                background: #2563EB;
                transform: translateY(-1px);
            }

            .tabs-container {
                background: white;
                border-radius: 8px;
                margin-bottom: 24px;
                border: 1px solid #e2e8f0;
                overflow: hidden;
            }

            .tabs-nav {
                display: flex;
                border-bottom: 1px solid #e2e8f0;
            }

            .tab-btn {
                flex: 1;
                background: none;
                border: none;
                padding: 16px 20px;
                font-size: 14px;
                font-weight: 500;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.15s ease;
                position: relative;
            }

            .tab-btn:hover {
                background: #f8fafc;
                color: #374151;
            }

            .tab-btn.active {
                color: #3B82F6;
                background: #f0f9ff;
            }

            .tab-btn.active::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: #3B82F6;
            }

            .count {
                background: #e5e7eb;
                color: #6b7280;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }

            .tab-btn.active .count {
                background: #dbeafe;
                color: #3B82F6;
            }

            .status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #e5e7eb;
            }

            .status.ok {
                background: #10b981;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            }

            .status.warning {
                background: #f59e0b;
                box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
            }

            .tab-content {
                background: white;
                border-radius: 8px;
                padding: 24px;
                border: 1px solid #e2e8f0;
            }

            .tab-panel {
                display: none;
            }

            .tab-panel.active {
                display: block;
            }

            .search-section {
                margin-bottom: 24px;
            }

            .search-input {
                position: relative;
                max-width: 400px;
            }

            .search-input i {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
            }

            .search-input input {
                width: 100%;
                padding: 10px 12px 10px 36px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.15s ease;
            }

            .search-input input:focus {
                outline: none;
                border-color: #3B82F6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 16px;
            }

            .category-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.15s ease;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .category-card:hover {
                border-color: #3B82F6;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transform: translateY(-1px);
            }

            .card-header {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .category-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
            }

            .category-info {
                flex: 1;
            }

            .category-name {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .category-desc {
                font-size: 12px;
                color: #9ca3af;
            }

            .card-actions {
                display: flex;
                justify-content: flex-end;
            }

            .action-btn {
                width: 28px;
                height: 28px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                transition: all 0.15s ease;
                color: #6b7280;
            }

            .action-btn:hover {
                border-color: #9ca3af;
                transform: scale(1.05);
            }

            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
                grid-column: 1 / -1;
            }

            .empty-state i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #d1d5db;
            }

            .empty-state h3 {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin: 0 0 8px 0;
            }

            .backup-content {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .status-card {
                border-radius: 8px;
                padding: 24px;
                border: 2px solid #e2e8f0;
            }

            .status-card.configured {
                border-color: #10b981;
                background: #f0fdf4;
            }

            .status-card.not-configured {
                border-color: #f59e0b;
                background: #fffbeb;
            }

            .status-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .status-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }

            .status-card.configured .status-icon {
                background: #10b981;
                color: white;
            }

            .status-card.not-configured .status-icon {
                background: #f59e0b;
                color: white;
            }

            .status-info h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
            }

            .path {
                font-size: 12px;
                color: #6b7280;
                font-family: monospace;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .status-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .btn-action {
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.15s ease;
            }

            .btn-action.primary {
                background: #3B82F6;
                color: white;
            }

            .btn-action.primary:hover {
                background: #2563EB;
            }

            .btn-action.secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .btn-action.secondary:hover {
                background: #e5e7eb;
            }

            .btn-action.warning {
                background: #f59e0b;
                color: white;
            }

            .btn-action.warning:hover {
                background: #d97706;
            }

            .browser-notice {
                font-size: 13px;
                color: #6b7280;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .actions-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .actions-card h4 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 16px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .action-item {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.15s ease;
                text-align: left;
            }

            .action-item:hover {
                border-color: #3B82F6;
                background: #f0f9ff;
            }

            .action-item i {
                font-size: 16px;
                color: #3B82F6;
                width: 20px;
                text-align: center;
            }

            .action-title {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 2px;
            }

            .action-desc {
                font-size: 12px;
                color: #6b7280;
            }

            .guide-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .guide-card h4 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 16px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .guide-card ol {
                margin: 0 0 16px 0;
                padding-left: 20px;
            }

            .guide-card li {
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .note {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 6px;
                padding: 12px;
                margin: 0;
                font-size: 13px;
                color: #0369a1;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .tech-info {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
            }

            .tech-info summary {
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                margin-top: 12px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background: #f8fafc;
                border-radius: 4px;
                font-size: 13px;
            }

            .ok { color: #10b981; }
            .error { color: #ef4444; }
            .warning { color: #f59e0b; }

            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }

            .modal-content {
                background: white;
                border-radius: 8px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e2e8f0;
                background: #f8fafc;
            }

            .modal-header h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }

            .modal-close {
                background: none;
                border: none;
                padding: 4px;
                cursor: pointer;
                color: #6b7280;
                font-size: 16px;
                border-radius: 4px;
                transition: all 0.15s ease;
            }

            .modal-close:hover {
                color: #374151;
                background: #f3f4f6;
            }

            .modal-body {
                padding: 20px;
                overflow-y: auto;
                max-height: 70vh;
            }

            .modal-actions {
                padding: 16px 20px;
                border-top: 1px solid #e2e8f0;
                background: #f8fafc;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            .btn-primary {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
            }

            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
            }

            .btn-danger {
                background: #ef4444;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
            }

            .create-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .form-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }

            .form-group label {
                font-size: 13px;
                font-weight: 500;
                color: #374151;
            }

            .form-group input,
            .form-group select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 13px;
            }

            .form-group small {
                font-size: 11px;
                color: #6b7280;
                margin-top: 2px;
            }

            .category-config {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .config-section {
                padding-bottom: 16px;
                border-bottom: 1px solid #f1f5f9;
            }

            .config-section:last-child {
                border-bottom: none;
            }

            .config-section h4 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 12px 0;
            }

            .info-display {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .color-box {
                width: 16px;
                height: 16px;
                border-radius: 2px;
                border: 1px solid #e5e7eb;
            }

            .actions-row {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .path-info {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .path-display {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .path-text {
                flex: 1;
                font-family: monospace;
                font-size: 12px;
                word-break: break-all;
            }

            .btn-copy {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }

            .path-details h4 {
                font-size: 14px;
                margin: 0 0 8px 0;
            }

            .path-details ul {
                margin: 0;
                padding-left: 20px;
            }

            .path-details li {
                margin-bottom: 4px;
                font-size: 13px;
            }

            .error {
                text-align: center;
                padding: 40px;
                color: #ef4444;
                font-size: 16px;
            }

            @media (max-width: 768px) {
                .categories-page-container {
                    padding: 12px;
                }

                .header-content {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }

                .categories-grid {
                    grid-template-columns: 1fr;
                }

                .status-actions {
                    flex-direction: column;
                }

                .actions-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INTÉGRATION GLOBALE
// ================================================

// Nettoyer l'ancienne instance
if (window.categoriesPageV23) {
    try {
        if (window.categoriesPageV23.destroy) {
            window.categoriesPageV23.destroy();
        }
        delete window.categoriesPageV23;
    } catch (error) {
        // Ignore
    }
}

// Créer la nouvelle instance
window.categoriesPageV24 = new CategoriesPageV24();

// Alias pour compatibilité
window.categoriesPage = window.categoriesPageV24;

// Intégration avec PageManager
if (window.pageManager && window.pageManager.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPageV24.render(container);
    };
    
    window.pageManager.pages.categories = (container) => {
        window.categoriesPageV24.render(container);
    };
}

// API publique pour tests
window.testCategoriesBackup = async function() {
    console.log('[TEST] 🧪 Test backup catégories...');
    
    const instance = window.categoriesPageV24;
    
    try {
        const success = await instance.createBackup('test');
        
        if (success) {
            console.log('[TEST] ✅ Backup test réussi');
            console.log('[TEST] 📁 Configuré:', instance.filesystemConfig.enabled);
            console.log('[TEST] 📂 Chemin:', instance.filesystemConfig.currentPath);
            return { success: true, configured: instance.filesystemConfig.enabled };
        } else {
            console.log('[TEST] ❌ Backup test échoué');
            return { success: false, error: 'Backup failed' };
        }
    } catch (error) {
        console.error('[TEST] ❌ Erreur test:', error);
        return { success: false, error: error.message };
    }
};

window.getCategoriesBackupInfo = function() {
    const instance = window.categoriesPageV24;
    
    return {
        configured: instance.filesystemConfig.enabled,
        path: instance.filesystemConfig.currentPath,
        permissions: instance.filesystemConfig.permissions,
        autoSave: instance.filesystemConfig.autoSave,
        fileSystemSupported: instance.fileSystemSupported
    };
};

window.forceConfigureBackup = async function() {
    console.log('[API] 🔧 Configuration forcée backup...');
    
    try {
        const success = await window.categoriesPageV24.configureDirectAccess();
        return { success, info: window.getCategoriesBackupInfo() };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

console.log('[CategoriesPage] ✅ CategoriesPage v24.0 chargée - Stockage C:// Direct Simplifié!');
console.log('[CategoriesPage] 🎯 Fonctionnalités principales:');
console.log('[CategoriesPage]   • Interface épurée et rapide');
console.log('[CategoriesPage]   • Configuration directe C:// (évite AppData)');
console.log('[CategoriesPage]   • Sauvegarde automatique toutes les 30s');
console.log('[CategoriesPage]   • Backup invisible en parallèle (localStorage)');
console.log('[CategoriesPage]   • API de test et diagnostic');
console.log('[CategoriesPage] 📁 API disponible:');
console.log('[CategoriesPage]   • window.testCategoriesBackup() - Tester');
console.log('[CategoriesPage]   • window.getCategoriesBackupInfo() - Infos');
console.log('[CategoriesPage]   • window.forceConfigureBackup() - Configurer');
console.log('[CategoriesPage] 🚀 Prêt pour stockage C:// direct!');
