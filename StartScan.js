// Debug: Vérifier l'état au chargement
console.log('[UnifiedScan] Chargement du fichier startscan.js');
console.log('[UnifiedScan] CategoryManager disponible:', !!window.categoryManager);

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
        
        this.initIndexedDB();
    }

    // Initialiser IndexedDB
    async initIndexedDB() {
        try {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('[UnifiedScan] Erreur IndexedDB:', request.error);
                this.useMemoryOnly = true;
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('[UnifiedScan] ✅ IndexedDB initialisé');
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store pour les résultats de scan
                if (!db.objectStoreNames.contains('scanResults')) {
                    const scanStore = db.createObjectStore('scanResults', { keyPath: 'emailId' });
                    scanStore.createIndex('category', 'category', { unique: false });
                    scanStore.createIndex('confidence', 'confidence', { unique: false });
                    scanStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store pour les sessions de scan
                if (!db.objectStoreNames.contains('scanSessions')) {
                    db.createObjectStore('scanSessions', { keyPath: 'sessionId' });
                }
            };
        } catch (error) {
            console.error('[UnifiedScan] Erreur init IndexedDB:', error);
            this.useMemoryOnly = true;
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

    // Initialiser le scan
    async initialize() {
        console.log('[UnifiedScan] 🚀 Initialisation...');
        
        try {
            // Récupérer le CategoryManager
            this.categoryManager = window.categoryManager;
            if (!this.categoryManager) {
                throw new Error('CategoryManager non disponible');
            }

            // Charger les catégories pré-sélectionnées
            await this.loadPreselectedCategories();
            
            // Rendre l'interface
            this.render();
            
            // Configurer les interactions
            this.setupInteractions();
            
            console.log('[UnifiedScan] ✅ Initialisation terminée');
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur:', error);
            throw error;
        }
    }

    // Charger les catégories pré-sélectionnées
    async loadPreselectedCategories() {
        try {
            // Charger depuis le CategoryManager
            const settings = await this.categoryManager.loadSettings();
            if (settings && settings.selectedCategories) {
                this.selectedCategories = new Set(settings.selectedCategories);
                console.log('[UnifiedScan] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[UnifiedScan] ⭐ Catégories pré-sélectionnées:', Array.from(this.selectedCategories));
            }
            
            // Si aucune catégorie n'est sélectionnée, sélectionner les principales
            if (this.selectedCategories.size === 0) {
                this.selectedCategories = new Set(['important', 'security', 'finance', 'commercial']);
            }
        } catch (error) {
            console.error('[UnifiedScan] Erreur chargement paramètres:', error);
            // Catégories par défaut en cas d'erreur
            this.selectedCategories = new Set(['important', 'security', 'finance', 'commercial']);
        }
    }

    // Rendre l'interface
    render() {
        const container = document.querySelector('.container');
        if (!container) return;

        container.innerHTML = `
            <div class="unified-scan">
                <div class="scan-header">
                    <h1>🔍 Scan Unifié des Emails</h1>
                    <p class="scan-description">
                        Analysez et catégorisez automatiquement vos emails
                    </p>
                </div>

                <div class="scan-controls">
                    <div class="categories-selection">
                        <h3>📂 Sélectionnez les catégories à analyser</h3>
                        <div class="categories-grid">
                            ${this.renderCategoryCheckboxes()}
                        </div>
                    </div>

                    <div class="scan-options">
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="autoArchive" checked>
                                Archiver automatiquement les emails catégorisés
                            </label>
                        </div>
                        <div class="option-group">
                            <label>
                                Limite d'emails à scanner:
                                <select id="scanLimit">
                                    <option value="100">100 emails</option>
                                    <option value="500" selected>500 emails</option>
                                    <option value="1000">1000 emails</option>
                                    <option value="5000">5000 emails</option>
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
                        <span id="progressText">Scan en cours...</span>
                        <span id="progressStats">0 / 0</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="scan-speed" id="scanSpeed"></div>
                </div>

                <div class="scan-results" style="display: none;">
                    <h3>📊 Résultats du scan</h3>
                    <div class="results-summary" id="resultsSummary"></div>
                    <div class="results-details" id="resultsDetails"></div>
                </div>

                <div class="scan-logs">
                    <h3>📝 Journal d'activité</h3>
                    <div class="logs-container" id="logsContainer"></div>
                </div>
            </div>
        `;
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
            { id: 'marketing_news', label: '📰 Marketing/Actualités', color: '#795548' },
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
                
                // Sauvegarder la sélection
                this.saveSelectedCategories();
            });
        });

        // Boutons de contrôle
        document.getElementById('startScan')?.addEventListener('click', () => this.startScan());
        document.getElementById('pauseScan')?.addEventListener('click', () => this.pauseScan());
        document.getElementById('stopScan')?.addEventListener('click', () => this.stopScan());
    }

    // Sauvegarder les catégories sélectionnées
    async saveSelectedCategories() {
        try {
            if (this.categoryManager) {
                const settings = await this.categoryManager.loadSettings();
                settings.selectedCategories = Array.from(this.selectedCategories);
                await this.categoryManager.saveSettings(settings);
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
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { 
                        action: "getEmails", 
                        maxResults: limit 
                    },
                    resolve
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

            this.addLog(`Traitement du lot ${this.currentBatch + 1} (${start + 1}-${end})`, 'info');

            // Traiter le lot
            await this.processBatch(batch, autoArchive);

            this.currentBatch++;
            
            // Petite pause entre les lots
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
                    if (autoArchive) {
                        await this.archiveEmail(email.id);
                    }
                    
                    this.addLog(`✅ Email catégorisé: ${result.category} (${Math.round(result.confidence * 100)}%)`, 'success');
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
            
            // Pause entre les emails pour éviter la surcharge
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Sauvegarder les résultats du lot
        if (results.length > 0) {
            await this.saveScanResults(results);
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
    }

    // Mettre à jour la progression
    updateProgress() {
        this.scanProgress = (this.scanStats.scanned / this.scanStats.total) * 100;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressStats = document.getElementById('progressStats');
        const scanSpeed = document.getElementById('scanSpeed');
        
        if (progressFill) {
            progressFill.style.width = `${this.scanProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Scan en cours... ${Math.round(this.scanProgress)}%`;
        }
        
        if (progressStats) {
            progressStats.textContent = `${this.scanStats.scanned} / ${this.scanStats.total}`;
        }
        
        // Calculer la vitesse
        if (scanSpeed && this.scanStats.startTime) {
            const elapsed = (Date.now() - this.scanStats.startTime) / 1000; // secondes
            const speed = this.scanStats.scanned / elapsed;
            const remaining = (this.scanStats.total - this.scanStats.scanned) / speed;
            
            scanSpeed.textContent = `Vitesse: ${speed.toFixed(1)} emails/s - Temps restant: ${this.formatTime(remaining)}`;
        }
    }

    // Formater le temps
    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        } else if (seconds < 3600) {
            return `${Math.round(seconds / 60)}m`;
        } else {
            return `${Math.round(seconds / 3600)}h`;
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
            <div class="summary-grid">
                <div class="summary-card">
                    <i class="fas fa-envelope"></i>
                    <div class="summary-value">${this.scanStats.scanned}</div>
                    <div class="summary-label">Emails scannés</div>
                </div>
                <div class="summary-card">
                    <i class="fas fa-tags"></i>
                    <div class="summary-value">${this.scanStats.categorized}</div>
                    <div class="summary-label">Emails catégorisés</div>
                </div>
                <div class="summary-card">
                    <i class="fas fa-clock"></i>
                    <div class="summary-value">${this.formatTime(duration)}</div>
                    <div class="summary-label">Durée totale</div>
                </div>
                <div class="summary-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="summary-value">${this.scanStats.errors}</div>
                    <div class="summary-label">Erreurs</div>
                </div>
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
            marketing_news: '📰 Marketing/Actualités',
            other: '📁 Autres'
        };
        
        detailsDiv.innerHTML = `
            <h4>Répartition par catégorie:</h4>
            <div class="category-results">
                ${Object.entries(categoryStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => `
                        <div class="category-result-item">
                            <span class="category-label">${categoryLabels[category] || category}</span>
                            <span class="category-count">${count} emails</span>
                            <div class="category-bar">
                                <div class="category-bar-fill" style="width: ${(count / this.scanStats.categorized) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
            </div>
            
            <div class="results-actions">
                <button class="btn btn-primary" id="exportResults">
                    <i class="fas fa-download"></i> Exporter les résultats
                </button>
                <button class="btn btn-secondary" id="viewDetails">
                    <i class="fas fa-eye"></i> Voir les détails
                </button>
            </div>
        `;
        
        // Actions sur les résultats
        document.getElementById('exportResults')?.addEventListener('click', () => this.exportResults());
        document.getElementById('viewDetails')?.addEventListener('click', () => this.showDetailedResults());
    }

    // Exporter les résultats
    exportResults() {
        const csv = this.convertToCSV(this.scanResults);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.addLog('📥 Résultats exportés', 'success');
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
                                    <td>${result.from}</td>
                                    <td>${result.subject}</td>
                                    <td><span class="category-badge">${result.category}</span></td>
                                    <td>${Math.round(result.confidence * 100)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${this.scanResults.length > 100 ? '<p class="text-muted">Affichage des 100 premiers résultats</p>' : ''}
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

    // Mettre à jour l'interface
    updateUI(state) {
        const startBtn = document.getElementById('startScan');
        const pauseBtn = document.getElementById('pauseScan');
        const stopBtn = document.getElementById('stopScan');
        const progressSection = document.querySelector('.scan-progress-section');
        
        switch (state) {
            case 'scanning':
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-block';
                stopBtn.style.display = 'inline-block';
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
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
                stopBtn.style.display = 'none';
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
        
        // Limiter le nombre de logs affichés
        while (logsContainer.children.length > 100) {
            logsContainer.removeChild(logsContainer.lastChild);
        }
    }

    // Afficher un message d'erreur
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
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

// Styles CSS pour le scan unifié
const scanStyles = `
    .unified-scan {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .scan-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .scan-description {
        color: #666;
        margin-top: 10px;
    }

    .error-message {
        text-align: center;
        padding: 50px;
        color: #d32f2f;
    }

    .error-message i {
        color: #d32f2f;
        margin-bottom: 20px;
    }

    .error-message h2 {
        margin: 20px 0;
    }

    .error-message p {
        margin: 10px 0;
        color: #666;
    }

    .categories-selection {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 15px;
    }

    .category-checkbox {
        display: flex;
        align-items: center;
        padding: 10px;
        background: white;
        border-radius: 6px;
        border: 2px solid #e0e0e0;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .category-checkbox:hover {
        border-color: var(--category-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .category-checkbox input[type="checkbox"] {
        margin-right: 10px;
    }

    .category-checkbox input[type="checkbox"]:checked + span {
        color: var(--category-color);
        font-weight: bold;
    }

    .scan-options {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .option-group {
        margin-bottom: 10px;
    }

    .option-group label {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .scan-actions {
        text-align: center;
        margin: 30px 0;
    }

    .btn-large {
        padding: 15px 30px;
        font-size: 18px;
        margin: 0 10px;
    }

    .scan-progress-section {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-weight: bold;
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
        transition: width 0.3s ease;
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
            rgba(255,255,255,.1) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255,255,255,.1) 50%,
            rgba(255,255,255,.1) 75%,
            transparent 75%,
            transparent
        );
        background-size: 30px 30px;
        animation: progress-stripes 1s linear infinite;
    }

    @keyframes progress-stripes {
        0% { background-position: 0 0; }
        100% { background-position: 30px 0; }
    }

    .scan-speed {
        text-align: center;
        margin-top: 10px;
        color: #666;
        font-size: 14px;
    }

    .scan-results {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .summary-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .summary-card i {
        font-size: 30px;
        color: #4CAF50;
        margin-bottom: 10px;
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
        margin-bottom: 15px;
        background: white;
        padding: 15px;
        border-radius: 6px;
    }

    .category-label {
        flex: 1;
        font-weight: bold;
    }

    .category-count {
        margin-right: 20px;
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
        transition: width 0.3s ease;
    }

    .results-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    }

    .scan-logs {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
    }

    .logs-container {
        max-height: 300px;
        overflow-y: auto;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 10px;
        margin-top: 10px;
    }

    .log-entry {
        display: flex;
        gap: 10px;
        padding: 5px 10px;
        margin-bottom: 5px;
        border-radius: 4px;
        font-size: 14px;
    }

    .log-time {
        color: #666;
        min-width: 80px;
    }

    .log-message {
        flex: 1;
    }

    .log-info {
        background: #e3f2fd;
        color: #1976d2;
    }

    .log-success {
        background: #e8f5e9;
        color: #388e3c;
    }

    .log-warning {
        background: #fff3e0;
        color: #f57c00;
    }

    .log-error {
        background: #ffebee;
        color: #d32f2f;
    }

    .log-skip {
        background: #f5f5f5;
        color: #757575;
    }

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
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
    }

    .modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }

    .close-modal:hover {
        color: #333;
    }

    .results-table {
        width: 100%;
        border-collapse: collapse;
    }

    .results-table th,
    .results-table td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
    }

    .results-table th {
        background: #f5f5f5;
        font-weight: bold;
    }

    .results-table tr:hover {
        background: #f9f9f9;
    }

    .category-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        background: #4CAF50;
        color: white;
        font-size: 12px;
        font-weight: bold;
    }

    .text-muted {
        color: #666;
        text-align: center;
        margin-top: 10px;
    }
`;

// Ajouter les styles au document
if (!document.getElementById('unifiedScanStyles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'unifiedScanStyles';
    styleElement.textContent = scanStyles;
    document.head.appendChild(styleElement);
}

// Ajouter les styles au document
if (!document.getElementById('unifiedScanStyles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'unifiedScanStyles';
    styleElement.textContent = scanStyles;
    document.head.appendChild(styleElement);
}

// Initialiser automatiquement si on est sur la bonne page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[UnifiedScan] DOM chargé, vérification...');
    
    // Attendre que CategoryManager soit disponible
    let attempts = 0;
    const checkAndInit = async () => {
        attempts++;
        
        if (window.categoryManager) {
            console.log('[UnifiedScan] CategoryManager trouvé, initialisation...');
            
            try {
                const unifiedScan = new UnifiedScan();
                window.unifiedScan = unifiedScan;
                await unifiedScan.initialize();
                console.log('[UnifiedScan] ✅ Initialisation réussie');
            } catch (error) {
                console.error('[UnifiedScan] ❌ Erreur initialisation:', error);
                
                // Afficher l'erreur dans la page
                const container = document.querySelector('.container');
                if (container) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 50px; color: #d32f2f;">
                            <i class="fas fa-exclamation-triangle fa-3x"></i>
                            <h2>Erreur d'initialisation</h2>
                            <p>${error.message}</p>
                            <button class="btn btn-primary" onclick="location.reload()">
                                <i class="fas fa-sync"></i> Recharger
                            </button>
                        </div>
                    `;
                }
            }
        } else if (attempts < 50) {
            // Réessayer après 100ms
            setTimeout(checkAndInit, 100);
        } else {
            console.error('[UnifiedScan] ❌ CategoryManager non trouvé après 5 secondes');
            
            const container = document.querySelector('.container');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: #d32f2f;">
                        <i class="fas fa-exclamation-triangle fa-3x"></i>
                        <h2>Erreur de chargement</h2>
                        <p>Le système de catégorisation n'est pas disponible.</p>
                        <p>Veuillez vérifier que tous les composants sont chargés.</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-sync"></i> Recharger
                        </button>
                    </div>
                `;
            }
        }
    };
    
    // Démarrer la vérification
    checkAndInit();
});

// Exporter la classe
window.UnifiedScan = UnifiedScan;

// Fonction globale pour initialisation manuelle
window.startUnifiedScan = async function() {
    console.log('[UnifiedScan] Initialisation manuelle...');
    
    const container = document.querySelector('.container');
    if (!container) {
        console.error('[UnifiedScan] Container .container non trouvé');
        return;
    }
    
    if (!window.categoryManager) {
        console.error('[UnifiedScan] CategoryManager non disponible');
        container.innerHTML = '<div style="text-align:center;padding:50px;"><h2>CategoryManager non chargé</h2><p>Veuillez recharger la page</p></div>';
        return;
    }
    
    try {
        const scan = new UnifiedScan();
        window.unifiedScan = scan;
        await scan.initialize();
        console.log('[UnifiedScan] ✅ Scan démarré avec succès');
    } catch (error) {
        console.error('[UnifiedScan] ❌ Erreur:', error);
        container.innerHTML = `<div style="text-align:center;padding:50px;"><h2>Erreur</h2><p>${error.message}</p></div>`;
    }
};
