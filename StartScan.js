// StartScan.js - Version 30.0 - Module de scan unifié Gmail/Outlook
// Support complet multi-provider sans limitations avec redirection appropriée

console.log('[StartScan] 🚀 Loading v30.0 - Unified Gmail/Outlook Scanner...');

class UnifiedScanModule {
    constructor() {
        // État du scan
        this.currentProvider = null;
        this.isAuthenticated = false;
        this.isScanActive = false;
        this.scanResults = null;
        this.currentContainer = null;
        
        // Configuration des providers
        this.providers = {
            gmail: {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#4285f4',
                authService: 'googleAuthService',
                scanLimit: -1, // Pas de limite
                pageManager: 'pageManagerGmail', // Redirection vers PageManagerGmail
                emailsPage: 'emails' // Page emails dans PageManagerGmail
            },
            outlook: {
                name: 'Outlook',
                icon: 'fab fa-microsoft', 
                color: '#0078d4',
                authService: 'authService',
                scanLimit: -1, // Pas de limite
                pageManager: 'pageManager', // PageManager principal pour Outlook
                emailsPage: 'emails' // Page emails standard
            }
        };
        
        // Options de scan par défaut
        this.defaultScanOptions = {
            days: 7,
            folder: 'inbox',
            maxEmails: -1, // Pas de limite par défaut
            includeSpam: false,
            autoAnalyze: true,
            autoCategrize: true
        };
        
        // Métriques du scan
        this.scanMetrics = {
            startTime: null,
            endTime: null,
            emailsScanned: 0,
            categorized: 0,
            preselected: 0,
            errors: 0
        };
        
        // Paramètres utilisateur
        this.userSettings = this.loadUserSettings();
        
        console.log('[StartScan] ✅ Module unifié initialisé avec routing approprié');
    }

    // ================================================
    // MÉTHODES DE RENDU PRINCIPAL
    // ================================================
    async render(container) {
        console.log('[StartScan] 🎨 Rendering unified scanner...');
        
        this.currentContainer = container;
        
        // Détecter le provider actuel
        await this.detectProvider();
        
        // Vérifier l'authentification
        await this.checkAuthentication();
        
        // Toujours afficher l'interface de scan principale
        this.renderScanInterface(container);
    }

    // ================================================
    // DÉTECTION ET AUTHENTIFICATION
    // ================================================
    async detectProvider() {
        console.log('[StartScan] 🔍 Detecting current provider...');
        
        // Vérifier Gmail
        if (window.googleAuthService?.isAuthenticated?.()) {
            this.currentProvider = 'gmail';
            this.isAuthenticated = true;
            console.log('[StartScan] ✅ Gmail detected and authenticated');
            return;
        }
        
        // Vérifier Outlook
        if (window.authService?.isAuthenticated?.()) {
            this.currentProvider = 'outlook';
            this.isAuthenticated = true;
            console.log('[StartScan] ✅ Outlook detected and authenticated');
            return;
        }
        
        // Vérifier le dernier provider utilisé
        const lastProvider = sessionStorage.getItem('lastEmailProvider');
        if (lastProvider === 'gmail' || lastProvider === 'outlook') {
            this.currentProvider = lastProvider;
            console.log('[StartScan] 📦 Using last provider:', lastProvider);
        }
    }

