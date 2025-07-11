// startscan.js - Scan unifié des emails avec gestion robuste du chargement
console.log('[UnifiedScan] Chargement du module startscan.js');

class UnifiedScan {
    constructor() {
        this.categoryManager = null;
        this.emails = [];
        this.scanResults = [];
        this.currentBatch = 0;
        this.batchSize = 50;
        this.isScanning = false;
        this.isPaused = false;
        this.scanProgress = 0;
        this.selectedCategories = new Set();
        this.scanStats = {
            total: 0,
            scanned: 0,
            categorized: 0,
            errors: 0,
            startTime: null,
            endTime: null
        };
        
        // Configuration IndexedDB pour stocker les résultats
        this.dbName = 'GmailScanDB';
        this.dbVersion = 1;
        this.db = null;
        
        // État d'initialisation
        this.isInitialized = false;
        this.initError = null;
    }

    // Vérifier les dépendances
    checkDependencies() {
        const missing = [];
        
        if (!window.categoryManager) {
            missing.push('CategoryManager');
        }
        
        if (!window.chrome || !window.chrome.runtime || !window.chrome.runtime.sendMessage) {
            console.warn('[UnifiedScan] API Chrome non disponible, mode simulation activé');
            this.setupMockChromeAPI();
        }
        
        return missing;
    }

    // Configuration d'une API Chrome simulée pour les tests
    setupMockChromeAPI() {
        if (!window.chrome) {
            window.chrome = {};
        }
        
        if (!window.chrome.runtime) {
            window.chrome.runtime = {
                sendMessage: (message, callback) => {
                    console.log('[UnifiedScan] Mock Chrome API - Message:', message);
                    
                    setTimeout(() => {
                        if (message.action === 'getEmails') {
                            // Simuler des emails pour les tests
                            const mockEmails = [];
                            const senders = ['noreply@google.com', 'security@facebook.com', 'billing@netflix.com', 'team@slack.com', 'support@amazon.com'];
                            const subjects = [
                                'Alerte de sécurité sur votre compte',
                                'Votre facture mensuelle',
                                'Invitation à une réunion',
                                'Nouvelle promotion disponible',
                                'Mise à jour importante'
                            ];
                            
                            for (let i = 0; i < 100; i++) {
                                mockEmails.push({
                                    id: `mock_email_${i}`,
                                    threadId: `mock_thread_${i}`,
                                    from: senders[i % senders.length],
                                    subject: subjects[i % subjects.length] + ` #${i}`,
                                    snippet: `Ceci est le contenu de l'email de test numéro ${i}. Lorem ipsum dolor sit amet...`,
                                    date: new Date(Date.now() - i * 3600000).toISOString(),
                                    labelIds: Math.random() > 0.7 ? ['UNREAD'] : []
                                });
                            }
                            
                            callback({ emails: mockEmails });
                        } else {
                            callback({ success: true });
                        }
                    }, 500);
                }
            };
        }
    }

