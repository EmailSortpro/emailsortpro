// StartScan.js - Version 30.0 - Module de scan unifié Gmail/Outlook
// Support complet multi-provider sans limitations

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
                features: {
                    labels: true,
                    categories: true,
                    importance: true,
                    unlimited: true
                }
            },
            outlook: {
                name: 'Outlook',
                icon: 'fab fa-microsoft', 
                color: '#0078d4',
                authService: 'authService',
                scanLimit: -1, // Pas de limite
                features: {
                    folders: true,
                    categories: true,
                    flags: true,
                    unlimited: true
                }
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
        
        // Rendre l'interface appropriée
        if (!this.currentProvider) {
            this.renderProviderSelection(container);
        } else if (!this.isAuthenticated) {
            this.renderAuthRequired(container);
        } else {
            this.renderScanInterface(container);
        }
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
    // INTERFACE DE SÉLECTION DU PROVIDER
    // ================================================
    renderProviderSelection(container) {
        container.innerHTML = `
            <div class="scan-provider-selection">
                <div class="provider-header">
                    <i class="fas fa-envelope-open-text"></i>
                    <h2>Choisissez votre service email</h2>
                    <p>Sélectionnez le service que vous souhaitez scanner</p>
                </div>
                
                <div class="provider-cards">
                    <div class="provider-card gmail" onclick="unifiedScanModule.selectProvider('gmail')">
                        <div class="provider-icon">
                            <i class="fab fa-google"></i>
                        </div>
                        <h3>Gmail</h3>
                        <p>Scanner vos emails Google</p>
                        <div class="provider-features">
                            <span><i class="fas fa-infinity"></i> Scan illimité</span>
                            <span><i class="fas fa-tags"></i> Labels Gmail</span>
                            <span><i class="fas fa-star"></i> Emails importants</span>
                        </div>
                        <button class="btn-select-provider">
                            <i class="fas fa-arrow-right"></i>
                            Sélectionner Gmail
                        </button>
                    </div>
                    
                    <div class="provider-card outlook" onclick="unifiedScanModule.selectProvider('outlook')">
                        <div class="provider-icon">
                            <i class="fab fa-microsoft"></i>
                        </div>
                        <h3>Outlook</h3>
                        <p>Scanner vos emails Microsoft</p>
                        <div class="provider-features">
                            <span><i class="fas fa-infinity"></i> Scan illimité</span>
                            <span><i class="fas fa-folder"></i> Dossiers Outlook</span>
                            <span><i class="fas fa-flag"></i> Emails marqués</span>
                        </div>
                        <button class="btn-select-provider">
                            <i class="fas fa-arrow-right"></i>
                            Sélectionner Outlook
                        </button>
                    </div>
                </div>
                
                <div class="provider-info">
                    <i class="fas fa-shield-alt"></i>
                    <p>Vos données sont sécurisées et restent privées. Aucune information n'est stockée sur nos serveurs.</p>
                </div>
            </div>
        `;
    }

    // ================================================
    // INTERFACE D'AUTHENTIFICATION REQUISE
    // ================================================
    renderAuthRequired(container) {
        const provider = this.providers[this.currentProvider];
        
        container.innerHTML = `
            <div class="scan-auth-required">
                <div class="auth-icon" style="color: ${provider.color}">
                    <i class="${provider.icon}"></i>
                </div>
                <h2>Connexion requise</h2>
                <p>Connectez-vous à votre compte ${provider.name} pour scanner vos emails</p>
                
                <button class="btn-auth-primary" onclick="unifiedScanModule.authenticate()">
                    <i class="${provider.icon}"></i>
                    Se connecter avec ${provider.name}
                </button>
                
                <button class="btn-auth-secondary" onclick="unifiedScanModule.selectProvider(null)">
                    <i class="fas fa-arrow-left"></i>
                    Choisir un autre service
                </button>
                
                <div class="auth-info">
                    <h4>Pourquoi se connecter ?</h4>
                    <ul>
                        <li><i class="fas fa-check"></i> Accéder à vos emails en toute sécurité</li>
                        <li><i class="fas fa-check"></i> Scanner et catégoriser automatiquement</li>
                        <li><i class="fas fa-check"></i> Créer des tâches depuis vos emails importants</li>
                        <li><i class="fas fa-check"></i> Aucune donnée n'est conservée après la session</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // ================================================
    // INTERFACE DE SCAN PRINCIPALE
    // ================================================
    renderScanInterface(container) {
        const provider = this.providers[this.currentProvider];
        const savedOptions = this.getSavedScanOptions();
        
        container.innerHTML = `
            <div class="scan-interface">
                <!-- Header avec info provider -->
                <div class="scan-header">
                    <div class="provider-info">
                        <div class="provider-badge" style="background: ${provider.color}">
                            <i class="${provider.icon}"></i>
                        </div>
                        <div>
                            <h3>Scanner ${provider.name}</h3>
                            <p class="provider-account">${this.getUserEmail()}</p>
                        </div>
                    </div>
                    <button class="btn-logout" onclick="unifiedScanModule.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Déconnexion
                    </button>
                </div>

                <!-- Options de scan -->
                <div class="scan-options">
                    <h4>Options de scan</h4>
                    
                    <div class="option-group">
                        <label>
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
                    
                    <div class="option-group">
                        <label>
                            <i class="fas fa-folder"></i>
                            Dossier à scanner
                        </label>
                        <select id="scanFolder" class="option-select">
                            ${this.renderFolderOptions(savedOptions.folder)}
                        </select>
                    </div>
                    
                    <div class="option-group">
                        <label>
                            <i class="fas fa-list-ol"></i>
                            Nombre maximum d'emails
                        </label>
                        <select id="scanLimit" class="option-select">
                            <option value="100" ${savedOptions.maxEmails === 100 ? 'selected' : ''}>100 emails</option>
                            <option value="500" ${savedOptions.maxEmails === 500 ? 'selected' : ''}>500 emails</option>
                            <option value="1000" ${savedOptions.maxEmails === 1000 ? 'selected' : ''}>1000 emails</option>
                            <option value="5000" ${savedOptions.maxEmails === 5000 ? 'selected' : ''}>5000 emails</option>
                            <option value="-1" ${savedOptions.maxEmails === -1 ? 'selected' : ''}>Pas de limite</option>
                        </select>
                    </div>
                    
                    <div class="option-toggles">
                        <label class="toggle-option">
                            <input type="checkbox" id="includeSpam" ${savedOptions.includeSpam ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">
                                <i class="fas fa-ban"></i>
                                Inclure les spams
                            </span>
                        </label>
                        
                        <label class="toggle-option">
                            <input type="checkbox" id="autoCategrize" ${savedOptions.autoCategrize ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">
                                <i class="fas fa-tags"></i>
                                Catégorisation automatique
                            </span>
                        </label>
                        
                        <label class="toggle-option">
                            <input type="checkbox" id="autoAnalyze" ${savedOptions.autoAnalyze ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">
                                <i class="fas fa-brain"></i>
                                Analyse IA pour tâches
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Bouton de scan -->
                <div class="scan-actions">
                    <button id="startScanBtn" class="btn-start-scan" onclick="unifiedScanModule.startScan()">
                        <i class="fas fa-search"></i>
                        <span>Démarrer le scan</span>
                    </button>
                </div>

                <!-- Zone de progression -->
                <div id="scanProgress" class="scan-progress" style="display: none;">
                    <div class="progress-header">
                        <h4>Scan en cours...</h4>
                        <button class="btn-cancel" onclick="unifiedScanModule.cancelScan()">
                            <i class="fas fa-times"></i>
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

                <!-- Zone de résultats -->
                <div id="scanResults" class="scan-results" style="display: none;"></div>
            </div>
        `;
        
        // Ajouter les styles si nécessaire
        this.addStyles();
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
                        Scan terminé avec succès
                    </h3>
                    <div class="results-actions">
                        <button class="btn-export" onclick="unifiedScanModule.exportResults()">
                            <i class="fas fa-download"></i>
                            Exporter
                        </button>
                        <button class="btn-view-emails" onclick="unifiedScanModule.viewEmails()">
                            <i class="fas fa-envelope"></i>
                            Voir les emails
                        </button>
                    </div>
                </div>
                
                <div class="results-summary">
                    <div class="summary-card">
                        <div class="summary-icon" style="color: ${this.providers[this.currentProvider].color}">
                            <i class="${this.providers[this.currentProvider].icon}"></i>
                        </div>
                        <div class="summary-content">
                            <h4>${results.total}</h4>
                            <p>Emails scannés</p>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="summary-icon" style="color: #10b981">
                            <i class="fas fa-tags"></i>
                        </div>
                        <div class="summary-content">
                            <h4>${results.categorized}</h4>
                            <p>Emails catégorisés</p>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="summary-icon" style="color: #8b5cf6">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="summary-content">
                            <h4>${results.stats?.preselectedForTasks || 0}</h4>
                            <p>Pré-sélectionnés</p>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="summary-icon" style="color: #6366f1">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="summary-content">
                            <h4>${durationSeconds}s</h4>
                            <p>Durée du scan</p>
                        </div>
                    </div>
                </div>
                
                <div class="results-breakdown">
                    <h4>Répartition par catégorie</h4>
                    <div class="category-breakdown">
                        ${this.renderCategoryBreakdown(results.breakdown)}
                    </div>
                </div>
                
                ${results.stats?.taskSuggestions > 0 ? `
                    <div class="results-ai">
                        <div class="ai-badge">
                            <i class="fas fa-brain"></i>
                            Analyse IA
                        </div>
                        <p>${results.stats.taskSuggestions} emails avec suggestions de tâches</p>
                    </div>
                ` : ''}
                
                <div class="results-footer">
                    <button class="btn-new-scan" onclick="unifiedScanModule.resetScan()">
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
            return '<p class="no-data">Aucune catégorie détectée</p>';
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
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-icon" style="color: ${info.color}">${info.icon}</span>
                        <span class="category-name">${info.name}</span>
                    </div>
                    <div class="category-stats">
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
        // Naviguer vers la page des emails du provider
        if (window.pageManager) {
            if (this.currentProvider === 'gmail') {
                window.pageManager.loadPage('gmail');
            } else if (this.currentProvider === 'outlook') {
                window.pageManager.loadPage('emails');
            }
        } else {
            this.showToast('Navigation non disponible', 'warning');
        }
    }

    // ================================================
    // UI HELPERS
    // ================================================
    showLoading(message = 'Chargement...') {
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
    // STYLES CSS
    // ================================================
    addStyles() {
        if (document.getElementById('unified-scan-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'unified-scan-styles';
        styles.textContent = `
            /* Container principal */
            .scan-interface {
                background: #f8fafc;
                min-height: 100vh;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            }
            
            /* Provider Selection */
            .scan-provider-selection {
                max-width: 800px;
                margin: 60px auto;
                text-align: center;
            }
            
            .provider-header {
                margin-bottom: 40px;
            }
            
            .provider-header i {
                font-size: 48px;
                color: #6366f1;
                margin-bottom: 20px;
            }
            
            .provider-header h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 10px;
            }
            
            .provider-header p {
                color: #6b7280;
                font-size: 16px;
            }
            
            .provider-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 24px;
                margin-bottom: 40px;
            }
            
            .provider-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                padding: 32px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .provider-card:hover {
                border-color: #6366f1;
                transform: translateY(-4px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .provider-card.gmail:hover {
                border-color: #4285f4;
            }
            
            .provider-card.outlook:hover {
                border-color: #0078d4;
            }
            
            .provider-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                border-radius: 20px;
                background: #f3f4f6;
            }
            
            .provider-card.gmail .provider-icon {
                background: #4285f420;
                color: #4285f4;
            }
            
            .provider-card.outlook .provider-icon {
                background: #0078d420;
                color: #0078d4;
            }
            
            .provider-card h3 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
            }
            
            .provider-card p {
                color: #6b7280;
                margin-bottom: 20px;
            }
            
            .provider-features {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 24px;
            }
            
            .provider-features span {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #4b5563;
                font-size: 14px;
            }
            
            .provider-features i {
                color: #10b981;
                width: 16px;
            }
            
            .btn-select-provider {
                width: 100%;
                padding: 12px 24px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .provider-card.gmail .btn-select-provider {
                background: #4285f4;
            }
            
            .provider-card.outlook .btn-select-provider {
                background: #0078d4;
            }
            
            .btn-select-provider:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .provider-info {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                color: #6b7280;
                font-size: 14px;
                background: #f9fafb;
                padding: 16px;
                border-radius: 8px;
            }
            
            .provider-info i {
                font-size: 20px;
                color: #10b981;
            }
            
            /* Auth Required */
            .scan-auth-required {
                max-width: 500px;
                margin: 60px auto;
                text-align: center;
                padding: 20px;
            }
            
            .auth-icon {
                font-size: 64px;
                margin-bottom: 24px;
            }
            
            .scan-auth-required h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
            }
            
            .scan-auth-required p {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 32px;
            }
            
            .btn-auth-primary {
                width: 100%;
                padding: 14px 28px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 12px;
            }
            
            .btn-auth-primary:hover {
                background: #5558e3;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }
            
            .btn-auth-secondary {
                width: 100%;
                padding: 12px 24px;
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .btn-auth-secondary:hover {
                background: #e5e7eb;
            }
            
            .auth-info {
                margin-top: 40px;
                text-align: left;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 24px;
            }
            
            .auth-info h4 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
            }
            
            .auth-info ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .auth-info li {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                color: #4b5563;
                margin-bottom: 12px;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .auth-info li:last-child {
                margin-bottom: 0;
            }
            
            .auth-info li i {
                color: #10b981;
                margin-top: 2px;
                flex-shrink: 0;
            }
            
            /* Scan Interface */
            .scan-header {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .provider-info {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .provider-badge {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
            }
            
            .provider-info h3 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
            }
            
            .provider-account {
                color: #6b7280;
                font-size: 14px;
                margin: 0;
            }
            
            .btn-logout {
                padding: 10px 20px;
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
                gap: 8px;
            }
            
            .btn-logout:hover {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            /* Scan Options */
            .scan-options {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .scan-options h4 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            
            .option-group {
                margin-bottom: 20px;
            }
            
            .option-group label {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
            }
            
            .option-group label i {
                color: #6b7280;
                width: 16px;
            }
            
            .option-select {
                width: 100%;
                padding: 10px 16px;
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
                background: #f3f4f6;
            }
            
            .option-select:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .option-toggles {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 24px;
            }
            
            .toggle-option {
                display: flex;
                align-items: center;
                cursor: pointer;
                position: relative;
                padding-left: 52px;
                font-size: 14px;
                color: #374151;
                user-select: none;
            }
            
            .toggle-option input {
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
            
            .toggle-option input:checked + .toggle-slider {
                background: #6366f1;
            }
            
            .toggle-option input:checked + .toggle-slider::after {
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
            
            /* Scan Actions */
            .scan-actions {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .btn-start-scan {
                padding: 14px 32px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }
            
            .btn-start-scan:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
            }
            
            .btn-start-scan:disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            /* Progress */
            .scan-progress {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .progress-header h4 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }
            
            .btn-cancel {
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
            
            .btn-cancel:hover {
                background: #fee2e2;
                border-color: #fca5a5;
            }
            
            .progress-bar {
                height: 8px;
                background: #f3f4f6;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
                border-radius: 4px;
                transition: width 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .progress-fill::after {
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
            
            .progress-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
            }
            
            #progressMessage {
                color: #6b7280;
            }
            
            #progressStats {
                color: #374151;
                font-weight: 600;
            }
            
            /* Results */
            .results-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                flex-wrap: wrap;
                gap: 16px;
            }
            
            .results-header h3 {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
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
                gap: 12px;
            }
            
            .btn-export,
            .btn-view-emails {
                padding: 10px 20px;
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
                gap: 8px;
            }
            
            .btn-export:hover {
                background: #e5e7eb;
            }
            
            .btn-view-emails {
                background: #6366f1;
                color: white;
                border-color: #6366f1;
            }
            
            .btn-view-emails:hover {
                background: #5558e3;
                border-color: #5558e3;
            }
            
            .results-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 32px;
            }
            
            .summary-card {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .summary-icon {
                font-size: 32px;
                flex-shrink: 0;
            }
            
            .summary-content h4 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 4px 0;
            }
            
            .summary-content p {
                color: #6b7280;
                font-size: 14px;
                margin: 0;
            }
            
            .results-breakdown {
                margin-bottom: 24px;
            }
            
            .results-breakdown h4 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
            }
            
            .category-breakdown {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .category-item {
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
            
            .category-stats {
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
            
            .no-data {
                text-align: center;
                color: #9ca3af;
                font-style: italic;
                padding: 20px;
            }
            
            .results-ai {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ai-badge {
                background: #0ea5e9;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .results-ai p {
                margin: 0;
                color: #0c4a6e;
                font-size: 14px;
            }
            
            .results-footer {
                text-align: center;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
            }
            
            .btn-new-scan {
                padding: 12px 24px;
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-new-scan:hover {
                background: #e5e7eb;
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
                .scan-interface {
                    padding: 12px;
                }
                
                .scan-header {
                    flex-direction: column;
                    gap: 16px;
                    align-items: flex-start;
                }
                
                .btn-logout {
                    width: 100%;
                    justify-content: center;
                }
                
                .provider-cards {
                    grid-template-columns: 1fr;
                }
                
                .results-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .results-actions {
                    width: 100%;
                }
                
                .btn-export,
                .btn-view-emails {
                    flex: 1;
                    justify-content: center;
                }
                
                .results-summary {
                    grid-template-columns: 1fr;
                }
                
                .category-item {
                    flex-wrap: wrap;
                }
                
                .category-stats {
                    width: 100%;
                }
            }
            
            @media (max-width: 480px) {
                .provider-card {
                    padding: 24px;
                }
                
                .provider-icon {
                    width: 60px;
                    height: 60px;
                    font-size: 36px;
                }
                
                .auth-info {
                    padding: 16px;
                }
                
                .scan-options {
                    padding: 16px;
                }
                
                .results-container {
                    padding: 16px;
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
if (window.unifiedScanModule) {
    console.log('[StartScan] 🔄 Cleaning up old instance...');
}

// Créer la nouvelle instance
window.unifiedScanModule = new UnifiedScanModule();
window.scanStartModule = window.unifiedScanModule; // Alias pour compatibilité

// Export des méthodes de test
window.testUnifiedScan = function() {
    console.group('🧪 TEST UnifiedScan v30.0');
    
    console.log('Current Provider:', window.unifiedScanModule.currentProvider);
    console.log('Is Authenticated:', window.unifiedScanModule.isAuthenticated);
    console.log('Providers:', window.unifiedScanModule.providers);
    console.log('User Settings:', window.unifiedScanModule.userSettings);
    console.log('Scan Metrics:', window.unifiedScanModule.scanMetrics);
    
    console.groupEnd();
    return { success: true };
};

console.log('✅ StartScan v30.0 loaded - Unified Gmail/Outlook Scanner!');