    async checkAuthentication() {
        if (!this.currentProvider) {
            this.isAuthenticated = false;
            return;
        }
        
        console.log('[StartScan] 🔐 Checking authentication for', this.currentProvider);
        
        if (this.currentProvider === 'gmail') {
            this.isAuthenticated = window.googleAuthService?.isAuthenticated?.() || false;
        } else if (this.currentProvider === 'outlook') {
            this.isAuthenticated = window.authService?.isAuthenticated?.() || false;
        }
        
        console.log('[StartScan] Auth status:', this.isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated');
    }

    // ================================================
    // INTERFACE DE SCAN PRINCIPALE (STRUCTURE ORIGINALE)
    // ================================================
    renderScanInterface(container) {
        // Utiliser la structure HTML originale
        container.innerHTML = `
            <div class="start-scan-modern">
                <div class="scan-header-section">
                    <div class="scan-icon-wrapper">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    <h1 class="scan-title">Scanner vos emails</h1>
                    <p class="scan-subtitle">
                        ${this.currentProvider ? 
                            `Connecté avec ${this.providers[this.currentProvider].name}` : 
                            'Analysez et organisez vos emails en quelques clics'
                        }
                    </p>
                </div>

                ${!this.currentProvider ? this.renderProviderSelection() : ''}
                ${this.currentProvider && !this.isAuthenticated ? this.renderAuthRequired() : ''}
                ${this.currentProvider && this.isAuthenticated ? this.renderScanOptions() : ''}

                <div id="scanProgress" class="scan-progress-wrapper" style="display: none;">
                    <div class="progress-container">
                        <div class="progress-header">
                            <div class="progress-title">
                                <i class="fas fa-sync fa-spin"></i>
                                <span>Scan en cours...</span>
                            </div>
                            <button class="btn-cancel-scan" onclick="unifiedScanModule.cancelScan()">
                                <i class="fas fa-times"></i>
                                Annuler
                            </button>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-details">
                            <span id="progressMessage">Initialisation...</span>
                            <span id="progressStats" class="progress-stats">0/0</span>
                        </div>
                    </div>
                </div>

                <div id="scanResults" class="scan-results-wrapper" style="display: none;"></div>
            </div>
        `;
        
        // Ajouter les styles
        this.addStyles();
    }

    renderProviderSelection() {
        return `
            <div class="provider-selection-section">
                <h3 class="section-title">Choisissez votre service email</h3>
                <div class="provider-grid">
                    <div class="provider-card" onclick="unifiedScanModule.selectProvider('gmail')">
                        <div class="provider-icon-large" style="color: #4285f4;">
                            <i class="fab fa-google"></i>
                        </div>
                        <h4>Gmail</h4>
                        <p>Scanner votre compte Google</p>
                        <ul class="provider-features">
                            <li><i class="fas fa-infinity"></i> Scan illimité</li>
                            <li><i class="fas fa-tags"></i> Labels Gmail</li>
                            <li><i class="fas fa-star"></i> Priorités</li>
                        </ul>
                    </div>
                    
                    <div class="provider-card" onclick="unifiedScanModule.selectProvider('outlook')">
                        <div class="provider-icon-large" style="color: #0078d4;">
                            <i class="fab fa-microsoft"></i>
                        </div>
                        <h4>Outlook</h4>
                        <p>Scanner votre compte Microsoft</p>
                        <ul class="provider-features">
                            <li><i class="fas fa-infinity"></i> Scan illimité</li>
                            <li><i class="fas fa-folder"></i> Dossiers</li>
                            <li><i class="fas fa-flag"></i> Marqueurs</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    renderAuthRequired() {
        const provider = this.providers[this.currentProvider];
        return `
            <div class="auth-required-section">
                <div class="auth-message">
                    <i class="${provider.icon}" style="color: ${provider.color}; font-size: 48px; margin-bottom: 20px;"></i>
                    <h3>Connexion requise</h3>
                    <p>Connectez-vous à ${provider.name} pour scanner vos emails</p>
                    <button class="btn btn-primary btn-large" onclick="unifiedScanModule.authenticate()">
                        <i class="${provider.icon}"></i>
                        Se connecter avec ${provider.name}
                    </button>
                </div>
            </div>
        `;
    }

    renderScanOptions() {
        const savedOptions = this.getSavedScanOptions();
        const provider = this.providers[this.currentProvider];
        
        return `
            <div class="scan-config-section">
                <div class="connected-account">
                    <div class="account-badge" style="background: ${provider.color}20; color: ${provider.color};">
                        <i class="${provider.icon}"></i>
                    </div>
                    <div class="account-info">
                        <span class="account-label">Connecté avec ${provider.name}</span>
                        <span class="account-email">${this.getUserEmail()}</span>
                    </div>
                    <button class="btn-disconnect" onclick="unifiedScanModule.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Déconnexion
                    </button>
                </div>

                <div class="scan-options-grid">
                    <div class="scan-option">
                        <label class="option-label">
                            <i class="fas fa-calendar-alt"></i>
                            Période à scanner
                        </label>
                        <select id="scanPeriod" class="option-select">
                            <option value="1" ${savedOptions.days === 1 ? 'selected' : ''}>Dernières 24 heures</option>
                            <option value="3" ${savedOptions.days === 3 ? 'selected' : ''}>3 derniers jours</option>
                            <option value="7" ${savedOptions.days === 7 ? 'selected' : ''}>7 derniers jours</option>
                            <option value="14" ${savedOptions.days === 14 ? 'selected' : ''}>2 dernières semaines</option>
                            <option value="30" ${savedOptions.days === 30 ? 'selected' : ''}>30 derniers jours</option>
                            <option value="90" ${savedOptions.days === 90 ? 'selected' : ''}>3 derniers mois</option>
                            <option value="-1">Tous les emails</option>
                        </select>
                    </div>
                    
                    <div class="scan-option">
                        <label class="option-label">
                            <i class="fas fa-folder"></i>
                            Dossier à scanner
                        </label>
                        <select id="scanFolder" class="option-select">
                            ${this.renderFolderOptions(savedOptions.folder)}
                        </select>
                    </div>
                    
                    <div class="scan-option">
                        <label class="option-label">
                            <i class="fas fa-list-ol"></i>
                            Limite d'emails
                        </label>
                        <select id="scanLimit" class="option-select">
                            <option value="100" ${savedOptions.maxEmails === 100 ? 'selected' : ''}>100 emails</option>
                            <option value="500" ${savedOptions.maxEmails === 500 ? 'selected' : ''}>500 emails</option>
                            <option value="1000" ${savedOptions.maxEmails === 1000 ? 'selected' : ''}>1000 emails</option>
                            <option value="5000" ${savedOptions.maxEmails === 5000 ? 'selected' : ''}>5000 emails</option>
                            <option value="-1" ${savedOptions.maxEmails === -1 ? 'selected' : ''}>Sans limite</option>
                        </select>
                    </div>
                </div>

                <div class="scan-toggles">
                    <label class="toggle-switch">
                        <input type="checkbox" id="includeSpam" ${savedOptions.includeSpam ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                        <span class="toggle-label">
                            <i class="fas fa-ban"></i>
                            Inclure les spams
                        </span>
                    </label>
                    
                    <label class="toggle-switch">
                        <input type="checkbox" id="autoCategrize" ${savedOptions.autoCategrize ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                        <span class="toggle-label">
                            <i class="fas fa-tags"></i>
                            Catégorisation automatique
                        </span>
                    </label>
                    
                    <label class="toggle-switch">
                        <input type="checkbox" id="autoAnalyze" ${savedOptions.autoAnalyze ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                        <span class="toggle-label">
                            <i class="fas fa-brain"></i>
                            Analyse IA pour tâches
                        </span>
                    </label>
                </div>

                <div class="scan-action-section">
                    <button id="startScanBtn" class="btn btn-primary btn-large btn-scan" onclick="unifiedScanModule.startScan()">
                        <i class="fas fa-search"></i>
                        <span>Démarrer le scan</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderFolderOptions(selectedFolder) {
        if (this.currentProvider === 'gmail') {
            return `
                <option value="INBOX" ${selectedFolder === 'INBOX' ? 'selected' : ''}>Boîte de réception</option>
                <option value="SENT" ${selectedFolder === 'SENT' ? 'selected' : ''}>Messages envoyés</option>
                <option value="DRAFT" ${selectedFolder === 'DRAFT' ? 'selected' : ''}>Brouillons</option>
                <option value="SPAM" ${selectedFolder === 'SPAM' ? 'selected' : ''}>Spam</option>
                <option value="TRASH" ${selectedFolder === 'TRASH' ? 'selected' : ''}>Corbeille</option>
                <option value="ALL" ${selectedFolder === 'ALL' ? 'selected' : ''}>Tous les messages</option>
            `;
        } else {
            return `
                <option value="inbox" ${selectedFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                <option value="sentitems" ${selectedFolder === 'sentitems' ? 'selected' : ''}>Éléments envoyés</option>
                <option value="drafts" ${selectedFolder === 'drafts' ? 'selected' : ''}>Brouillons</option>
                <option value="junk" ${selectedFolder === 'junk' ? 'selected' : ''}>Courrier indésirable</option>
                <option value="deleteditems" ${selectedFolder === 'deleteditems' ? 'selected' : ''}>Éléments supprimés</option>
                <option value="archive" ${selectedFolder === 'archive' ? 'selected' : ''}>Archive</option>
            `;
        }
    }

    // ================================================
    // MÉTHODES D'ACTION
    // ================================================
    selectProvider(provider) {
        console.log('[StartScan] 📧 Provider selected:', provider);
        
        this.currentProvider = provider;
        sessionStorage.setItem('lastEmailProvider', provider || '');
        
        if (this.currentContainer) {
            this.render(this.currentContainer);
        }
    }

    async authenticate() {
        console.log('[StartScan] 🔐 Starting authentication for', this.currentProvider);
        
        try {
            this.showLoading('Connexion en cours...');
            
            if (this.currentProvider === 'gmail') {
                if (window.googleAuthService?.login) {
                    await window.googleAuthService.login();
                } else {
                    throw new Error('Service Gmail non disponible');
                }
            } else if (this.currentProvider === 'outlook') {
                if (window.authService?.login) {
                    await window.authService.login();
                } else {
                    throw new Error('Service Outlook non disponible');
                }
            }
            
            // Re-vérifier l'authentification après login
            await this.checkAuthentication();
            
            this.hideLoading();
            
            if (this.isAuthenticated && this.currentContainer) {
                this.render(this.currentContainer);
            }
            
        } catch (error) {
            console.error('[StartScan] ❌ Authentication error:', error);
            this.hideLoading();
            this.showToast('Erreur de connexion: ' + error.message, 'error');
        }
    }

    async logout() {
        console.log('[StartScan] 🚪 Logging out from', this.currentProvider);
        
        try {
            if (this.currentProvider === 'gmail' && window.googleAuthService?.logout) {
                await window.googleAuthService.logout();
            } else if (this.currentProvider === 'outlook' && window.authService?.logout) {
                await window.authService.logout();
            }
            
            this.isAuthenticated = false;
            this.currentProvider = null;
            sessionStorage.removeItem('lastEmailProvider');
            
            if (this.currentContainer) {
                this.render(this.currentContainer);
            }
            
        } catch (error) {
            console.error('[StartScan] ❌ Logout error:', error);
            this.showToast('Erreur lors de la déconnexion', 'error');
        }
    }

    // ================================================
    // MÉTHODE DE SCAN PRINCIPALE
    // ================================================
    async startScan() {
        if (this.isScanActive) {
            console.warn('[StartScan] ⚠️ Scan already in progress');
            return;
        }
        
        console.log('[StartScan] 🚀 Starting scan for', this.currentProvider);
        
        // Récupérer les options
        const options = this.getScanOptionsFromUI();
        this.saveScanOptions(options);
        
        // Réinitialiser les métriques
        this.scanMetrics = {
            startTime: Date.now(),
            endTime: null,
            emailsScanned: 0,
            categorized: 0,
            preselected: 0,
            errors: 0
        };
        
        // UI updates
        this.isScanActive = true;
        document.getElementById('startScanBtn').disabled = true;
        document.getElementById('scanProgress').style.display = 'block';
        document.getElementById('scanResults').style.display = 'none';
        
        try {
            // Vérifier EmailScanner
            if (!window.emailScanner) {
                throw new Error('EmailScanner non disponible');
            }
            
            // Lancer le scan avec callback de progression
            const results = await window.emailScanner.scan({
                ...options,
                provider: this.currentProvider,
                onProgress: (progress) => this.updateProgress(progress)
            });
            
            this.scanResults = results;
            this.scanMetrics.endTime = Date.now();
            this.scanMetrics.emailsScanned = results.total;
            this.scanMetrics.categorized = results.categorized;
            this.scanMetrics.preselected = results.stats?.preselectedForTasks || 0;
            
            // Afficher les résultats
            this.displayResults(results);
            
            // Sauvegarder dans la session
            this.saveScanResultsToSession(results);
            
            console.log('[StartScan] ✅ Scan completed successfully');
            
        } catch (error) {
            console.error('[StartScan] ❌ Scan error:', error);
            this.showToast('Erreur lors du scan: ' + error.message, 'error');
            this.scanMetrics.errors++;
            
        } finally {
            this.isScanActive = false;
            document.getElementById('startScanBtn').disabled = false;
            document.getElementById('scanProgress').style.display = 'none';
        }
    }

    cancelScan() {
        console.log('[StartScan] 🛑 Cancelling scan...');
        
        this.isScanActive = false;
        
        // TODO: Implémenter l'annulation dans EmailScanner
        if (window.emailScanner?.cancelCurrentScan) {
            window.emailScanner.cancelCurrentScan();
        }
        
        document.getElementById('startScanBtn').disabled = false;
        document.getElementById('scanProgress').style.display = 'none';
        
        this.showToast('Scan annulé', 'info');
    }

    // ================================================
    // GESTION DE LA PROGRESSION
    // ================================================
    updateProgress(progress) {
        const progressFill = document.getElementById('progressFill');
        const progressMessage = document.getElementById('progressMessage');
        const progressStats = document.getElementById('progressStats');
        
        if (!progressFill || !progressMessage || !progressStats) return;
        
        // Calculer le pourcentage
        let percent = 0;
        if (progress.progress && progress.progress.total > 0) {
            percent = Math.round((progress.progress.current / progress.progress.total) * 100);
        }
        
        // Mettre à jour la barre
        progressFill.style.width = percent + '%';
        
        // Mettre à jour le message
        let message = progress.message || 'Traitement...';
        switch (progress.phase) {
            case 'fetching':
                message = `📧 Récupération des emails ${this.currentProvider}...`;
                break;
            case 'categorizing':
                message = '🏷️ Catégorisation en cours...';
                break;
            case 'analyzing':
                message = '🤖 Analyse IA des emails...';
                break;
            case 'complete':
                message = '✅ Scan terminé !';
                break;
            case 'error':
                message = '❌ Erreur lors du scan';
                break;
        }
        progressMessage.textContent = message;
        
        // Mettre à jour les stats
        if (progress.progress) {
            progressStats.textContent = `${progress.progress.current}/${progress.progress.total}`;
        }
    }

    // ================================================
    // AFFICHAGE DES RÉSULTATS
    // ================================================
    displayResults(results) {
        const resultsContainer = document.getElementById('scanResults');
        if (!resultsContainer) return;
        
        const duration = this.scanMetrics.endTime - this.scanMetrics.startTime;
        const durationSeconds = Math.round(duration / 1000);
        const provider = this.providers[this.currentProvider];
        
        resultsContainer.innerHTML = `
            <div class="scan-results-container">
                <div class="results-header">
                    <div class="results-success">
                        <i class="fas fa-check-circle"></i>
                        <h3>Scan terminé avec succès !</h3>
                    </div>
                    <div class="results-actions">
                        <button class="btn btn-secondary" onclick="unifiedScanModule.exportResults()">
                            <i class="fas fa-download"></i>
                            Exporter
                        </button>
                        <button class="btn btn-primary" onclick="unifiedScanModule.viewEmails()">
                            <i class="fas fa-envelope"></i>
                            Voir les emails
                        </button>
                    </div>
                </div>
                
                <div class="results-stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: ${provider.color}20; color: ${provider.color};">
                            <i class="${provider.icon}"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${results.total}</div>
                            <div class="stat-label">Emails scannés</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #10b98120; color: #10b981;">
                            <i class="fas fa-tags"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${results.categorized}</div>
                            <div class="stat-label">Catégorisés</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #8b5cf620; color: #8b5cf6;">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${results.stats?.preselectedForTasks || 0}</div>
                            <div class="stat-label">Pré-sélectionnés</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #6366f120; color: #6366f1;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${durationSeconds}s</div>
                            <div class="stat-label">Durée</div>
                        </div>
                    </div>
                </div>
                
                <div class="category-breakdown-section">
                    <h4>Répartition par catégorie</h4>
                    <div class="category-list">
                        ${this.renderCategoryBreakdown(results.breakdown)}
                    </div>
                </div>
                
                <div class="results-footer">
                    <button class="btn btn-outline" onclick="unifiedScanModule.resetScan()">
                        <i class="fas fa-redo"></i>
                        Nouveau scan
                    </button>
                </div>
            </div>
        `;
        
        resultsContainer.style.display = 'block';
    }

    renderCategoryBreakdown(breakdown) {
        if (!breakdown || Object.keys(breakdown).length === 0) {
            return '<p class="empty-message">Aucune catégorie détectée</p>';
        }
        
        // Obtenir les infos de catégorie depuis CategoryManager
        const categoryInfo = {};
        if (window.categoryManager) {
            Object.keys(breakdown).forEach(catId => {
                categoryInfo[catId] = window.categoryManager.getCategory(catId) || {
                    name: catId,
                    icon: '📂',
                    color: '#6b7280'
                };
            });
        }
        
        // Trier par nombre d'emails
        const sortedCategories = Object.entries(breakdown)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10
        
        return sortedCategories.map(([catId, count]) => {
            const info = categoryInfo[catId] || { name: catId, icon: '📂', color: '#6b7280' };
            const percentage = this.scanResults ? Math.round((count / this.scanResults.total) * 100) : 0;
            
            return `
                <div class="category-row">
                    <div class="category-info">
                        <span class="category-icon" style="color: ${info.color}">${info.icon}</span>
                        <span class="category-name">${info.name}</span>
                    </div>
                    <div class="category-progress">
                        <span class="category-count">${count}</span>
                        <div class="category-bar">
                            <div class="category-fill" style="width: ${percentage}%; background: ${info.color}"></div>
                        </div>
                        <span class="category-percent">${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getUserEmail() {
        try {
            if (this.currentProvider === 'gmail') {
                const account = window.googleAuthService?.getAccount?.();
                return account?.email || 'Compte Gmail';
            } else if (this.currentProvider === 'outlook') {
                const user = window.authService?.getCurrentUser?.();
                return user?.userPrincipalName || user?.mail || 'Compte Outlook';
            }
        } catch (error) {
            console.warn('[StartScan] Could not get user email:', error);
        }
        return 'Compte email';
    }

    getScanOptionsFromUI() {
        const period = parseInt(document.getElementById('scanPeriod')?.value || '7');
        const folder = document.getElementById('scanFolder')?.value || 'inbox';
        const limit = parseInt(document.getElementById('scanLimit')?.value || '-1');
        const includeSpam = document.getElementById('includeSpam')?.checked || false;
        const autoCategrize = document.getElementById('autoCategrize')?.checked !== false;
        const autoAnalyze = document.getElementById('autoAnalyze')?.checked || false;
        
        return {
            days: period === -1 ? 365 * 10 : period, // 10 ans si "tous"
            folder: folder,
            maxEmails: limit,
            includeSpam: includeSpam,
            autoCategrize: autoCategrize,
            autoAnalyze: autoAnalyze
        };
    }

    getSavedScanOptions() {
        const defaults = { ...this.defaultScanOptions };
        
        try {
            const saved = this.userSettings.scanOptions?.[this.currentProvider];
            if (saved) {
                return { ...defaults, ...saved };
            }
        } catch (error) {
            console.warn('[StartScan] Could not load saved options:', error);
        }
        
        return defaults;
    }

    saveScanOptions(options) {
        try {
            if (!this.userSettings.scanOptions) {
                this.userSettings.scanOptions = {};
            }
            
            this.userSettings.scanOptions[this.currentProvider] = options;
            localStorage.setItem('unifiedScanSettings', JSON.stringify(this.userSettings));
            
        } catch (error) {
            console.warn('[StartScan] Could not save options:', error);
        }
    }

    loadUserSettings() {
        try {
            const saved = localStorage.getItem('unifiedScanSettings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('[StartScan] Could not load settings:', error);
        }
        
        return {
            scanOptions: {},
            preferences: {}
        };
    }

    saveScanResultsToSession(results) {
        try {
            sessionStorage.setItem('scanResults', JSON.stringify({
                provider: this.currentProvider,
                timestamp: Date.now(),
                total: results.total,
                categorized: results.categorized,
                breakdown: results.breakdown,
                stats: results.stats
            }));
            
            console.log('[StartScan] 💾 Results saved to session');
            
        } catch (error) {
            console.warn('[StartScan] Could not save results:', error);
        }
    }

    resetScan() {
        this.scanResults = null;
        document.getElementById('scanResults').style.display = 'none';
        
        // Réinitialiser les options UI
        const savedOptions = this.getSavedScanOptions();
        document.getElementById('scanPeriod').value = savedOptions.days;
        document.getElementById('scanFolder').value = savedOptions.folder;
        document.getElementById('scanLimit').value = savedOptions.maxEmails;
        document.getElementById('includeSpam').checked = savedOptions.includeSpam;
        document.getElementById('autoCategrize').checked = savedOptions.autoCategrize;
        document.getElementById('autoAnalyze').checked = savedOptions.autoAnalyze;
    }

    exportResults() {
        if (!window.emailScanner?.exportResults) {
            this.showToast('Fonction d\'export non disponible', 'warning');
            return;
        }
        
        window.emailScanner.exportResults('csv');
        this.showToast('Export démarré', 'success');
    }

    viewEmails() {
        console.log('[StartScan] 📧 Navigating to emails page for', this.currentProvider);
        
        const providerConfig = this.providers[this.currentProvider];
        
        if (this.currentProvider === 'gmail') {
            // Rediriger vers PageManagerGmail
            if (window.pageManagerGmail) {
                console.log('[StartScan] ✅ Redirecting to PageManagerGmail');
                window.pageManagerGmail.loadPage('emails');
            } else if (window.pageManager) {
                // Fallback vers pageManager principal avec page gmail
                console.log('[StartScan] ✅ Redirecting to pageManager -> gmail');
                window.pageManager.loadPage('gmail');
            } else {
                this.showToast('PageManagerGmail non disponible', 'error');
            }
        } else if (this.currentProvider === 'outlook') {
            // Rediriger vers la page emails standard pour Outlook
            if (window.pageManager) {
                console.log('[StartScan] ✅ Redirecting to pageManager -> emails');
                window.pageManager.loadPage('emails');
            } else {
                this.showToast('PageManager non disponible', 'error');
            }
        }
    }

    // ================================================
    // UI HELPERS
    // ================================================
    showLoading(message = 'Chargement...') {
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading(message);
            return;
        }
        
        const existingLoader = document.getElementById('unifiedLoader');
        if (existingLoader) {
            existingLoader.remove();
        }
        
        const loader = document.createElement('div');
        loader.id = 'unifiedLoader';
        loader.className = 'unified-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(loader);
    }

    hideLoading() {
        if (window.uiManager?.hideLoading) {
            window.uiManager.hideLoading();
            return;
        }
        
        const loader = document.getElementById('unifiedLoader');
        if (loader) {
            loader.remove();
        }
    }

    showToast(message, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
            return;
        }
        
        // Fallback toast
        const toast = document.createElement('div');
        toast.className = `unified-toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // ================================================
    // STYLES CSS (STRUCTURE ORIGINALE)
    // ================================================
    addStyles() {
        if (document.getElementById('unified-scan-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'unified-scan-styles';
        styles.textContent = `
            /* Container principal avec structure originale */
            .start-scan-modern {
                background: #f8fafc;
                min-height: 100vh;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            }
            
            /* Header Section */
            .scan-header-section {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .scan-icon-wrapper {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
            }
            
            .scan-icon-wrapper i {
                font-size: 36px;
                color: white;
            }
            
            .scan-title {
                font-size: 32px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 10px;
            }
            
            .scan-subtitle {
                font-size: 16px;
                color: #6b7280;
                max-width: 500px;
                margin: 0 auto;
            }
            
            /* Provider Selection */
            .provider-selection-section {
                max-width: 700px;
                margin: 0 auto 40px;
            }
            
            .section-title {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 24px;
                text-align: center;
            }
            
            .provider-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
            }
            
            .provider-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .provider-card:hover {
                border-color: #6366f1;
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
            }
            
            .provider-icon-large {
                font-size: 48px;
                margin-bottom: 16px;
            }
            
            .provider-card h4 {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 8px;
            }
            
            .provider-card p {
                color: #6b7280;
                margin-bottom: 20px;
            }
            
            .provider-features {
                list-style: none;
                padding: 0;
                margin: 0;
                text-align: left;
            }
            
            .provider-features li {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #4b5563;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .provider-features i {
                color: #10b981;
                width: 16px;
            }
            
            /* Auth Required */
            .auth-required-section {
                max-width: 500px;
                margin: 0 auto;
                text-align: center;
            }
            
            .auth-message {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .auth-message h3 {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 12px;
            }
            
            .auth-message p {
                color: #6b7280;
                margin-bottom: 24px;
            }
            
            /* Scan Config */
            .scan-config-section {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .connected-account {
                background: white;
                border-radius: 12px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 24px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .account-badge {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .account-info {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .account-label {
                font-size: 13px;
                color: #6b7280;
            }
            
            .account-email {
                font-size: 15px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .btn-disconnect {
                padding: 8px 16px;
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .btn-disconnect:hover {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .scan-options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 24px;
            }
            
            .scan-option {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .option-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .option-label i {
                color: #6b7280;
            }
            
            .option-select {
                width: 100%;
                padding: 10px 12px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                color: #1f2937;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .option-select:hover {
                border-color: #d1d5db;
            }
            
            .option-select:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .scan-toggles {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .toggle-switch {
                display: flex;
                align-items: center;
                cursor: pointer;
                position: relative;
                padding-left: 52px;
                font-size: 14px;
                color: #374151;
                user-select: none;
            }
            
            .toggle-switch input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
            }
            
            .toggle-slider {
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 44px;
                height: 24px;
                background: #e5e7eb;
                border-radius: 12px;
                transition: all 0.3s ease;
            }
            
            .toggle-slider::after {
                content: '';
                position: absolute;
                left: 2px;
                top: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .toggle-switch input:checked + .toggle-slider {
                background: #6366f1;
            }
            
            .toggle-switch input:checked + .toggle-slider::after {
                transform: translateX(20px);
            }
            
            .toggle-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
            }
            
            .toggle-label i {
                color: #6b7280;
                width: 16px;
            }
            
            .scan-action-section {
                text-align: center;
            }
            
            /* Buttons */
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
            }
            
            .btn-primary:disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .btn-outline {
                background: transparent;
                color: #6366f1;
                border: 2px solid #6366f1;
            }
            
            .btn-outline:hover {
                background: #6366f1;
                color: white;
            }
            
            .btn-large {
                padding: 16px 32px;
                font-size: 16px;
            }
            
            .btn-scan {
                min-width: 200px;
                justify-content: center;
            }
            
            /* Progress */
            .scan-progress-wrapper {
                max-width: 800px;
                margin: 40px auto;
            }
            
            .progress-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .progress-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .progress-title i {
                color: #6366f1;
            }
            
            .btn-cancel-scan {
                padding: 8px 16px;
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .btn-cancel-scan:hover {
                background: #fee2e2;
            }
            
            .progress-bar-container {
                height: 8px;
                background: #f3f4f6;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 16px;
            }
            
            .progress-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
                border-radius: 4px;
                transition: width 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .progress-bar-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    90deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.3) 50%,
                    transparent 100%
                );
                animation: shimmer 1.5s infinite;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .progress-details {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
            }
            
            #progressMessage {
                color: #6b7280;
            }
            
            .progress-stats {
                font-weight: 600;
                color: #374151;
            }
            
            /* Results */
            .scan-results-wrapper {
                max-width: 800px;
                margin: 40px auto;
            }
            
            .scan-results-container {
                background: white;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .results-success {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .results-success i {
                font-size: 28px;
                color: #10b981;
            }
            
            .results-success h3 {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }
            
            .results-actions {
                display: flex;
                gap: 12px;
            }
            
            .results-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 16px;
                margin-bottom: 32px;
            }
            
            .stat-card {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .stat-icon {
                width: 48px;
                height: 48px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .stat-content {
                flex: 1;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                line-height: 1;
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 13px;
                color: #6b7280;
            }
            
            .category-breakdown-section {
                margin-bottom: 32px;
            }
            
            .category-breakdown-section h4 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
            }
            
            .category-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .category-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
            }
            
            .category-info {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 150px;
            }
            
            .category-icon {
                font-size: 18px;
            }
            
            .category-name {
                font-size: 14px;
                font-weight: 500;
                color: #374151;
            }
            
            .category-progress {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .category-count {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                min-width: 40px;
                text-align: right;
            }
            
            .category-bar {
                flex: 1;
                height: 8px;
                background: #f3f4f6;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .category-fill {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            
            .category-percent {
                font-size: 13px;
                color: #6b7280;
                min-width: 40px;
            }
            
            .empty-message {
                text-align: center;
                color: #9ca3af;
                font-style: italic;
                padding: 20px;
            }
            
            .results-footer {
                text-align: center;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
            }
            
            /* Loader */
            .unified-loader {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            }
            
            .loader-content {
                background: white;
                border-radius: 12px;
                padding: 32px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }
            
            .loader-content i {
                font-size: 48px;
                color: #6366f1;
                margin-bottom: 16px;
            }
            
            .loader-content p {
                color: #374151;
                font-size: 16px;
                font-weight: 500;
                margin: 0;
            }
            
            /* Toast */
            .unified-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 250px;
                max-width: 400px;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                z-index: 100000;
            }
            
            .unified-toast.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .unified-toast i {
                font-size: 20px;
            }
            
            .toast-success {
                border-left: 4px solid #10b981;
            }
            
            .toast-success i {
                color: #10b981;
            }
            
            .toast-error {
                border-left: 4px solid #ef4444;
            }
            
            .toast-error i {
                color: #ef4444;
            }
            
            .toast-warning {
                border-left: 4px solid #f59e0b;
            }
            
            .toast-warning i {
                color: #f59e0b;
            }
            
            .toast-info {
                border-left: 4px solid #3b82f6;
            }
            
            .toast-info i {
                color: #3b82f6;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .start-scan-modern {
                    padding: 12px;
                }
                
                .scan-title {
                    font-size: 24px;
                }
                
                .scan-subtitle {
                    font-size: 14px;
                }
                
                .provider-grid {
                    grid-template-columns: 1fr;
                }
                
                .connected-account {
                    flex-direction: column;
                    text-align: center;
                }
                
                .btn-disconnect {
                    width: 100%;
                    justify-content: center;
                }
                
                .scan-options-grid {
                    grid-template-columns: 1fr;
                }
                
                .scan-toggles {
                    flex-direction: column;
                }
                
                .results-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .results-actions {
                    width: 100%;
                }
                
                .results-actions .btn {
                    flex: 1;
                    justify-content: center;
                }
                
                .results-stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .category-row {
                    flex-wrap: wrap;
                }
                
                .category-progress {
                    width: 100%;
                }
            }
            
            @media (max-width: 480px) {
                .scan-icon-wrapper {
                    width: 60px;
                    height: 60px;
                }
                
                .scan-icon-wrapper i {
                    font-size: 28px;
                }
                
                .results-stats-grid {
                    grid-template-columns: 1fr;
                }
                
                .stat-card {
                    padding: 16px;
                }
                
                .scan-results-container {
                    padding: 20px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================

// Nettoyer l'ancienne instance
if (window.unifiedScanModule || window.scanStartModule || window.minimalScanModule) {
    console.log('[StartScan] 🔄 Cleaning up old instances...');
}

// Créer la nouvelle instance
window.unifiedScanModule = new UnifiedScanModule();
window.scanStartModule = window.unifiedScanModule; // Alias pour compatibilité
window.minimalScanModule = window.unifiedScanModule; // Alias pour compatibilité avec l'ancien nom

// Export des méthodes de test
window.testUnifiedScan = function() {
    console.group('🧪 TEST UnifiedScan v30.0');
    
    console.log('Current Provider:', window.unifiedScanModule.currentProvider);
    console.log('Is Authenticated:', window.unifiedScanModule.isAuthenticated);
    console.log('Providers:', window.unifiedScanModule.providers);
    console.log('User Settings:', window.unifiedScanModule.userSettings);
    console.log('Scan Metrics:', window.unifiedScanModule.scanMetrics);
    
    // Test de redirection
    console.log('\n📧 Test redirections:');
    console.log('Gmail -> pageManagerGmail:', !!window.pageManagerGmail);
    console.log('Outlook -> pageManager:', !!window.pageManager);
    
    console.groupEnd();
    return { success: true };
};

console.log('✅ StartScan v30.0 loaded - Unified Gmail/Outlook Scanner with proper routing!');