    // Initialiser IndexedDB
    async initIndexedDB() {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                
                request.onerror = () => {
                    console.error('[UnifiedScan] Erreur IndexedDB:', request.error);
                    this.useMemoryOnly = true;
                    resolve(false);
                };
                
                request.onsuccess = () => {
                    this.db = request.result;
                    console.log('[UnifiedScan] ✅ IndexedDB initialisé');
                    resolve(true);
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    if (!db.objectStoreNames.contains('scanResults')) {
                        const scanStore = db.createObjectStore('scanResults', { keyPath: 'emailId' });
                        scanStore.createIndex('category', 'category', { unique: false });
                        scanStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                    
                    if (!db.objectStoreNames.contains('scanSessions')) {
                        db.createObjectStore('scanSessions', { 
                            keyPath: 'sessionId',
                            autoIncrement: true 
                        });
                    }
                };
            } catch (error) {
                console.error('[UnifiedScan] Erreur init IndexedDB:', error);
                this.useMemoryOnly = true;
                resolve(false);
            }
        });
    }

    // Initialiser le scan
    async initialize() {
        console.log('[UnifiedScan] 🚀 Début de l\'initialisation...');
        
        try {
            // Vérifier les dépendances
            const missing = this.checkDependencies();
            if (missing.length > 0) {
                throw new Error(`Dépendances manquantes: ${missing.join(', ')}`);
            }
            
            // Récupérer le CategoryManager
            this.categoryManager = window.categoryManager;
            
            // Initialiser la base de données
            await this.initIndexedDB();
            
            // Charger les catégories pré-sélectionnées
            await this.loadPreselectedCategories();
            
            // Rendre l'interface
            this.render();
            
            // Configurer les interactions
            this.setupInteractions();
            
            // Marquer comme initialisé
            this.isInitialized = true;
            
            console.log('[UnifiedScan] ✅ Initialisation terminée avec succès');
            
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur d\'initialisation:', error);
            this.initError = error;
            this.renderError(error);
            throw error;
        }
    }

    // Charger les catégories pré-sélectionnées
    async loadPreselectedCategories() {
        try {
            if (this.categoryManager && this.categoryManager.loadSettings) {
                const settings = await this.categoryManager.loadSettings();
                if (settings && settings.selectedCategories) {
                    this.selectedCategories = new Set(settings.selectedCategories);
                    console.log('[UnifiedScan] ✅ Catégories chargées:', Array.from(this.selectedCategories));
                }
            }
            
            // Catégories par défaut si aucune n'est sélectionnée
            if (this.selectedCategories.size === 0) {
                this.selectedCategories = new Set(['important', 'security', 'finance', 'commercial']);
                console.log('[UnifiedScan] 📌 Catégories par défaut appliquées');
            }
            
        } catch (error) {
            console.error('[UnifiedScan] Erreur chargement catégories:', error);
            // Continuer avec les catégories par défaut
            this.selectedCategories = new Set(['important', 'security', 'finance', 'commercial']);
        }
    }

    // Afficher une erreur
    renderError(error) {
        const container = document.querySelector('.container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="max-width: 600px; margin: 50px auto; text-align: center; padding: 20px;">
                <div style="color: #d32f2f; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px;"></i>
                </div>
                <h2 style="color: #d32f2f; margin-bottom: 10px;">Erreur d'initialisation</h2>
                <p style="color: #666; margin-bottom: 20px;">${error.message}</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: left; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px;">Dépannage :</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Vérifiez que tous les composants sont chargés</li>
                        <li>Rechargez la page (Ctrl+F5)</li>
                        <li>Consultez la console pour plus de détails</li>
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-sync"></i> Recharger la page
                </button>
            </div>
        `;
    }

    // Rendre l'interface
    render() {
        const container = document.querySelector('.container');
        if (!container) {
            console.error('[UnifiedScan] Container .container non trouvé');
            return;
        }

        container.innerHTML = `
            <div class="unified-scan">
                <div class="scan-header">
                    <h1>🔍 Scan Unifié des Emails</h1>
                    <p class="scan-description">
                        Analysez et catégorisez automatiquement vos emails Gmail
                    </p>
                </div>

                <div class="scan-controls">
                    <div class="categories-selection">
                        <h3>📂 Catégories à analyser</h3>
                        <div class="categories-grid">
                            ${this.renderCategoryCheckboxes()}
                        </div>
                        <div style="margin-top: 10px;">
                            <button class="btn btn-sm" onclick="unifiedScan.selectAllCategories()">
                                Tout sélectionner
                            </button>
                            <button class="btn btn-sm" onclick="unifiedScan.deselectAllCategories()">
                                Tout désélectionner
                            </button>
                        </div>
                    </div>

                    <div class="scan-options">
                        <h3>⚙️ Options</h3>
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="autoArchive"> 
                                Archiver automatiquement les emails catégorisés
                            </label>
                        </div>
                        <div class="option-group">
                            <label>
                                Nombre d'emails à scanner :
                                <select id="scanLimit">
                                    <option value="50">50 emails</option>
                                    <option value="100">100 emails</option>
                                    <option value="500" selected>500 emails</option>
                                    <option value="1000">1000 emails</option>
                                    <option value="5000">5000 emails</option>
                                </select>
                            </label>
                        </div>
                        <div class="option-group">
                            <label>
                                Taille des lots :
                                <select id="batchSize">
                                    <option value="10">10 emails/lot</option>
                                    <option value="25">25 emails/lot</option>
                                    <option value="50" selected>50 emails/lot</option>
                                    <option value="100">100 emails/lot</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div class="scan-actions">
                        <button class="btn btn-primary btn-large" id="startScan">
                            <i class="fas fa-play"></i> Démarrer le scan
                        </button>
                        <button class="btn btn-secondary btn-large" id="pauseScan" style="display: none;">
                            <i class="fas fa-pause"></i> Pause
                        </button>
                        <button class="btn btn-danger btn-large" id="stopScan" style="display: none;">
                            <i class="fas fa-stop"></i> Arrêter
                        </button>
                    </div>
                </div>

                <div class="scan-progress-section" style="display: none;">
                    <div class="progress-info">
                        <span id="progressText">Préparation du scan...</span>
                        <span id="progressStats">0 / 0</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="scan-details">
                        <span id="scanSpeed"></span>
                        <span id="scanETA"></span>
                    </div>
                </div>

                <div class="scan-results" style="display: none;">
                    <h3>📊 Résultats du scan</h3>
                    <div class="results-summary" id="resultsSummary"></div>
                    <div class="results-details" id="resultsDetails"></div>
                </div>

                <div class="scan-logs">
                    <div class="logs-header">
                        <h3>📝 Journal d'activité</h3>
                        <button class="btn btn-sm" onclick="unifiedScan.clearLogs()">
                            <i class="fas fa-trash"></i> Effacer
                        </button>
                    </div>
                    <div class="logs-container" id="logsContainer"></div>
                </div>
            </div>
        `;

        // Ajouter les styles CSS
        this.injectStyles();
        
        this.addLog('Interface chargée', 'success');
    }

    // Injecter les styles CSS
    injectStyles() {
        if (document.getElementById('unifiedScanStyles')) return;
        
        const styles = `
            .unified-scan {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .scan-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .scan-header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                color: #333;
            }

            .scan-description {
                color: #666;
                font-size: 1.1em;
            }

            .scan-controls {
                background: #fff;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .categories-selection {
                margin-bottom: 30px;
            }

            .categories-selection h3 {
                margin-bottom: 15px;
                color: #333;
            }

            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                margin-bottom: 15px;
            }

            .category-checkbox {
                display: flex;
                align-items: center;
                padding: 12px;
                background: #f5f5f5;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }

            .category-checkbox:hover {
                background: #e8e8e8;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }

            .category-checkbox input[type="checkbox"] {
                margin-right: 10px;
                cursor: pointer;
            }

            .category-checkbox input[type="checkbox"]:checked + span {
                font-weight: 600;
                color: #1976d2;
            }

            .scan-options {
                margin-bottom: 30px;
            }

            .scan-options h3 {
                margin-bottom: 15px;
                color: #333;
            }

            .option-group {
                margin-bottom: 15px;
            }

            .option-group label {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
            }

            .option-group select {
                padding: 5px 10px;
                border-radius: 5px;
                border: 1px solid #ddd;
                background: #fff;
                cursor: pointer;
            }

            .scan-actions {
                text-align: center;
                margin: 20px 0;
            }

            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                margin: 0 5px;
            }

            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .btn:active {
                transform: translateY(0);
            }

            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
            }

            .btn-primary {
                background: #1976d2;
                color: white;
            }

            .btn-primary:hover {
                background: #1565c0;
            }

            .btn-secondary {
                background: #757575;
                color: white;
            }

            .btn-secondary:hover {
                background: #616161;
            }

            .btn-danger {
                background: #d32f2f;
                color: white;
            }

            .btn-danger:hover {
                background: #c62828;
            }

            .btn-sm {
                padding: 5px 15px;
                font-size: 14px;
            }

            .btn-large {
                padding: 15px 30px;
                font-size: 18px;
            }

            .scan-progress-section {
                background: #fff;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .progress-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-weight: 600;
            }

            .progress-bar {
                height: 30px;
                background: #e0e0e0;
                border-radius: 15px;
                overflow: hidden;
                position: relative;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                width: 0%;
                transition: width 0.5s ease;
                position: relative;
            }

            .progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    45deg,
                    rgba(255,255,255,.2) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255,255,255,.2) 50%,
                    rgba(255,255,255,.2) 75%,
                    transparent 75%,
                    transparent
                );
                background-size: 40px 40px;
                animation: progress-stripes 1s linear infinite;
            }

            @keyframes progress-stripes {
                0% { background-position: 0 0; }
                100% { background-position: 40px 0; }
            }

            .scan-details {
                display: flex;
                justify-content: space-between;
                margin-top: 10px;
                font-size: 14px;
                color: #666;
            }

            .scan-results {
                background: #fff;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .results-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }

            .summary-card {
                background: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                transition: transform 0.3s ease;
            }

            .summary-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }

            .summary-card i {
                font-size: 30px;
                margin-bottom: 10px;
                display: block;
            }

            .summary-value {
                font-size: 28px;
                font-weight: bold;
                color: #333;
            }

            .summary-label {
                font-size: 14px;
                color: #666;
                margin-top: 5px;
            }

            .category-results {
                margin: 20px 0;
            }

            .category-result-item {
                display: flex;
                align-items: center;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 8px;
                margin-bottom: 10px;
            }

            .category-label {
                flex: 1;
                font-weight: 600;
            }

            .category-count {
                margin: 0 20px;
                color: #666;
            }

            .category-bar {
                width: 200px;
                height: 20px;
                background: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
            }

            .category-bar-fill {
                height: 100%;
                background: #4CAF50;
                transition: width 0.5s ease;
            }

            .scan-logs {
                background: #fff;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .logs-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .logs-header h3 {
                margin: 0;
                color: #333;
            }

            .logs-container {
                max-height: 300px;
                overflow-y: auto;
                background: #f5f5f5;
                border-radius: 8px;
                padding: 10px;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 13px;
            }

            .log-entry {
                display: flex;
                gap: 10px;
                padding: 5px 10px;
                margin-bottom: 3px;
                border-radius: 4px;
                background: rgba(255,255,255,0.8);
            }

            .log-time {
                color: #666;
                min-width: 80px;
            }

            .log-message {
                flex: 1;
            }

            .log-info { background: #e3f2fd; color: #1976d2; }
            .log-success { background: #e8f5e9; color: #388e3c; }
            .log-warning { background: #fff3e0; color: #f57c00; }
            .log-error { background: #ffebee; color: #d32f2f; }
            .log-skip { background: #f5f5f5; color: #757575; }

            /* Toast notifications */
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 6px;
                background: #333;
                color: white;
                display: flex;
                align-items: center;
                gap: 10px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                z-index: 10000;
                max-width: 350px;
            }

            .toast.show {
                transform: translateX(0);
            }

            .toast.success { background: #4caf50; }
            .toast.error { background: #f44336; }
            .toast.warning { background: #ff9800; }
            .toast.info { background: #2196f3; }

            /* Modal styles */
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .modal-content {
                background: white;
                border-radius: 10px;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e0e0e0;
            }

            .modal-header h2 {
                margin: 0;
                color: #333;
            }

            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }

            .close-modal {
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .close-modal:hover {
                background: #f5f5f5;
                color: #333;
            }

            .results-table {
                width: 100%;
                border-collapse: collapse;
            }

            .results-table th,
            .results-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }

            .results-table th {
                background: #f5f5f5;
                font-weight: 600;
                color: #333;
            }

            .results-table tr:hover {
                background: #f9f9f9;
            }

            .category-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                background: #e0e0e0;
                color: #333;
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .categories-grid {
                    grid-template-columns: 1fr;
                }
                
                .scan-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .btn-large {
                    width: 100%;
                }
                
                .results-summary {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'unifiedScanStyles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Rendre les cases à cocher des catégories
    renderCategoryCheckboxes() {
        const categories = [
            { id: 'important', label: '⭐ Important', color: '#ff4444' },
            { id: 'security', label: '🔒 Sécurité', color: '#ff9800' },
            { id: 'finance', label: '💰 Finance', color: '#4caf50' },
            { id: 'commercial', label: '🛍️ Commercial', color: '#2196f3' },
            { id: 'social', label: '👥 Social', color: '#9c27b0' },
            { id: 'meetings', label: '📅 Réunions', color: '#00bcd4' },
            { id: 'marketing_news', label: '📰 Marketing/News', color: '#795548' },
            { id: 'other', label: '📁 Autres', color: '#607d8b' }
        ];

        return categories.map(cat => `
            <label class="category-checkbox" style="--category-color: ${cat.color}">
                <input type="checkbox" value="${cat.id}" 
                    ${this.selectedCategories.has(cat.id) ? 'checked' : ''}>
                <span>${cat.label}</span>
            </label>
        `).join('');
    }

    // Sélectionner toutes les catégories
    selectAllCategories() {
        document.querySelectorAll('.category-checkbox input').forEach(cb => {
            cb.checked = true;
            this.selectedCategories.add(cb.value);
        });
        this.saveSelectedCategories();
    }

    // Désélectionner toutes les catégories
    deselectAllCategories() {
        document.querySelectorAll('.category-checkbox input').forEach(cb => {
            cb.checked = false;
        });
        this.selectedCategories.clear();
        this.saveSelectedCategories();
    }

    // Effacer les logs
    clearLogs() {
        const logsContainer = document.getElementById('logsContainer');
        if (logsContainer) {
            logsContainer.innerHTML = '';
        }
    }

    // Configurer les interactions
    setupInteractions() {
        // Sélection des catégories
        document.querySelectorAll('.category-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedCategories.add(e.target.value);
                } else {
                    this.selectedCategories.delete(e.target.value);
                }
                this.saveSelectedCategories();
            });
        });

        // Boutons de contrôle
        document.getElementById('startScan')?.addEventListener('click', () => this.startScan());
        document.getElementById('pauseScan')?.addEventListener('click', () => this.pauseScan());
        document.getElementById('stopScan')?.addEventListener('click', () => this.stopScan());

        // Options
        document.getElementById('batchSize')?.addEventListener('change', (e) => {
            this.batchSize = parseInt(e.target.value);
            this.addLog(`Taille des lots changée: ${this.batchSize} emails/lot`, 'info');
        });
    }

    // Sauvegarder les catégories sélectionnées
    async saveSelectedCategories() {
        try {
            if (this.categoryManager && this.categoryManager.saveSettings) {
                await this.categoryManager.saveSettings({
                    selectedCategories: Array.from(this.selectedCategories)
                });
            }
        } catch (error) {
            console.error('[UnifiedScan] Erreur sauvegarde catégories:', error);
        }
    }

    // Démarrer le scan
    async startScan() {
        if (this.selectedCategories.size === 0) {
            this.showError('Veuillez sélectionner au moins une catégorie');
            return;
        }

        console.log('[UnifiedScan] 🚀 Démarrage du scan...');
        this.addLog('Démarrage du scan...', 'info');

        // Réinitialiser les statistiques
        this.scanStats = {
            total: 0,
            scanned: 0,
            categorized: 0,
            errors: 0,
            startTime: Date.now(),
            endTime: null
        };

        // Réinitialiser l'état
        this.isScanning = true;
        this.isPaused = false;
        this.scanProgress = 0;
        this.currentBatch = 0;
        this.scanResults = [];

        // Mettre à jour l'interface
        this.updateUI('scanning');

        try {
            // Récupérer la limite d'emails
            const scanLimit = parseInt(document.getElementById('scanLimit').value);
            
            // Récupérer les emails
            await this.fetchEmails(scanLimit);
            
            // Démarrer le processus de scan
            await this.processScan();
            
        } catch (error) {
            console.error('[UnifiedScan] Erreur:', error);
            this.addLog(`Erreur: ${error.message}`, 'error');
            this.stopScan();
        }
    }

    // Récupérer les emails
    async fetchEmails(limit) {
        this.addLog(`Récupération de ${limit} emails...`, 'info');
        
        try {
            const response = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout lors de la récupération des emails'));
                }, 30000);

                chrome.runtime.sendMessage(
                    { 
                        action: "getEmails", 
                        maxResults: limit 
                    },
                    (response) => {
                        clearTimeout(timeout);
                        resolve(response);
                    }
                );
            });

            if (response.error) {
                throw new Error(response.error);
            }

            this.emails = response.emails || [];
            this.scanStats.total = this.emails.length;
            
            this.addLog(`✅ ${this.emails.length} emails récupérés`, 'success');
            
        } catch (error) {
            throw new Error(`Impossible de récupérer les emails: ${error.message}`);
        }
    }

    // Traiter le scan
    async processScan() {
        const autoArchive = document.getElementById('autoArchive').checked;
        
        while (this.currentBatch * this.batchSize < this.emails.length && this.isScanning) {
            if (this.isPaused) {
                await this.waitForResume();
            }

            const start = this.currentBatch * this.batchSize;
            const end = Math.min(start + this.batchSize, this.emails.length);
            const batch = this.emails.slice(start, end);

            this.addLog(`Traitement du lot ${this.currentBatch + 1} (emails ${start + 1} à ${end})`, 'info');

            // Traiter le lot
            await this.processBatch(batch, autoArchive);

            this.currentBatch++;
            
            // Pause entre les lots
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Scan terminé
        this.scanStats.endTime = Date.now();
        this.completeScan();
    }

    // Traiter un lot d'emails
    async processBatch(batch, autoArchive) {
        const results = [];
        
        for (const email of batch) {
            if (!this.isScanning) break;
            
            try {
                // Préparer les données pour la catégorisation
                const emailData = {
                    from: this.extractEmailAddress(email.from),
                    subject: email.subject || '',
                    snippet: email.snippet || ''
                };

                // Catégoriser l'email
                const result = await this.categoryManager.categorizeEmail(emailData);
                
                // Vérifier si la catégorie est sélectionnée
                if (result && this.selectedCategories.has(result.category)) {
                    const scanResult = {
                        emailId: email.id,
                        threadId: email.threadId,
                        from: emailData.from,
                        subject: emailData.subject,
                        category: result.category,
                        confidence: result.confidence || 0,
                        timestamp: Date.now()
                    };
                    
                    results.push(scanResult);
                    this.scanResults.push(scanResult);
                    this.scanStats.categorized++;
                    
                    // Archiver si demandé
                    if (autoArchive && !email.id.startsWith('mock_')) {
                        await this.archiveEmail(email.id);
                    }
                    
                    const confidence = Math.round(result.confidence * 100);
                    this.addLog(
                        `✅ "${emailData.subject}" → ${result.category} (${confidence}%)`, 
                        'success'
                    );
                } else {
                    this.addLog(`⏭️ Email ignoré (catégorie non sélectionnée)`, 'skip');
                }
                
            } catch (error) {
                console.error('[UnifiedScan] Erreur traitement email:', error);
                this.scanStats.errors++;
                this.addLog(`❌ Erreur: ${error.message}`, 'error');
            }
            
            // Mettre à jour la progression
            this.scanStats.scanned++;
            this.updateProgress();
            
            // Pause entre les emails
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Sauvegarder les résultats du lot
        if (results.length > 0 && this.db) {
            await this.saveScanResults(results);
        }
    }

    // Sauvegarder les résultats dans IndexedDB
    async saveScanResults(results) {
        if (!this.db || this.useMemoryOnly) return;
        
        try {
            const transaction = this.db.transaction(['scanResults'], 'readwrite');
            const store = transaction.objectStore('scanResults');
            
            for (const result of results) {
                await store.put(result);
            }
            
            console.log(`[UnifiedScan] 💾 ${results.length} résultats sauvegardés`);
        } catch (error) {
            console.error('[UnifiedScan] Erreur sauvegarde:', error);
        }
    }

    // Extraire l'adresse email
    extractEmailAddress(fromString) {
        if (!fromString) return 'unknown@email.com';
        const match = fromString.match(/<(.+?)>/);
        return match ? match[1] : fromString;
    }

    // Archiver un email
    async archiveEmail(emailId) {
        try {
            await new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { 
                        action: "archiveEmail", 
                        emailId: emailId 
                    },
                    resolve
                );
            });
        } catch (error) {
            console.error('[UnifiedScan] Erreur archivage:', error);
        }
    }

    // Mettre en pause le scan
    pauseScan() {
        this.isPaused = true;
        this.updateUI('paused');
        this.addLog('⏸️ Scan mis en pause', 'info');
    }

    // Attendre la reprise
    waitForResume() {
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (!this.isPaused || !this.isScanning) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    // Arrêter le scan
    stopScan() {
        this.isScanning = false;
        this.isPaused = false;
        this.updateUI('stopped');
        this.addLog('⏹️ Scan arrêté', 'warning');
        
        if (this.scanStats.scanned > 0) {
            this.showResults();
        }
    }

    // Terminer le scan
    completeScan() {
        this.isScanning = false;
        this.updateUI('completed');
        this.addLog('✅ Scan terminé !', 'success');
        this.showResults();
        
        // Notification
        this.showSuccess(`Scan terminé ! ${this.scanStats.categorized} emails catégorisés`);
    }

    // Mettre à jour la progression
    updateProgress() {
        this.scanProgress = (this.scanStats.scanned / this.scanStats.total) * 100;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressStats = document.getElementById('progressStats');
        const scanSpeed = document.getElementById('scanSpeed');
        const scanETA = document.getElementById('scanETA');
        
        if (progressFill) {
            progressFill.style.width = `${this.scanProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Scan en cours... ${Math.round(this.scanProgress)}%`;
        }
        
        if (progressStats) {
            progressStats.textContent = `${this.scanStats.scanned} / ${this.scanStats.total}`;
        }
        
        // Calculer la vitesse et l'ETA
        if (scanSpeed && scanETA && this.scanStats.startTime) {
            const elapsed = (Date.now() - this.scanStats.startTime) / 1000;
            const speed = this.scanStats.scanned / elapsed;
            const remaining = (this.scanStats.total - this.scanStats.scanned) / speed;
            
            scanSpeed.textContent = `Vitesse: ${speed.toFixed(1)} emails/s`;
            scanETA.textContent = `Temps restant: ${this.formatTime(remaining)}`;
        }
    }

    // Formater le temps
    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.round(seconds % 60);
            return `${minutes}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.round((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }

    // Afficher les résultats
    showResults() {
        const resultsSection = document.querySelector('.scan-results');
        const summaryDiv = document.getElementById('resultsSummary');
        const detailsDiv = document.getElementById('resultsDetails');
        
        if (!resultsSection) return;
        
        resultsSection.style.display = 'block';
        
        // Calculer les statistiques par catégorie
        const categoryStats = {};
        this.scanResults.forEach(result => {
            categoryStats[result.category] = (categoryStats[result.category] || 0) + 1;
        });
        
        // Durée totale
        const duration = this.scanStats.endTime ? 
            (this.scanStats.endTime - this.scanStats.startTime) / 1000 : 0;
        
        // Résumé
        summaryDiv.innerHTML = `
            <div class="summary-card">
                <i class="fas fa-envelope" style="color: #2196f3;"></i>
                <div class="summary-value">${this.scanStats.scanned}</div>
                <div class="summary-label">Emails scannés</div>
            </div>
            <div class="summary-card">
                <i class="fas fa-tags" style="color: #4caf50;"></i>
                <div class="summary-value">${this.scanStats.categorized}</div>
                <div class="summary-label">Catégorisés</div>
            </div>
            <div class="summary-card">
                <i class="fas fa-clock" style="color: #ff9800;"></i>
                <div class="summary-value">${this.formatTime(duration)}</div>
                <div class="summary-label">Durée totale</div>
            </div>
            <div class="summary-card">
                <i class="fas fa-exclamation-triangle" style="color: #f44336;"></i>
                <div class="summary-value">${this.scanStats.errors}</div>
                <div class="summary-label">Erreurs</div>
            </div>
        `;
        
        // Détails par catégorie
        const categoryLabels = {
            important: '⭐ Important',
            security: '🔒 Sécurité',
            finance: '💰 Finance',
            commercial: '🛍️ Commercial',
            social: '👥 Social',
            meetings: '📅 Réunions',
            marketing_news: '📰 Marketing/News',
            other: '📁 Autres'
        };
        
        detailsDiv.innerHTML = `
            <h4>Répartition par catégorie :</h4>
            <div class="category-results">
                ${Object.entries(categoryStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                        const percentage = this.scanStats.categorized > 0 
                            ? (count / this.scanStats.categorized * 100).toFixed(1)
                            : 0;
                        return `
                            <div class="category-result-item">
                                <span class="category-label">${categoryLabels[category] || category}</span>
                                <span class="category-count">${count} emails</span>
                                <div class="category-bar">
                                    <div class="category-bar-fill" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
            </div>
            
            <div class="results-actions" style="margin-top: 20px; text-align: center;">
                <button class="btn btn-primary" onclick="unifiedScan.exportResults()">
                    <i class="fas fa-download"></i> Exporter CSV
                </button>
                <button class="btn btn-secondary" onclick="unifiedScan.showDetailedResults()">
                    <i class="fas fa-eye"></i> Voir les détails
                </button>
            </div>
        `;
    }

    // Exporter les résultats
    exportResults() {
        const csv = this.convertToCSV(this.scanResults);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Résultats exportés !');
    }

    // Convertir en CSV
    convertToCSV(data) {
        const headers = ['Email ID', 'De', 'Objet', 'Catégorie', 'Confiance', 'Date'];
        const rows = data.map(item => [
            item.emailId,
            item.from,
            `"${item.subject.replace(/"/g, '""')}"`,
            item.category,
            Math.round(item.confidence * 100) + '%',
            new Date(item.timestamp).toLocaleString('fr-FR')
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Afficher les résultats détaillés
    showDetailedResults() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Résultats détaillés du scan</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>De</th>
                                <th>Objet</th>
                                <th>Catégorie</th>
                                <th>Confiance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.scanResults.slice(0, 100).map(result => `
                                <tr>
                                    <td>${this.truncate(result.from, 30)}</td>
                                    <td>${this.truncate(result.subject, 50)}</td>
                                    <td><span class="category-badge">${result.category}</span></td>
                                    <td>${Math.round(result.confidence * 100)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${this.scanResults.length > 100 ? 
                        '<p style="text-align: center; color: #666; margin-top: 10px;">Affichage limité aux 100 premiers résultats</p>' 
                        : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer la modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Tronquer le texte
    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    // Mettre à jour l'interface
    updateUI(state) {
        const startBtn = document.getElementById('startScan');
        const pauseBtn = document.getElementById('pauseScan');
        const stopBtn = document.getElementById('stopScan');
        const progressSection = document.querySelector('.scan-progress-section');
        
        switch (state) {
            case 'scanning':
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-flex';
                stopBtn.style.display = 'inline-flex';
                progressSection.style.display = 'block';
                break;
                
            case 'paused':
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Reprendre';
                pauseBtn.onclick = () => {
                    this.isPaused = false;
                    this.updateUI('scanning');
                    this.addLog('▶️ Scan repris', 'info');
                };
                break;
                
            case 'stopped':
            case 'completed':
                startBtn.style.display = 'inline-flex';
                pauseBtn.style.display = 'none';
                stopBtn.style.display = 'none';
                if (state === 'stopped') {
                    progressSection.style.display = 'none';
                }
                break;
        }
    }

    // Ajouter un log
    addLog(message, type = 'info') {
        const logsContainer = document.getElementById('logsContainer');
        if (!logsContainer) return;
        
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `
            <span class="log-time">${timestamp}</span>
            <span class="log-message">${message}</span>
        `;
        
        logsContainer.insertBefore(logEntry, logsContainer.firstChild);
        
        // Limiter le nombre de logs
        while (logsContainer.children.length > 100) {
            logsContainer.removeChild(logsContainer.lastChild);
        }
        
        // Auto-scroll
        logsContainer.scrollTop = 0;
    }

    // Afficher un toast de succès
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    // Afficher un toast d'erreur
    showError(message) {
        this.showToast(message, 'error');
    }

    // Afficher un toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 
                              'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Fonction d'initialisation globale
window.initUnifiedScan = async function() {
    console.log('[UnifiedScan] Initialisation globale appelée');
    
    try {
        // Vérifier le conteneur
        const container = document.querySelector('.container');
        if (!container) {
            console.error('[UnifiedScan] Container .container non trouvé');
            document.body.innerHTML = '<div class="container"></div>' + document.body.innerHTML;
        }
        
        // Créer et initialiser l'instance
        const unifiedScan = new UnifiedScan();
        window.unifiedScan = unifiedScan;
        
        await unifiedScan.initialize();
        
        console.log('[UnifiedScan] ✅ Initialisation réussie');
        return unifiedScan;
        
    } catch (error) {
        console.error('[UnifiedScan] ❌ Erreur d\'initialisation:', error);
        throw error;
    }
};

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('[UnifiedScan] DOM chargé, attente du CategoryManager...');
        
        // Attendre que CategoryManager soit disponible
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (window.categoryManager) {
                clearInterval(checkInterval);
                console.log('[UnifiedScan] CategoryManager détecté, initialisation...');
                window.initUnifiedScan();
            } else if (attempts > 50) {
                clearInterval(checkInterval);
                console.error('[UnifiedScan] CategoryManager non trouvé après 5 secondes');
                
                // Afficher un message d'erreur
                const container = document.querySelector('.container');
                if (container) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 50px;">
                            <h2>Erreur de chargement</h2>
                            <p>Le système de catégorisation n'est pas disponible.</p>
                            <button class="btn btn-primary" onclick="location.reload()">
                                Recharger la page
                            </button>
                        </div>
                    `;
                }
            }
        }, 100);
    });
} else {
    // DOM déjà chargé
    console.log('[UnifiedScan] DOM déjà chargé');
    
    // Si CategoryManager est déjà disponible, initialiser immédiatement
    if (window.categoryManager) {
        window.initUnifiedScan();
    } else {
        // Sinon, attendre un peu
        setTimeout(() => {
            if (window.categoryManager) {
                window.initUnifiedScan();
            } else {
                console.error('[UnifiedScan] CategoryManager non disponible');
            }
        }, 1000);
    }
}

// Exporter la classe
window.UnifiedScan = UnifiedScan;

console.log('[UnifiedScan] Module chargé et prêt');
