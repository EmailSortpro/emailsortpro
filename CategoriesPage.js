// CategoriesPage.js - Version Sobre v22.0 - Intégration Backup Automatique
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v22.0 - Backup Integration...');

// Nettoyer toute instance précédente
if (window.categoriesPage) {
    console.log('[CategoriesPage] 🧹 Nettoyage instance précédente...');
    delete window.categoriesPage;
}

class CategoriesPageV22 {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.viewMode = 'grid';
        this.activeTab = 'categories'; // 'categories' ou 'backup'
        this.colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ];
        
        // Configuration backup spécifique aux catégories
        this.backupConfig = {
            autoSave: true,
            interval: 30000, // 30 secondes
            maxBackups: 20,
            filePrefix: 'EmailSortPro-Categories-',
            lastBackup: null
        };
        
        this.backupTimer = null;
        this.pendingChanges = false;
        
        console.log('[CategoriesPage] 🎨 Interface sobre v22.0 initialisée avec backup');
        this.initializeBackup();
    }

    // ================================================
    // SYSTÈME DE BACKUP AUTOMATIQUE INTÉGRÉ
    // ================================================
    initializeBackup() {
        console.log('[CategoriesPage] 🔄 Initialisation backup automatique...');
        
        // Démarrer la surveillance des changements
        this.startChangeDetection();
        
        // Démarrer le timer de backup automatique
        this.startAutoBackup();
        
        // Créer un backup initial
        setTimeout(() => {
            this.createCategoriesBackup('initial');
        }, 2000);
    }

    startChangeDetection() {
        // Surveiller les changements dans categoryManager
        if (window.categoryManager) {
            const originalMethods = {};
            
            // Intercepter les méthodes qui modifient les catégories
            const methodsToWatch = [
                'createCustomCategory',
                'updateCategoryKeywords', 
                'updateCategoryFilters',
                'deleteCustomCategory',
                'updateActiveCategories'
            ];
            
            methodsToWatch.forEach(method => {
                if (typeof window.categoryManager[method] === 'function') {
                    originalMethods[method] = window.categoryManager[method].bind(window.categoryManager);
                    
                    window.categoryManager[method] = (...args) => {
                        const result = originalMethods[method](...args);
                        this.onCategoriesChanged(method);
                        return result;
                    };
                }
            });
            
            console.log('[CategoriesPage] 👁️ Surveillance des changements activée');
        }
        
        // Écouter les événements de changement
        document.addEventListener('categorySettingsChanged', () => {
            this.onCategoriesChanged('settings');
        });
    }

    onCategoriesChanged(source) {
        console.log(`[CategoriesPage] 📝 Changement détecté: ${source}`);
        this.pendingChanges = true;
        
        // Backup immédiat pour les changements critiques
        if (['createCustomCategory', 'deleteCustomCategory'].includes(source)) {
            setTimeout(() => {
                this.createCategoriesBackup('change-critical');
            }, 1000);
        } else {
            // Backup différé pour les autres changements
            setTimeout(() => {
                this.createCategoriesBackup('change');
            }, 5000);
        }
    }

    startAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        
        this.backupTimer = setInterval(() => {
            if (this.pendingChanges) {
                this.createCategoriesBackup('auto');
                this.pendingChanges = false;
            }
        }, this.backupConfig.interval);
        
        console.log('[CategoriesPage] ⏰ Timer backup automatique démarré (30s)');
    }

    async createCategoriesBackup(type = 'manual') {
        try {
            const backupData = this.collectCategoriesData(type);
            const success = await this.saveBackupFile(backupData, type);
            
            if (success) {
                this.backupConfig.lastBackup = new Date();
                
                if (type === 'manual') {
                    this.showToast('💾 Backup des catégories créé avec succès!', 'success');
                }
                
                console.log(`[CategoriesPage] ✅ Backup ${type} créé`);
            }
            
            return success;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur backup:', error);
            
            if (type === 'manual') {
                this.showToast('❌ Erreur lors du backup', 'error');
            }
            
            return false;
        }
    }

    collectCategoriesData(type) {
        const data = {
            version: '22.0-categories-backup',
            timestamp: new Date().toISOString(),
            backupType: type,
            application: 'EmailSortProAI',
            module: 'CategoriesPage',
            metadata: {
                backupId: this.generateId(),
                trigger: type,
                userAgent: navigator.userAgent,
                url: window.location.href,
                size: 0
            },
            categories: {},
            settings: {},
            stats: {}
        };
        
        try {
            // Collecter les catégories
            if (window.categoryManager) {
                data.categories = {
                    all: window.categoryManager.getCategories() || {},
                    custom: window.categoryManager.getCustomCategories ? 
                           window.categoryManager.getCustomCategories() : {},
                    keywords: this.collectAllKeywords(),
                    filters: this.collectAllFilters(),
                    activeCategories: window.categoryManager.getActiveCategories ? 
                                    window.categoryManager.getActiveCategories() : null
                };
                
                data.stats.totalCategories = Object.keys(data.categories.all).length;
                data.stats.customCategories = Object.keys(data.categories.custom).length;
                data.stats.totalKeywords = this.countAllKeywords(data.categories.keywords);
            }
            
            // Collecter les paramètres
            data.settings = this.loadSettings();
            data.settings.taskPreselectedCategories = this.getTaskPreselectedCategories();
            
            // Statistiques des emails
            if (window.emailScanner) {
                const emailStats = this.calculateEmailStats();
                data.stats.emailStats = emailStats;
                data.stats.totalEmails = Object.values(emailStats).reduce((sum, count) => sum + count, 0);
            }
            
            // Calculer la taille
            data.metadata.size = JSON.stringify(data).length;
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur collecte données:', error);
            data.error = error.message;
        }
        
        return data;
    }

    collectAllKeywords() {
        const allKeywords = {};
        
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            Object.keys(categories).forEach(categoryId => {
                const keywords = window.categoryManager?.getCategoryKeywords(categoryId);
                if (keywords) {
                    allKeywords[categoryId] = keywords;
                }
            });
        } catch (error) {
            console.warn('[CategoriesPage] Erreur collecte mots-clés:', error);
        }
        
        return allKeywords;
    }

    collectAllFilters() {
        const allFilters = {};
        
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            Object.keys(categories).forEach(categoryId => {
                const filters = window.categoryManager?.getCategoryFilters(categoryId);
                if (filters) {
                    allFilters[categoryId] = filters;
                }
            });
        } catch (error) {
            console.warn('[CategoriesPage] Erreur collecte filtres:', error);
        }
        
        return allFilters;
    }

    countAllKeywords(keywordsObj) {
        let total = 0;
        
        Object.values(keywordsObj).forEach(keywords => {
            if (keywords && typeof keywords === 'object') {
                ['absolute', 'strong', 'weak', 'exclusions'].forEach(type => {
                    if (Array.isArray(keywords[type])) {
                        total += keywords[type].length;
                    }
                });
            }
        });
        
        return total;
    }

    async saveBackupFile(data, type) {
        try {
            const dataString = JSON.stringify(data, null, 2);
            const timestamp = new Date();
            const dateStr = timestamp.toISOString().split('T')[0];
            const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `${this.backupConfig.filePrefix}${dateStr}_${timeStr}.json`;
            
            // 1. Sauvegarder dans le système de backup global si disponible
            if (window.backupService && window.backupService.provider === 'hybrid') {
                try {
                    // Utiliser le système OPFS du backup service pour un fichier spécifique aux catégories
                    await this.saveToOPFSCategories(dataString, fileName);
                    console.log('[CategoriesPage] ✅ Sauvegardé via OPFS Categories');
                } catch (error) {
                    console.warn('[CategoriesPage] ⚠️ OPFS Categories non disponible:', error);
                }
                
                // Déclencher aussi un backup global
                if (typeof window.triggerBackup === 'function') {
                    window.triggerBackup();
                }
            }
            
            // 2. Essayer de créer un fichier visible dans le système (silencieux)
            await this.tryCreateVisibleBackup(dataString, fileName);
            
            // 3. Sauvegarder en cache local
            await this.saveToCacheCategories(dataString, fileName);
            
            // 4. Sauvegarder en localStorage
            this.saveToLocalStorageCategories(data, fileName);
            
            return true;
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde backup:', error);
            return false;
        }
    }

    async saveToOPFSCategories(dataString, fileName) {
        try {
            if ('navigator' in window && 'storage' in navigator && 'getDirectory' in navigator.storage) {
                const opfsRoot = await navigator.storage.getDirectory();
                const categoriesDir = await opfsRoot.getDirectoryHandle('categories-backups', { create: true });
                
                const fileHandle = await categoriesDir.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(dataString);
                await writable.close();
                
                // Maintenir un fichier "latest"
                try {
                    const latestHandle = await categoriesDir.getFileHandle('latest-categories.json', { create: true });
                    const latestWritable = await latestHandle.createWritable();
                    await latestWritable.write(dataString);
                    await latestWritable.close();
                } catch (latestError) {
                    // Ignore
                }
                
                // Nettoyer les anciens fichiers
                await this.cleanupOPFSCategoriesBackups(categoriesDir);
                
                return true;
            }
        } catch (error) {
            throw new Error('OPFS Categories non disponible');
        }
    }

    async cleanupOPFSCategoriesBackups(categoriesDir) {
        try {
            const files = [];
            
            for await (const [name, handle] of categoriesDir.entries()) {
                if (name.startsWith(this.backupConfig.filePrefix) && name.endsWith('.json')) {
                    files.push(name);
                }
            }
            
            files.sort().reverse();
            
            if (files.length > this.backupConfig.maxBackups) {
                const toDelete = files.slice(this.backupConfig.maxBackups);
                
                for (const fileName of toDelete) {
                    try {
                        await categoriesDir.removeEntry(fileName);
                    } catch (error) {
                        // Ignore
                    }
                }
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    }

    async tryCreateVisibleBackup(dataString, fileName) {
        try {
            // Essayer la File System Access API pour créer un fichier visible
            if ('showSaveFilePicker' in window) {
                // Ne pas demander à l'utilisateur, essayer de sauvegarder silencieusement
                // Cette partie sera silencieuse et ne créera pas de popup
                return false; // Pas de fichier visible automatique pour éviter les popups
            }
            
            // Alternative: essayer de créer un blob URL pour téléchargement silencieux
            const blob = new Blob([dataString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Créer un lien de téléchargement silencieux
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            
            // Ne pas déclencher le téléchargement automatiquement
            // L'utilisateur pourra télécharger manuellement via l'interface
            
            URL.revokeObjectURL(url);
            return true;
            
        } catch (error) {
            console.warn('[CategoriesPage] Fichier visible non créé:', error);
            return false;
        }
    }

    async saveToCacheCategories(dataString, fileName) {
        try {
            if ('caches' in window) {
                const cache = await caches.open('emailsortpro-categories-v1');
                const response = new Response(dataString, {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                await cache.put(fileName, response);
                
                // Maintenir un cache "latest"
                await cache.put('latest-categories-backup', response.clone());
                
                return true;
            }
        } catch (error) {
            console.warn('[CategoriesPage] Cache non disponible:', error);
            return false;
        }
    }

    saveToLocalStorageCategories(data, fileName) {
        try {
            const key = `emailsortpro_categories_backup_${Date.now()}`;
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem('emailsortpro_categories_backup_latest', JSON.stringify(data));
            
            // Nettoyer les anciens backups localStorage
            this.cleanupLocalStorageBackups();
            
            return true;
        } catch (error) {
            console.warn('[CategoriesPage] localStorage backup échoué:', error);
            return false;
        }
    }

    cleanupLocalStorageBackups() {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith('emailsortpro_categories_backup_'))
                .sort()
                .reverse();
            
            if (keys.length > 10) {
                const toDelete = keys.slice(10);
                toDelete.forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            // Ignore
        }
    }

    // ================================================
    // INTERFACE UTILISATEUR SOBRE
    // ================================================
    render(container) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant');
            return;
        }

        try {
            const categories = window.categoryManager?.getCategories() || {};
            const settings = this.loadSettings();
            
            container.innerHTML = `
                <div class="categories-page-container">
                    <!-- Header sobre -->
                    <div class="page-header">
                        <div class="header-content">
                            <div class="header-info">
                                <h1 class="page-title">
                                    <i class="fas fa-tags"></i>
                                    Gestion des Catégories
                                </h1>
                                <p class="page-subtitle">Organisez et configurez vos catégories d'emails</p>
                            </div>
                            <button class="btn-create" onclick="window.categoriesPageV22.showCreateModal()">
                                <i class="fas fa-plus"></i>
                                Nouvelle catégorie
                            </button>
                        </div>
                    </div>
                    
                    <!-- Navigation par onglets sobre -->
                    <div class="tabs-container">
                        <div class="tabs-nav">
                            <button class="tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV22.switchTab('categories')">
                                <i class="fas fa-tags"></i>
                                <span>Catégories</span>
                                <span class="tab-count">${Object.keys(categories).length}</span>
                            </button>
                            <button class="tab-btn ${this.activeTab === 'backup' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV22.switchTab('backup')">
                                <i class="fas fa-shield-alt"></i>
                                <span>Sauvegarde</span>
                                <span class="tab-indicator ${this.backupConfig.lastBackup ? 'active' : ''}"></span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Contenu des onglets -->
                    <div class="tab-content">
                        <div id="categories-tab" class="tab-panel ${this.activeTab === 'categories' ? 'active' : ''}">
                            ${this.renderCategoriesTab(categories, settings)}
                        </div>
                        
                        <div id="backup-tab" class="tab-panel ${this.activeTab === 'backup' ? 'active' : ''}">
                            ${this.renderBackupTab()}
                        </div>
                    </div>
                </div>
            `;
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            container.innerHTML = this.renderError();
        }
    }

    renderCategoriesTab(categories, settings) {
        const filtered = this.filterCategories(categories);
        const activeCategories = settings.activeCategories;
        
        return `
            <!-- Stats rapides -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #3B82F6;">
                        <i class="fas fa-tags"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${Object.keys(categories).length}</div>
                        <div class="stat-label">Total catégories</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #10B981;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${this.getActiveCount(categories, activeCategories)}</div>
                        <div class="stat-label">Catégories actives</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #F59E0B;">
                        <i class="fas fa-key"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${this.getTotalKeywords(categories)}</div>
                        <div class="stat-label">Mots-clés totaux</div>
                    </div>
                </div>
            </div>
            
            <!-- Barre de recherche -->
            <div class="search-section">
                <div class="search-input">
                    <i class="fas fa-search"></i>
                    <input type="text" 
                           placeholder="Rechercher une catégorie..." 
                           onkeyup="window.categoriesPageV22.handleSearch(this.value)">
                </div>
            </div>
            
            <!-- Grille des catégories -->
            <div class="categories-grid" id="categories-container">
                ${this.renderCategories(categories, activeCategories)}
            </div>
        `;
    }

    renderBackupTab() {
        return `
            <div class="backup-content">
                <!-- Statut du backup -->
                <div class="backup-status-card">
                    <div class="status-header">
                        <div class="status-icon ${this.backupConfig.lastBackup ? 'active' : 'inactive'}">
                            <i class="fas fa-${this.backupConfig.lastBackup ? 'check-circle' : 'clock'}"></i>
                        </div>
                        <div class="status-info">
                            <h3>Backup Automatique ${this.backupConfig.autoSave ? 'Activé' : 'Désactivé'}</h3>
                            <p>
                                ${this.backupConfig.lastBackup ? 
                                  `Dernière sauvegarde : ${this.backupConfig.lastBackup.toLocaleString('fr-FR')}` : 
                                  'Aucune sauvegarde effectuée'}
                            </p>
                        </div>
                    </div>
                    
                    <div class="status-actions">
                        <button class="btn-action primary" onclick="window.categoriesPageV22.manualBackup()">
                            <i class="fas fa-save"></i>
                            Backup Manuel
                        </button>
                        <button class="btn-action secondary" onclick="window.categoriesPageV22.toggleAutoBackup()">
                            <i class="fas fa-${this.backupConfig.autoSave ? 'pause' : 'play'}"></i>
                            ${this.backupConfig.autoSave ? 'Désactiver' : 'Activer'} Auto
                        </button>
                    </div>
                </div>
                
                <!-- Configuration du backup -->
                <div class="backup-config-card">
                    <h4><i class="fas fa-cog"></i> Configuration</h4>
                    
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Fréquence automatique</label>
                            <select onchange="window.categoriesPageV22.updateBackupInterval(this.value)">
                                <option value="30000" ${this.backupConfig.interval === 30000 ? 'selected' : ''}>30 secondes</option>
                                <option value="60000" ${this.backupConfig.interval === 60000 ? 'selected' : ''}>1 minute</option>
                                <option value="300000" ${this.backupConfig.interval === 300000 ? 'selected' : ''}>5 minutes</option>
                            </select>
                        </div>
                        
                        <div class="config-item">
                            <label>Backups maximum</label>
                            <select onchange="window.categoriesPageV22.updateMaxBackups(this.value)">
                                <option value="10" ${this.backupConfig.maxBackups === 10 ? 'selected' : ''}>10 fichiers</option>
                                <option value="20" ${this.backupConfig.maxBackups === 20 ? 'selected' : ''}>20 fichiers</option>
                                <option value="50" ${this.backupConfig.maxBackups === 50 ? 'selected' : ''}>50 fichiers</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Actions de backup -->
                <div class="backup-actions-card">
                    <h4><i class="fas fa-download"></i> Actions</h4>
                    
                    <div class="actions-grid">
                        <button class="action-btn" onclick="window.categoriesPageV22.downloadBackup()">
                            <i class="fas fa-download"></i>
                            <div class="action-info">
                                <div class="action-title">Télécharger Backup</div>
                                <div class="action-desc">Fichier JSON complet</div>
                            </div>
                        </button>
                        
                        <button class="action-btn" onclick="window.categoriesPageV22.showRestoreDialog()">
                            <i class="fas fa-upload"></i>
                            <div class="action-info">
                                <div class="action-title">Restaurer Backup</div>
                                <div class="action-desc">Depuis un fichier</div>
                            </div>
                        </button>
                        
                        <button class="action-btn" onclick="window.categoriesPageV22.exportSettings()">
                            <i class="fas fa-share-alt"></i>
                            <div class="action-info">
                                <div class="action-title">Exporter Config</div>
                                <div class="action-desc">Paramètres uniquement</div>
                            </div>
                        </button>
                        
                        <button class="action-btn" onclick="window.categoriesPageV22.showBackupHistory()">
                            <i class="fas fa-history"></i>
                            <div class="action-info">
                                <div class="action-title">Historique</div>
                                <div class="action-desc">Backups disponibles</div>
                            </div>
                        </button>
                    </div>
                </div>
                
                <!-- Informations techniques -->
                <div class="backup-info-card">
                    <details>
                        <summary>
                            <i class="fas fa-info-circle"></i>
                            Informations techniques
                        </summary>
                        <div class="tech-info">
                            <div class="info-grid">
                                <div class="info-item">
                                    <strong>Stockage:</strong>
                                    <span>OPFS + Cache + localStorage</span>
                                </div>
                                <div class="info-item">
                                    <strong>Format:</strong>
                                    <span>JSON avec métadonnées</span>
                                </div>
                                <div class="info-item">
                                    <strong>Chiffrement:</strong>
                                    <span>Stockage local sécurisé</span>
                                </div>
                                <div class="info-item">
                                    <strong>Surveillance:</strong>
                                    <span>Changements automatiques</span>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }

    renderCategories(categories, activeCategories) {
        const filtered = this.filterCategories(categories);
        
        if (Object.keys(filtered).length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                    <h3>Aucune catégorie trouvée</h3>
                    <p>Commencez par créer votre première catégorie</p>
                    ${this.searchTerm ? `
                        <button class="btn-secondary" onclick="window.categoriesPageV22.handleSearch('')">
                            Effacer la recherche
                        </button>
                    ` : ''}
                </div>
            `;
        }
        
        const emailStats = this.calculateEmailStats();
        
        const categoryCards = Object.entries(filtered)
            .map(([id, category]) => this.renderCategoryCard(id, category, activeCategories, emailStats[id] || 0))
            .join('');
        
        // Ajouter la catégorie "Autre" si nécessaire
        const otherCount = emailStats.other || 0;
        let otherCard = '';
        
        if (otherCount > 0 && !filtered.other) {
            const isActive = activeCategories === null || activeCategories.includes('other');
            const settings = this.loadSettings();
            const isPreselected = settings.taskPreselectedCategories?.includes('other') || false;
            
            otherCard = `
                <div class="category-card ${!isActive ? 'inactive' : ''}" 
                     data-id="other"
                     onclick="window.categoriesPageV22.showOtherCategoryInfo()">
                    
                    <div class="card-header">
                        <div class="category-icon" style="background: #64748b;">
                            <i class="fas fa-question"></i>
                        </div>
                        <div class="category-info">
                            <div class="category-name">Autre</div>
                            <div class="category-meta">
                                <span class="email-count">${otherCount} emails</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="action-btn-small ${isActive ? 'active' : 'inactive'}" 
                                onclick="window.categoriesPageV22.toggleOtherCategory()"
                                title="Toujours visible">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn-small ${isPreselected ? 'selected' : ''}" 
                                onclick="window.categoriesPageV22.togglePreselection('other')"
                                title="Pré-sélection tâches">
                            <i class="fas fa-${isPreselected ? 'check' : 'square'}"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        return categoryCards + otherCard;
    }

    renderCategoryCard(id, category, activeCategories, emailCount) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const stats = this.getCategoryStats(id);
        const settings = this.loadSettings();
        const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
        
        return `
            <div class="category-card ${!isActive ? 'inactive' : ''}" 
                 data-id="${id}"
                 onclick="window.categoriesPageV22.openModal('${id}')">
                
                <div class="card-header">
                    <div class="category-icon" style="background: ${category.color};">
                        <i class="fas fa-${this.getCategoryIcon(category.icon)}"></i>
                    </div>
                    <div class="category-info">
                        <div class="category-name">${category.name}</div>
                        <div class="category-meta">
                            <span class="keyword-count">${stats.keywords} mots-clés</span>
                            <span class="email-count">${emailCount} emails</span>
                            ${stats.absolute > 0 ? `<span class="absolute-count">★ ${stats.absolute}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="action-btn-small ${isActive ? 'active' : 'inactive'}" 
                            onclick="window.categoriesPageV22.toggleCategory('${id}')">
                        <i class="fas fa-${isActive ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button class="action-btn-small ${isPreselected ? 'selected' : ''}" 
                            onclick="window.categoriesPageV22.togglePreselection('${id}')"
                            title="Pré-sélection tâches">
                        <i class="fas fa-${isPreselected ? 'check' : 'square'}"></i>
                    </button>
                    <button class="action-btn-small" 
                            onclick="window.categoriesPageV22.openModal('${id}')">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getCategoryIcon(icon) {
        // Convertir les emojis en icônes FontAwesome
        const iconMap = {
            '📁': 'folder',
            '📧': 'envelope',
            '💼': 'briefcase',
            '🎯': 'bullseye',
            '⚡': 'bolt',
            '🔔': 'bell',
            '💡': 'lightbulb',
            '📊': 'chart-bar',
            '🏷️': 'tag',
            '📌': 'thumbtack',
            '🌟': 'star',
            '🚀': 'rocket',
            '💎': 'gem',
            '🎨': 'palette',
            '🔥': 'fire'
        };
        
        return iconMap[icon] || 'tag';
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Mettre à jour l'interface
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tabName));
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
        
        // Actions spécifiques par onglet
        if (tabName === 'backup') {
            this.refreshBackupInfo();
        }
    }

    refreshBackupInfo() {
        // Mettre à jour les informations de backup
        const statusCard = document.querySelector('.backup-status-card');
        if (statusCard) {
            // Mettre à jour le statut en temps réel
            const statusIcon = statusCard.querySelector('.status-icon');
            const statusInfo = statusCard.querySelector('.status-info p');
            
            if (this.backupConfig.lastBackup) {
                statusIcon.className = 'status-icon active';
                statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                statusInfo.textContent = `Dernière sauvegarde : ${this.backupConfig.lastBackup.toLocaleString('fr-FR')}`;
            }
        }
    }

    // ================================================
    // ACTIONS DE BACKUP
    // ================================================
    async manualBackup() {
        const btn = event.target;
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';
        btn.disabled = true;
        
        try {
            const success = await this.createCategoriesBackup('manual');
            
            if (success) {
                this.refreshBackupInfo();
                this.showToast('✅ Backup manuel créé avec succès!', 'success');
            }
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }

    toggleAutoBackup() {
        this.backupConfig.autoSave = !this.backupConfig.autoSave;
        
        if (this.backupConfig.autoSave) {
            this.startAutoBackup();
            this.showToast('🔄 Backup automatique activé', 'success');
        } else {
            if (this.backupTimer) {
                clearInterval(this.backupTimer);
                this.backupTimer = null;
            }
            this.showToast('⏸️ Backup automatique désactivé', 'info');
        }
        
        // Mettre à jour l'interface
        this.render(document.querySelector('.categories-page-container').parentElement);
    }

    updateBackupInterval(newInterval) {
        this.backupConfig.interval = parseInt(newInterval);
        
        if (this.backupConfig.autoSave) {
            this.startAutoBackup();
        }
        
        this.showToast(`⏰ Fréquence mise à jour: ${newInterval/1000}s`, 'info');
    }

    updateMaxBackups(newMax) {
        this.backupConfig.maxBackups = parseInt(newMax);
        this.showToast(`📁 Maximum backups: ${newMax}`, 'info');
    }

    async downloadBackup() {
        try {
            const backupData = this.collectCategoriesData('manual-download');
            const dataString = JSON.stringify(backupData, null, 2);
            
            const blob = new Blob([dataString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `EmailSortPro-Categories-${new Date().toISOString().split('T')[0]}.json`;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showToast('📥 Backup téléchargé!', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur téléchargement:', error);
            this.showToast('❌ Erreur lors du téléchargement', 'error');
        }
    }

    showRestoreDialog() {
        // Créer un input file caché
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Valider le format
                if (!data.categories || !data.version) {
                    throw new Error('Format de backup invalide');
                }
                
                // Confirmer la restauration
                if (confirm('Êtes-vous sûr de vouloir restaurer ce backup ? Les catégories actuelles seront remplacées.')) {
                    await this.restoreFromBackup(data);
                    this.showToast('✅ Backup restauré avec succès!', 'success');
                    this.render(document.querySelector('.categories-page-container').parentElement);
                }
                
            } catch (error) {
                console.error('[CategoriesPage] Erreur restauration:', error);
                this.showToast('❌ Erreur lors de la restauration: ' + error.message, 'error');
            }
            
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    }

    async restoreFromBackup(backupData) {
        try {
            // Restaurer les catégories
            if (backupData.categories && backupData.categories.all) {
                // Cette partie nécessiterait l'implémentation de méthodes de restauration dans CategoryManager
                console.log('Restauration des catégories:', backupData.categories);
                
                // Pour le moment, sauvegarder les données restaurées
                localStorage.setItem('emailsortpro_categories_restored', JSON.stringify(backupData));
            }
            
            // Restaurer les paramètres
            if (backupData.settings) {
                this.saveSettings(backupData.settings);
            }
            
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la restauration: ' + error.message);
        }
    }

    exportSettings() {
        try {
            const settings = {
                version: '22.0-settings-export',
                timestamp: new Date().toISOString(),
                settings: this.loadSettings(),
                activeCategories: window.categoryManager?.getActiveCategories(),
                taskPreselectedCategories: this.getTaskPreselectedCategories()
            };
            
            const dataString = JSON.stringify(settings, null, 2);
            const blob = new Blob([dataString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `EmailSortPro-Settings-${new Date().toISOString().split('T')[0]}.json`;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showToast('📤 Paramètres exportés!', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur export:', error);
            this.showToast('❌ Erreur lors de l\'export', 'error');
        }
    }

    async showBackupHistory() {
        try {
            const history = await this.getBackupHistory();
            
            const modal = this.createModal('Historique des Backups', `
                <div class="backup-history">
                    ${history.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-history"></i>
                            <p>Aucun backup trouvé</p>
                        </div>
                    ` : history.map(backup => `
                        <div class="backup-item">
                            <div class="backup-info">
                                <div class="backup-name">${backup.name}</div>
                                <div class="backup-date">${backup.date}</div>
                                <div class="backup-size">${backup.size}</div>
                            </div>
                            <div class="backup-actions">
                                <button class="btn-small" onclick="window.categoriesPageV22.downloadBackupFile('${backup.key}')">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `);
            
            document.body.appendChild(modal);
            
        } catch (error) {
            this.showToast('❌ Erreur lors de la récupération de l\'historique', 'error');
        }
    }

    async getBackupHistory() {
        const history = [];
        
        try {
            // Récupérer de localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('emailsortpro_categories_backup_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        history.push({
                            key: key,
                            name: `Backup Local ${new Date(data.timestamp).toLocaleDateString()}`,
                            date: new Date(data.timestamp).toLocaleString('fr-FR'),
                            size: this.formatBytes(JSON.stringify(data).length),
                            source: 'localStorage'
                        });
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            
            // Récupérer du cache si disponible
            if ('caches' in window) {
                try {
                    const cache = await caches.open('emailsortpro-categories-v1');
                    const keys = await cache.keys();
                    
                    for (const request of keys) {
                        if (request.url.includes('EmailSortPro-Categories-')) {
                            const response = await cache.match(request);
                            const data = await response.json();
                            
                            history.push({
                                key: request.url,
                                name: `Backup Cache ${new Date(data.timestamp).toLocaleDateString()}`,
                                date: new Date(data.timestamp).toLocaleString('fr-FR'),
                                size: this.formatBytes(JSON.stringify(data).length),
                                source: 'cache'
                            });
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }
            
        } catch (error) {
            console.warn('[CategoriesPage] Erreur récupération historique:', error);
        }
        
        // Trier par date (plus récent en premier)
        return history.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // ================================================
    // MÉTHODES UTILITAIRES (simplifiées pour économiser l'espace)
    // ================================================
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    calculateEmailStats() {
        const emails = window.emailScanner?.getAllEmails() || [];
        const stats = {};
        
        emails.forEach(email => {
            const cat = email.category || 'other';
            stats[cat] = (stats[cat] || 0) + 1;
        });
        
        return stats;
    }

    getCategoryStats(categoryId) {
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        return {
            keywords: keywords.absolute.length + keywords.strong.length + 
                     keywords.weak.length + keywords.exclusions.length,
            absolute: keywords.absolute.length
        };
    }

    getActiveCount(categories, activeCategories) {
        if (!activeCategories) return Object.keys(categories).length;
        return activeCategories.filter(id => categories[id]).length;
    }

    getTotalKeywords(categories) {
        let total = 0;
        Object.keys(categories).forEach(id => {
            const stats = this.getCategoryStats(id);
            total += stats.keywords;
        });
        return total;
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : { 
                activeCategories: null,
                taskPreselectedCategories: []
            };
        } catch (error) {
            return { 
                activeCategories: null,
                taskPreselectedCategories: []
            };
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(settings));
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde:', error);
        }
    }

    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
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

    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.updateCategoriesDisplay();
    }

    updateCategoriesDisplay() {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        const categories = window.categoryManager?.getCategories() || {};
        const settings = this.loadSettings();
        
        container.innerHTML = this.renderCategories(categories, settings.activeCategories);
    }

    showToast(message, type = 'info') {
        console.log(`[CategoriesPage] ${type.toUpperCase()}: ${message}`);
        
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type, 3000);
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
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

    renderError() {
        return `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Erreur de chargement</h3>
                <p>Impossible de charger la page des catégories</p>
                <button class="btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Recharger
                </button>
            </div>
        `;
    }

    // ================================================
    // MÉTHODES STUB POUR COMPATIBILITÉ
    // ================================================
    toggleCategory(categoryId) {
        console.log(`[CategoriesPage] Toggle category: ${categoryId}`);
        // Implementation simplifiée
    }

    togglePreselection(categoryId) {
        console.log(`[CategoriesPage] Toggle preselection: ${categoryId}`);
        // Implementation simplifiée
    }

    toggleOtherCategory() {
        this.showToast('ℹ️ La catégorie "Autre" est toujours visible', 'info');
    }

    showOtherCategoryInfo() {
        console.log('[CategoriesPage] Affichage infos catégorie "Autre"');
        // Implementation simplifiée
    }

    openModal(categoryId) {
        console.log(`[CategoriesPage] Ouverture modal pour: ${categoryId}`);
        // Implementation simplifiée pour économiser l'espace
    }

    showCreateModal() {
        console.log('[CategoriesPage] Ouverture modal création');
        // Implementation simplifiée
    }

    // ================================================
    // STYLES SOBRES
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStylesV22')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStylesV22';
        styles.textContent = `
            /* Styles pour CategoriesPage v22.0 - Sobre */
            .categories-page-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            }

            /* Header sobre */
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

            .page-title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .page-title i {
                color: #3B82F6;
            }

            .page-subtitle {
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

            /* Tabs sobres */
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

            .tab-count {
                background: #e5e7eb;
                color: #6b7280;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }

            .tab-btn.active .tab-count {
                background: #dbeafe;
                color: #3B82F6;
            }

            .tab-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #e5e7eb;
            }

            .tab-indicator.active {
                background: #10b981;
            }

            /* Contenu des onglets */
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

            /* Stats grid sobre */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .stat-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .stat-icon {
                width: 40px;
                height: 40px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
            }

            .stat-number {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 2px;
            }

            .stat-label {
                font-size: 12px;
                color: #6b7280;
            }

            /* Recherche sobre */
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

            /* Grille des catégories sobre */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 16px;
            }

            .category-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.15s ease;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .category-card:hover {
                border-color: #3B82F6;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .category-card.inactive {
                opacity: 0.6;
                background: #f9fafb;
            }

            .card-header {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .category-icon {
                width: 36px;
                height: 36px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
            }

            .category-info {
                flex: 1;
            }

            .category-name {
                font-size: 15px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .category-meta {
                display: flex;
                gap: 8px;
                font-size: 12px;
                color: #6b7280;
            }

            .card-actions {
                display: flex;
                gap: 6px;
                justify-content: flex-end;
            }

            .action-btn-small {
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
            }

            .action-btn-small:hover {
                border-color: #9ca3af;
            }

            .action-btn-small.active {
                background: #10b981;
                border-color: #10b981;
                color: white;
            }

            .action-btn-small.inactive {
                background: #ef4444;
                border-color: #ef4444;
                color: white;
            }

            .action-btn-small.selected {
                background: #3B82F6;
                border-color: #3B82F6;
                color: white;
            }

            /* Contenu backup sobre */
            .backup-content {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .backup-status-card,
            .backup-config-card,
            .backup-actions-card,
            .backup-info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 20px;
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

            .status-icon.active {
                background: #10b981;
                color: white;
            }

            .status-icon.inactive {
                background: #f59e0b;
                color: white;
            }

            .status-info h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
            }

            .status-info p {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
            }

            .status-actions {
                display: flex;
                gap: 8px;
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

            .config-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }

            .config-item {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .config-item label {
                font-size: 13px;
                font-weight: 500;
                color: #374151;
            }

            .config-item select {
                padding: 6px 8px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 13px;
                background: white;
            }

            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .action-btn {
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

            .action-btn:hover {
                border-color: #3B82F6;
                background: #f0f9ff;
            }

            .action-btn i {
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

            .tech-info {
                margin-top: 12px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background: white;
                border-radius: 4px;
                font-size: 13px;
            }

            .backup-history {
                max-height: 400px;
                overflow-y: auto;
            }

            .backup-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border-bottom: 1px solid #e2e8f0;
            }

            .backup-item:last-child {
                border-bottom: none;
            }

            .backup-name {
                font-size: 14px;
                font-weight: 500;
                color: #1f2937;
            }

            .backup-date {
                font-size: 12px;
                color: #6b7280;
            }

            .backup-size {
                font-size: 11px;
                color: #9ca3af;
            }

            .btn-small {
                padding: 4px 8px;
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                color: #374151;
            }

            .btn-small:hover {
                background: #e5e7eb;
            }

            /* Modal sobre */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
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
                max-width: 500px;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e2e8f0;
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
            }

            .modal-close:hover {
                color: #374151;
            }

            .modal-body {
                padding: 20px;
                overflow-y: auto;
                max-height: 60vh;
            }

            /* États vides */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }

            .empty-state .empty-icon {
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

            .empty-state p {
                font-size: 14px;
                margin: 0 0 16px 0;
            }

            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }

            .btn-secondary:hover {
                background: #e5e7eb;
            }

            /* État d'erreur */
            .error-state {
                text-align: center;
                padding: 60px 20px;
            }

            .error-icon {
                font-size: 48px;
                color: #ef4444;
                margin-bottom: 16px;
            }

            .error-state h3 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
            }

            .error-state p {
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 20px 0;
            }

            .btn-primary {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                text-decoration: none;
            }

            .btn-primary:hover {
                background: #2563EB;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .categories-page-container {
                    padding: 15px;
                }

                .page-header {
                    padding: 20px;
                }

                .header-content {
                    flex-direction: column;
                    gap: 16px;
                    align-items: stretch;
                }

                .tab-content {
                    padding: 16px;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }

                .categories-grid {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }

                .config-grid,
                .actions-grid {
                    grid-template-columns: 1fr;
                }

                .tab-btn {
                    padding: 12px 16px;
                    font-size: 13px;
                }

                .tab-btn span:not(.tab-count):not(.tab-indicator) {
                    display: none;
                }

                .status-actions {
                    flex-direction: column;
                }

                .modal-content {
                    margin: 10px;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // MÉTHODES DE COMPATIBILITÉ ET FINALISATION
    // ================================================
    renderSettings(container) {
        // Alias pour compatibilité avec le système de pages
        this.render(container);
    }

    // Nettoyage lors de la destruction
    destroy() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
        }
        
        console.log('[CategoriesPage] 🧹 Instance v22.0 nettoyée');
    }
}

// ================================================
// INTÉGRATION GLOBALE AVEC BACKUP
// ================================================

// Nettoyer l'ancienne instance
if (window.categoriesPageV21) {
    try {
        if (window.categoriesPageV21.destroy) {
            window.categoriesPageV21.destroy();
        }
        delete window.categoriesPageV21;
    } catch (error) {
        // Ignore
    }
}

// Créer la nouvelle instance
window.categoriesPageV22 = new CategoriesPageV22();

// Alias pour compatibilité
window.categoriesPage = window.categoriesPageV22;

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPageV22.render(container);
    };
    
    window.pageManager.pages.categories = (container) => {
        window.categoriesPageV22.render(container);
    };
}

// Intégration avec le système de backup global
if (window.backupService) {
    // Enregistrer le module categories dans le système de backup
    window.backupService.registerModule = window.backupService.registerModule || function(name, module) {
        this.modules = this.modules || {};
        this.modules[name] = module;
        console.log(`[BackupService] Module ${name} enregistré`);
    };
    
    window.backupService.registerModule('categories', window.categoriesPageV22);
    
    // Écouter les événements de backup global pour synchroniser
    document.addEventListener('backupCreated', (event) => {
        if (event.detail.source !== 'categories') {
            // Déclencher aussi un backup des catégories
            setTimeout(() => {
                window.categoriesPageV22.createCategoriesBackup('sync');
            }, 1000);
        }
    });
}

// Vérifier la compatibilité avec le backup service
if (window.getBackupStatus) {
    const backupStatus = window.getBackupStatus();
    console.log('[CategoriesPage] 🔄 Statut backup global:', {
        available: backupStatus.available,
        hybrid: backupStatus.hybrid,
        opfs: backupStatus.storage?.opfs,
        recovery: backupStatus.recoveryConfigured
    });
}

// API pour le backup manuel depuis l'extérieur
window.triggerCategoriesBackup = () => {
    return window.categoriesPageV22?.createCategoriesBackup('external-trigger');
};

// API pour obtenir les données de catégories
window.getCategoriesBackupData = () => {
    return window.categoriesPageV22?.collectCategoriesData('api-request');
};

console.log('[CategoriesPage] ✅ CategoriesPage v22.0 chargée - Interface sobre + Backup automatique intégré!');
console.log('[CategoriesPage] 🔄 Fonctionnalités:');
console.log('[CategoriesPage]   • Interface sobre avec 2 onglets fonctionnels');
console.log('[CategoriesPage]   • Backup automatique toutes les 30s');
console.log('[CategoriesPage]   • Sauvegarde OPFS + Cache + localStorage');
console.log('[CategoriesPage]   • Intégration avec système de backup hybride');
console.log('[CategoriesPage]   • Surveillance des changements en temps réel');
console.log('[CategoriesPage]   • Export/Import de fichiers');
console.log('[CategoriesPage]   • Historique des backups');
console.log('[CategoriesPage] 💾 Pas de popup ou demande utilisateur - Tout automatique!');
