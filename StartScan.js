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
                scanLimit: -1 // Pas de limite
            },
            outlook: {
                name: 'Outlook',
                icon: 'fab fa-microsoft', 
                color: '#0078d4',
                authService: 'authService',
                scanLimit: -1 // Pas de limite
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
        
        console.log('[StartScan] ✅ Module unifié initialisé');
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
        
        // Ajouter les styles
        this.addStyles();
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
        const savedOptions = this.getSavedScanOptions();
        
        // Utiliser exactement la même structure HTML que l'original
        container.innerHTML = `
            <div class="start-scan-page">
                <div class="start-scan-container">
                    <!-- Provider Selection -->
                    ${!this.currentProvider ? `
                        <div class="provider-selection">
                            <h2 class="provider-title">
                                <i class="fas fa-envelope-open-text"></i>
                                Choisissez votre service email
                            </h2>
                            <div class="provider-cards">
                                <div class="provider-card" onclick="unifiedScanModule.selectProvider('gmail')">
                                    <div class="provider-icon" style="color: #4285f4;">
                                        <i class="fab fa-google"></i>
                                    </div>
                                    <h3>Gmail</h3>
                                    <p>Scanner votre compte Google</p>
                                </div>
                                <div class="provider-card" onclick="unifiedScanModule.selectProvider('outlook')">
                                    <div class="provider-icon" style="color: #0078d4;">
                                        <i class="fab fa-microsoft"></i>
                                    </div>
                                    <h3>Outlook</h3>
                                    <p>Scanner votre compte Microsoft</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Auth Required -->
                    ${this.currentProvider && !this.isAuthenticated ? `
                        <div class="auth-section">
                            <div class="auth-icon" style="color: ${this.providers[this.currentProvider].color};">
                                <i class="${this.providers[this.currentProvider].icon}"></i>
                            </div>
                            <h2>Connexion requise</h2>
                            <p>Connectez-vous à ${this.providers[this.currentProvider].name} pour scanner vos emails</p>
                            <button class="btn-auth" onclick="unifiedScanModule.authenticate()">
                                <i class="${this.providers[this.currentProvider].icon}"></i>
                                Se connecter avec ${this.providers[this.currentProvider].name}
                            </button>
                        </div>
                    ` : ''}

                    <!-- Scan Options -->
                    ${this.currentProvider && this.isAuthenticated ? `
                        <div class="scan-header">
                            <h2 class="scan-title">
                                <i class="fas fa-search"></i>
                                Scanner vos emails ${this.providers[this.currentProvider].name}
                            </h2>
                            <p class="scan-subtitle">${this.getUserEmail()}</p>
                        </div>

                        <div class="scan-options">
                            <div class="option-row">
                                <div class="option-group">
                                    <label>
                                        <i class="fas fa-calendar-alt"></i>
                                        Période
                                    </label>
                                    <select id="scanPeriod" class="scan-select">
                                        <option value="1" ${savedOptions.days === 1 ? 'selected' : ''}>Dernières 24 heures</option>
                                        <option value="3" ${savedOptions.days === 3 ? 'selected' : ''}>3 derniers jours</option>
                                        <option value="7" ${savedOptions.days === 7 ? 'selected' : ''}>7 derniers jours</option>
                                        <option value="14" ${savedOptions.days === 14 ? 'selected' : ''}>2 dernières semaines</option>
                                        <option value="30" ${savedOptions.days === 30 ? 'selected' : ''}>30 derniers jours</option>
                                        <option value="90" ${savedOptions.days === 90 ? 'selected' : ''}>3 derniers mois</option>
                                        <option value="-1">Tous les emails</option>
                                    </select>
                                </div>
                                
                                <div class="option-group">
                                    <label>
                                        <i class="fas fa-folder"></i>
                                        Dossier
                                    </label>
                                    <select id="scanFolder" class="scan-select">
                                        ${this.renderFolderOptions(savedOptions.folder)}
                                    </select>
                                </div>
                                
                                <div class="option-group">
                                    <label>
                                        <i class="fas fa-list-ol"></i>
                                        Limite
                                    </label>
                                    <select id="scanLimit" class="scan-select">
                                        <option value="100" ${savedOptions.maxEmails === 100 ? 'selected' : ''}>100 emails</option>
                                        <option value="500" ${savedOptions.maxEmails === 500 ? 'selected' : ''}>500 emails</option>
                                        <option value="1000" ${savedOptions.maxEmails === 1000 ? 'selected' : ''}>1000 emails</option>
                                        <option value="5000" ${savedOptions.maxEmails === 5000 ? 'selected' : ''}>5000 emails</option>
                                        <option value="-1" ${savedOptions.maxEmails === -1 ? 'selected' : ''}>Sans limite</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="scan-toggles">
                                <label class="scan-toggle">
                                    <input type="checkbox" id="includeSpam" ${savedOptions.includeSpam ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-text">Inclure les spams</span>
                                </label>
                                
                                <label class="scan-toggle">
                                    <input type="checkbox" id="autoCategrize" ${savedOptions.autoCategrize ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-text">Catégorisation automatique</span>
                                </label>
                                
                                <label class="scan-toggle">
                                    <input type="checkbox" id="autoAnalyze" ${savedOptions.autoAnalyze ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-text">Analyse IA pour tâches</span>
                                </label>
                            </div>
                        </div>

                        <div class="scan-actions">
                            <button id="startScanBtn" class="btn-start-scan" onclick="unifiedScanModule.startScan()">
                                <i class="fas fa-search"></i>
                                Démarrer le scan
                            </button>
                            <button class="btn-logout" onclick="unifiedScanModule.logout()">
                                <i class="fas fa-sign-out-alt"></i>
                                Déconnexion
                            </button>
                        </div>
                    ` : ''}

                    <!-- Progress -->
                    <div id="scanProgress" class="scan-progress" style="display: none;">
                        <div class="progress-header">
                            <h3>Scan en cours...</h3>
                            <button class="btn-cancel" onclick="unifiedScanModule.cancelScan()">
                                Annuler
                            </button>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-info">
                            <span id="progressMessage">Initialisation...</span>
                            <span id="progressStats">0/0</span>
                        </div>
                    </div>

                    <!-- Results -->
                    <div id="scanResults" class="scan-results" style="display: none;"></div>
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
        
        resultsContainer.innerHTML = `
            <div class="results-container">
                <div class="results-header">
                    <h3>
                        <i class="fas fa-check-circle"></i>
                        Scan terminé
                    </h3>
                    <div class="results-actions">
                        <button class="btn-secondary" onclick="unifiedScanModule.exportResults()">
                            <i class="fas fa-download"></i>
                            Exporter
                        </button>
                        <button class="btn-primary" onclick="unifiedScanModule.viewEmails()">
                            <i class="fas fa-envelope"></i>
                            Voir les emails
                        </button>
                    </div>
                </div>
                
                <div class="results-stats">
                    <div class="stat-box">
                        <div class="stat-value">${results.total}</div>
                        <div class="stat-label">Emails scannés</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${results.categorized}</div>
                        <div class="stat-label">Catégorisés</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${results.stats?.preselectedForTasks || 0}</div>
                        <div class="stat-label">Pré-sélectionnés</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${durationSeconds}s</div>
                        <div class="stat-label">Durée</div>
                    </div>
                </div>
                
                <div class="results-categories">
                    <h4>Catégories</h4>
                    ${this.renderCategoryBreakdown(results.breakdown)}
                </div>
                
                <button class="btn-new-scan" onclick="unifiedScanModule.resetScan()">
                    <i class="fas fa-redo"></i>
                    Nouveau scan
                </button>
            </div>
        `;
        
        resultsContainer.style.display = 'block';
    }

    renderCategoryBreakdown(breakdown) {
        if (!breakdown || Object.keys(breakdown).length === 0) {
            return '<p>Aucune catégorie détectée</p>';
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
        
        return `<div class="category-list">` + sortedCategories.map(([catId, count]) => {
            const info = categoryInfo[catId] || { name: catId, icon: '📂', color: '#6b7280' };
            const percentage = this.scanResults ? Math.round((count / this.scanResults.total) * 100) : 0;
            
            return `
                <div class="category-item">
                    <span class="category-icon" style="color: ${info.color}">${info.icon}</span>
                    <span class="category-name">${info.name}</span>
                    <span class="category-count">${count} (${percentage}%)</span>
                </div>
            `;
        }).join('') + `</div>`;
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
        
        // REDIRECTION CORRIGÉE
        if (this.currentProvider === 'gmail') {
            // Pour Gmail, utiliser PageManagerGmail
            if (window.pageManagerGmail) {
                console.log('[StartScan] ✅ Using pageManagerGmail.loadPage("emails")');
                window.pageManagerGmail.loadPage('emails');
            } else if (window.pageManager) {
                // Fallback: essayer pageManager avec la page gmail
                console.log('[StartScan] ✅ Fallback: pageManager.loadPage("gmail")');
                window.pageManager.loadPage('gmail');
            } else {
                console.error('[StartScan] ❌ No page manager available for Gmail');
                this.showToast('Navigation non disponible', 'error');
            }
        } else if (this.currentProvider === 'outlook') {
            // Pour Outlook, utiliser le PageManager principal
            if (window.pageManager) {
                console.log('[StartScan] ✅ Using pageManager.loadPage("emails")');
                window.pageManager.loadPage('emails');
            } else {
                console.error('[StartScan] ❌ No page manager available for Outlook');
                this.showToast('Navigation non disponible', 'error');
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
        loader.className = 'loader-overlay';
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
        toast.className = `toast toast-${type}`;
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
    // STYLES CSS (EXACTEMENT COMME L'ORIGINAL)
    // ================================================
    addStyles() {
        if (document.getElementById('unified-scan-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'unified-scan-styles';
        styles.textContent = `
            /* Start Scan Page - Exactement comme l'original */
            .start-scan-page {
                min-height: 100vh;
                background: #f8fafc;
                padding: 30px 20px;
            }

            .start-scan-container {
                max-width: 800px;
                margin: 0 auto;
            }

            /* Provider Selection */
            .provider-selection {
                text-align: center;
                margin-bottom: 40px;
            }

            .provider-title {
                font-size: 28px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }

            .provider-title i {
                color: #6366f1;
            }

            .provider-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .provider-card {
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 16px;
                padding: 40px 30px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }

            .provider-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border-color: #6366f1;
            }

            .provider-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }

            .provider-card h3 {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 10px;
            }

            .provider-card p {
                color: #64748b;
                font-size: 16px;
            }

            /* Auth Section */
            .auth-section {
                background: white;
                border-radius: 16px;
                padding: 60px 40px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
            }

            .auth-icon {
                font-size: 64px;
                margin-bottom: 30px;
            }

            .auth-section h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 15px;
            }

            .auth-section p {
                color: #64748b;
                font-size: 16px;
                margin-bottom: 30px;
            }

            .btn-auth {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 14px 28px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
            }

            .btn-auth:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
            }

            /* Scan Header */
            .scan-header {
                background: white;
                border-radius: 16px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
                text-align: center;
            }

            .scan-title {
                font-size: 28px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }

            .scan-title i {
                color: #6366f1;
            }

            .scan-subtitle {
                color: #64748b;
                font-size: 16px;
            }

            /* Scan Options */
            .scan-options {
                background: white;
                border-radius: 16px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
            }

            .option-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .option-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .option-group label {
                font-size: 14px;
                font-weight: 600;
                color: #475569;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .option-group label i {
                color: #6366f1;
            }

            .scan-select {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 15px;
                color: #1e293b;
                background: #f8fafc;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .scan-select:hover {
                border-color: #cbd5e1;
                background: white;
            }

            .scan-select:focus {
                outline: none;
                border-color: #6366f1;
                background: white;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            /* Toggles */
            .scan-toggles {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
            }

            .scan-toggle {
                display: flex;
                align-items: center;
                cursor: pointer;
                position: relative;
                padding-left: 60px;
                min-height: 30px;
                user-select: none;
            }

            .scan-toggle input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
            }

            .toggle-slider {
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 50px;
                height: 26px;
                background: #cbd5e1;
                border-radius: 13px;
                transition: all 0.3s ease;
            }

            .toggle-slider::after {
                content: '';
                position: absolute;
                left: 3px;
                top: 3px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }

            .scan-toggle input:checked + .toggle-slider {
                background: #6366f1;
            }

            .scan-toggle input:checked + .toggle-slider::after {
                transform: translateX(24px);
            }

            .toggle-text {
                font-size: 15px;
                font-weight: 500;
                color: #475569;
            }

            /* Scan Actions */
            .scan-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-bottom: 30px;
            }

            .btn-start-scan {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 16px 32px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
            }

            .btn-start-scan:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
            }

            .btn-start-scan:disabled {
                background: #94a3b8;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            .btn-logout {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 14px 24px;
                background: #f1f5f9;
                color: #475569;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-logout:hover {
                background: #fee2e2;
                color: #dc2626;
                border-color: #fecaca;
            }

            /* Progress */
            .scan-progress {
                background: white;
                border-radius: 16px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
            }

            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .progress-header h3 {
                font-size: 20px;
                font-weight: 700;
                color: #1e293b;
                margin: 0;
            }

            .btn-cancel {
                padding: 8px 16px;
                background: #fee2e2;
                color: #dc2626;
                border: 1px solid #fecaca;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-cancel:hover {
                background: #fecaca;
            }

            .progress-bar {
                height: 10px;
                background: #e2e8f0;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 15px;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
                border-radius: 5px;
                transition: width 0.3s ease;
            }

            .progress-info {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                color: #64748b;
            }

            /* Results */
            .scan-results {
                background: white;
                border-radius: 16px;
                padding: 30px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
            }

            .results-container {
                max-width: 100%;
            }

            .results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                flex-wrap: wrap;
                gap: 20px;
            }

            .results-header h3 {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .results-header h3 i {
                color: #10b981;
            }

            .results-actions {
                display: flex;
                gap: 10px;
            }

            .btn-primary, .btn-secondary {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-primary {
                background: #6366f1;
                color: white;
                border: none;
            }

            .btn-primary:hover {
                background: #4f46e5;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }

            .btn-secondary {
                background: #f1f5f9;
                color: #475569;
                border: 2px solid #e2e8f0;
            }

            .btn-secondary:hover {
                background: #e2e8f0;
            }

            /* Results Stats */
            .results-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .stat-box {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
            }

            .stat-value {
                font-size: 36px;
                font-weight: 700;
                color: #1e293b;
                line-height: 1;
                margin-bottom: 8px;
            }

            .stat-label {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            }

            /* Categories */
            .results-categories {
                margin-bottom: 30px;
            }

            .results-categories h4 {
                font-size: 18px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 15px;
            }

            .category-list {
                display: grid;
                gap: 10px;
            }

            .category-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 12px 16px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
            }

            .category-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .category-name {
                flex: 1;
                font-weight: 600;
                color: #475569;
            }

            .category-count {
                font-weight: 700;
                color: #1e293b;
            }

            /* New Scan Button */
            .btn-new-scan {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 24px;
                background: #f1f5f9;
                color: #475569;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-top: 20px;
            }

            .btn-new-scan:hover {
                background: #e2e8f0;
            }

            /* Loader */
            .loader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(15, 23, 42, 0.8);
                backdrop-filter: blur(8px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .loader-content {
                background: white;
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .loader-content i {
                font-size: 48px;
                color: #6366f1;
                margin-bottom: 20px;
                animation: spin 1s linear infinite;
            }

            .loader-content p {
                font-size: 16px;
                color: #475569;
                font-weight: 500;
                margin: 0;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            /* Toast */
            .toast {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: white;
                border-radius: 12px;
                padding: 16px 24px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                z-index: 100000;
            }

            .toast.show {
                opacity: 1;
                transform: translateY(0);
            }

            .toast i {
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
                .start-scan-page {
                    padding: 20px 15px;
                }

                .provider-cards {
                    grid-template-columns: 1fr;
                }

                .option-row {
                    grid-template-columns: 1fr;
                }

                .scan-toggles {
                    flex-direction: column;
                }

                .scan-actions {
                    flex-direction: column;
                    width: 100%;
                }

                .scan-actions button {
                    width: 100%;
                    justify-content: center;
                }

                .results-header {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .results-actions {
                    width: 100%;
                }

                .results-actions button {
                    flex: 1;
                    justify-content: center;
                }

                .results-stats {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @media (max-width: 480px) {
                .results-stats {
                    grid-template-columns: 1fr;
                }

                .stat-value {
                    font-size: 28px;
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
    console.log('Gmail pageManagerGmail exists?', !!window.pageManagerGmail);
    console.log('Outlook pageManager exists?', !!window.pageManager);
    
    // Test direct de la méthode viewEmails
    console.log('\n🔍 Test viewEmails method:');
    window.unifiedScanModule.currentProvider = 'gmail';
    console.log('Testing Gmail redirection...');
    // window.unifiedScanModule.viewEmails(); // Décommenter pour tester
    
    console.groupEnd();
    return { success: true };
};

console.log('✅ StartScan v30.0 loaded - Unified Gmail/Outlook Scanner with proper routing!');
