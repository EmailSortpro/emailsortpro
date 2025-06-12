// Méthodes utilitaires inchangées
    async createFolder(folderName) {
        try {
            if (!window.authService?.isAuthenticated()) {
                throw new Error('Non authentifié');
            }
            
            console.log(`[ModernDomainOrganizer] 🔍 Vérification existence du dossier: "${folderName}"`);
            
            await this.loadAllFolders();
            
            const existingFolder = this.findExistingFolderByName(folderName);
            if (existingFolder) {
                console.log(`[ModernDomainOrganizer] ✅ Dossier existe déjà: "${existingFolder.displayName}" (ID: ${existingFolder.id})`);
                return existingFolder;
            }
            
            console.log(`[ModernDomainOrganizer] 📁 Création du nouveau dossier: "${folderName}"`);
            
            const accessToken = await window.authService.getAccessToken();
            
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ displayName: folderName })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 409 && errorData.error?.code === 'ErrorFolderExists') {
                    console.log(`[ModernDomainOrganizer] ⚠️ Le dossier "${folderName}" existe déjà selon l'API`);
                    
                    await this.loadAllFolders();
                    const foundFolder = this.findExistingFolderByName(folderName);
                    
                    if (foundFolder) {
                        console.log(`[ModernDomainOrganizer] ✅ Dossier existant trouvé après rechargement: "${foundFolder.displayName}"`);
                        return foundFolder;
                    } else {
                        const alternativeName = `${folderName}_${Date.now()}`;
                        console.log(`[ModernDomainOrganizer] 🔄 Tentative avec nom alternatif: "${alternativeName}"`);
                        
                        const retryResponse = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ displayName: alternativeName })
                        });
                        
                        if (retryResponse.ok) {
                            const result = await retryResponse.json();
                            console.log(`[ModernDomainOrganizer] ✅ Dossier créé avec nom alternatif: "${result.displayName}"`);
                            return result;
                        }
                    }
                }
                
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`[ModernDomainOrganizer] ✅ Nouveau dossier créé: "${result.displayName}" (ID: ${result.id})`);
            
            this.allFolders.set(result.displayName.toLowerCase().trim(), {
                id: result.id,
                displayName: result.displayName,
                totalItemCount: 0,
                parentFolderId: result.parentFolderId
            });
            
            return result;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création dossier:', error);
            throw new Error(`Impossible de créer le dossier "${folderName}": ${error.message}`);
        }
    }

    async moveEmailBatch(emails, targetFolderId) {
        try {
            if (!window.authService?.isAuthenticated()) {
                throw new Error('Non authentifié');
            }
            
            const accessToken = await window.authService.getAccessToken();
            
            const batchRequests = emails.map((email, index) => ({
                id: index.toString(),
                method: 'POST',
                url: `/me/messages/${email.id}/move`,
                body: { destinationId: targetFolderId },
                headers: { 'Content-Type': 'application/json' }
            }));
            
            const response = await fetch('https://graph.microsoft.com/v1.0/$batch', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requests: batchRequests })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            
            if (result.responses) {
                const errors = result.responses.filter(r => r.status >= 400);
                if (errors.length > 0) {
                    console.warn('[ModernDomainOrganizer] Erreurs batch:', errors);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur déplacement batch:', error);
            throw new Error(`Erreur lors du déplacement: ${error.message}`);
        }
    }

    showFinalReport(results) {
        try {
            this.goToStep('success');
            
            const report = document.getElementById('successReport');
            if (!report) return;
            
            let reportHTML = '<div class="report-section">';
            reportHTML += '<h4>📊 Résumé</h4>';
            reportHTML += '<ul class="report-list">';
            reportHTML += `<li>Emails déplacés: <strong>${results.emailsMoved.toLocaleString()}</strong></li>`;
            reportHTML += `<li>Domaines traités: <strong>${results.domainsProcessed}</strong></li>`;
            reportHTML += `<li>Dossiers créés: <strong>${results.foldersCreated}</strong></li>`;
            if (results.errorsCount > 0) {
                reportHTML += `<li>Erreurs: <strong>${results.errorsCount}</strong></li>`;
            }
            reportHTML += '</ul></div>';
            
            if (results.createdFolders.length > 0) {
                reportHTML += '<div class="report-section">';
                reportHTML += '<h4>✨ Nouveaux dossiers</h4>';
                reportHTML += '<ul class="report-list">';
                results.createdFolders.slice(0, 10).forEach(folder => {
                    reportHTML += `<li>📁 ${folder}</li>`;
                });
                if (results.createdFolders.length > 10) {
                    reportHTML += `<li><em>... et ${results.createdFolders.length - 10} autres</em></li>`;
                }
                reportHTML += '</ul></div>';
            }
            
            if (results.errors.length > 0) {
                reportHTML += '<div class="report-section">';
                reportHTML += '<h4>⚠️ Erreurs</h4>';
                reportHTML += '<ul class="report-list">';
                results.errors.slice(0, 5).forEach(error => {
                    reportHTML += `<li style="color: #dc2626;">${error.folder}: ${error.error}</li>`;
                });
                if (results.errors.length > 5) {
                    reportHTML += `<li><em>... et ${results.errors.length - 5} autres erreurs</em></li>`;
                }
                reportHTML += '</ul></div>';
            }
            
            report.innerHTML = reportHTML;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur rapport final:', error);
        }
    }

    // Utilitaires avec gestion d'erreurs
    updateProgress(percent, message) {
        try {
            const progressFill = document.getElementById('progressBar');
            const progressText = document.getElementById('progressPercent');
            const status = document.getElementById('scanStatus');

            if (progressFill) progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            if (progressText) progressText.textContent = `${Math.round(percent)}%`;
            if (status) status.textContent = message || 'En cours...';
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour progress:', error);
        }
    }

    updateStat(statId, value) {
        try {
            const element = document.getElementById(statId);
            if (element) {
                element.textContent = (value || 0).toLocaleString();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour stat:', error);
        }
    }

    updateExecutionProgress(percent, message) {
        try {
            const progressFill = document.getElementById('executionProgressBar');
            const progressText = document.getElementById('executionPercent');
            const status = document.getElementById('executionStatus');

            if (progressFill) progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            if (progressText) progressText.textContent = `${Math.round(percent)}%`;
            if (status) status.textContent = message || 'En cours...';
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour execution progress:', error);
        }
    }

    updateExecutionStat(statId, value) {
        try {
            const element = document.getElementById(statId);
            if (element) {
                element.textContent = (value || 0).toLocaleString();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour execution stat:', error);
        }
    }

    addExecutionLog(message, type = 'info') {
        try {
            const log = document.getElementById('executionLog');
            if (!log) return;
            
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
            
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
            
            const entries = log.querySelectorAll('.log-entry');
            if (entries.length > 100) {
                entries[0].remove();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur ajout log:', error);
        }
    }

    // Gestion des erreurs et messages
    showError(message) {
        try {
            console.error('[ModernDomainOrganizer] Erreur:', message);
            this.showMessage(message, 'error');
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(message, 'error');
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage erreur:', error);
        }
    }

    showWarning(message) {
        try {
            console.warn('[ModernDomainOrganizer] Avertissement:', message);
            this.showMessage(message, 'warning');
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(message, 'warning');
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage warning:', error);
        }
    }

    showMessage(message, type) {
        try {
            this.clearErrors();
            
            const currentCard = document.querySelector('.step-content:not(.hidden) .step-card');
            if (!currentCard) return;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `${type}-message`;
            messageDiv.textContent = message;
            
            currentCard.insertBefore(messageDiv, currentCard.firstChild);
            
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage message:', error);
        }
    }

    clearErrors() {
        try {
            document.querySelectorAll('.error-message, .warning-message, .info-message').forEach(el => {
                el.remove();
            });
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur clear errors:', error);
        }
    }

    // Extraction et validation des données
    extractDomain(email) {
        try {
            const address = email?.from?.emailAddress?.address;
            if (!address || typeof address !== 'string') return null;
            
            const parts = address.toLowerCase().split('@');
            return parts.length === 2 ? parts[1] : null;
        } catch (error) {
            return null;
        }
    }

    shouldExcludeDomain(domain, excludedDomains) {
        try {
            if (!domain || !Array.isArray(excludedDomains)) return false;
            
            return excludedDomains.some(excluded => {
                try {
                    return domain.toLowerCase().includes(excluded.toLowerCase());
                } catch {
                    return false;
                }
            });
        } catch (error) {
            return false;
        }
    }

    shouldExcludeEmail(email, excludedEmails) {
        try {
            const address = email?.from?.emailAddress?.address?.toLowerCase();
            if (!address || !Array.isArray(excludedEmails)) return false;
            
            return excludedEmails.some(excluded => {
                try {
                    return address.includes(excluded.toLowerCase());
                } catch {
                    return false;
                }
            });
        } catch (error) {
            return false;
        }
    }

    findExistingFolder(domain) {
        try {
            if (!domain) return null;
            
            const domainLower = domain.toLowerCase().trim();
            console.log(`[ModernDomainOrganizer] 🔍 Recherche dossier pour: "${domainLower}"`);
            
            // 1. Recherche exacte
            const exactMatch = this.allFolders.get(domainLower);
            if (exactMatch) {
                console.log(`[ModernDomainOrganizer] ✅ Correspondance exacte: "${exactMatch.displayName}"`);
                return exactMatch;
            }
            
            // 2. Recherche par partie principale du domaine
            const domainParts = domainLower.split('.');
            if (domainParts.length > 1) {
                const mainDomain = domainParts[0];
                const mainMatch = this.allFolders.get(mainDomain);
                if (mainMatch) {
                    console.log(`[ModernDomainOrganizer] ✅ Correspondance partielle: "${mainMatch.displayName}" pour ${mainDomain}`);
                    return mainMatch;
                }
            }
            
            // 3. Recherche inversée (nom de dossier contient le domaine)
            for (const [folderKey, folder] of this.allFolders) {
                if (folderKey.includes(domainLower)) {
                    console.log(`[ModernDomainOrganizer] ✅ Correspondance contient: "${folder.displayName}"`);
                    return folder;
                }
            }
            
            // 4. Recherche approximative (domaine contient nom de dossier)
            for (const [folderKey, folder] of this.allFolders) {
                if (domainLower.includes(folderKey) && folderKey.length > 3) {
                    console.log(`[ModernDomainOrganizer] ✅ Correspondance approximative: "${folder.displayName}"`);
                    return folder;
                }
            }
            
            console.log(`[ModernDomainOrganizer] ❌ Aucun dossier trouvé pour: "${domainLower}"`);
            return null;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur recherche dossier:', error);
            return null;
        }
    }

    findExistingFolderByName(name) {
        try {
            if (!name) return null;
            
            const nameLower = name.toLowerCase().trim();
            console.log(`[ModernDomainOrganizer] 🔍 Recherche dossier par nom: "${nameLower}"`);
            
            for (const folder of this.allFolders.values()) {
                if (folder.displayName.toLowerCase().trim() === nameLower) {
                    console.log(`[ModernDomainOrganizer] ✅ Dossier trouvé par nom: "${folder.displayName}"`);
                    return folder;
                }
            }
            
            console.log(`[ModernDomainOrganizer] ❌ Aucun dossier trouvé pour le nom: "${nameLower}"`);
            return null;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur recherche dossier par nom:', error);
            return null;
        }
    }

    // Modal management
    closeEmailModal() {
        try {
            const modal = document.getElementById('emailModal');
            if (modal) {
                modal.classList.add('hidden');
            }
            this.currentEditingEmail = null;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur fermeture modal:', error);
        }
    }

    restart() {
        try {
            this.currentStep = 'introduction';
            this.scanResults = null;
            this.organizationPlan.clear();
            this.emailsByDomain.clear();
            this.expandedDomains.clear();
            this.totalEmailsScanned = 0;
            this.isProcessing = false;
            this.currentEditingEmail = null;
            
            this.clearErrors();
            this.goToStep('introduction');
            this.setDefaultDates();
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur restart:', error);
        }
    }

    // Interface publique
    showPage() {
        try {
            console.log('[ModernDomainOrganizer] Affichage de la page...');
            
            if (!window.authService?.isAuthenticated()) {
                this.showError('Veuillez vous connecter pour continuer');
                return;
            }
            
            const loginPage = document.getElementById('loginPage');
            if (loginPage) loginPage.style.display = 'none';
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.style.display = 'block';
                pageContent.innerHTML = this.getPageHTML();
            }
            
            this.initializePage();
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            const rangerButton = document.querySelector('[data-page="ranger"]');
            if (rangerButton) rangerButton.classList.add('active');
            
            console.log('[ModernDomainOrganizer] ✅ Page affichée avec édition individuelle');
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage page:', error);
            this.showError('Erreur lors de l\'affichage de la page: ' + error.message);
        }
    }
}

// Initialisation avec gestion d'erreurs
try {
    window.modernDomainOrganizer = new ModernDomainOrganizer();
    
    document.addEventListener('DOMContentLoaded', function() {
        try {
            document.addEventListener('click', function(e) {
                const rangerButton = e.target.closest('[data-page="ranger"]');
                if (!rangerButton) return;
                
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                window.modernDomainOrganizer.showPage();
                return false;
            }, true);
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur setup événements:', error);
        }
    });
    
    window.showModernDomainOrganizer = function() {
        try {
            window.modernDomainOrganizer.showPage();
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur fonction globale:', error);
        }
    };
    
    console.log('[ModernDomainOrganizer] ✅ Module chargé avec édition individuelle des emails');
    
} catch (error) {
    console.error('[ModernDomainOrganizer] ❌ Erreur fatale lors du chargement:', error);
}
                // ModernDomainOrganizer.js - Version avec édition individuelle des emails
// Interface compacte et optimisée - ÉDITION INDIVIDUELLE AJOUTÉE

class ModernDomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.currentStep = 'introduction';
        this.scanResults = null;
        this.organizationPlan = new Map();
        this.allFolders = new Map();
        this.emailsByDomain = new Map();
        this.totalEmailsScanned = 0;
        this.expandedDomains = new Set();
        this.currentEditingEmail = null;
        
        console.log('[ModernDomainOrganizer] ✅ Initialisé avec édition individuelle');
    }

    getPageHTML() {
        return `
            <div class="modern-organizer">
                <!-- Header avec progression -->
                <div class="organizer-header">
                    <div class="progress-steps">
                        <div class="step active" data-step="introduction">
                            <div class="step-circle">💡</div>
                            <span>Guide</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="configuration">
                            <div class="step-circle">⚙️</div>
                            <span>Config</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="scanning">
                            <div class="step-circle">🔍</div>
                            <span>Scan</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="plan">
                            <div class="step-circle">📋</div>
                            <span>Plan</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="execution">
                            <div class="step-circle">⚡</div>
                            <span>Action</span>
                        </div>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="organizer-main">
                    <div class="organizer-content">
                        <!-- Introduction compacte -->
                        <div class="step-content" id="step-introduction">
                            <div class="step-card intro-card">
                                <div class="card-header">
                                    <h2>🎯 Organisateur automatique par domaine</h2>
                                    <p>Créez automatiquement des dossiers par expéditeur (amazon.com, paypal.com...)</p>
                                </div>

                                <div class="intro-compact">
                                    <div class="process-flow">
                                        <div class="flow-step">
                                            <div class="flow-icon">⚙️</div>
                                            <span>Configuration</span>
                                        </div>
                                        <div class="flow-arrow">→</div>
                                        <div class="flow-step">
                                            <div class="flow-icon">🔍</div>
                                            <span>Analyse</span>
                                        </div>
                                        <div class="flow-arrow">→</div>
                                        <div class="flow-step">
                                            <div class="flow-icon">📋</div>
                                            <span>Édition</span>
                                        </div>
                                        <div class="flow-arrow">→</div>
                                        <div class="flow-step">
                                            <div class="flow-icon">⚡</div>
                                            <span>Exécution</span>
                                        </div>
                                    </div>

                                    <div class="example-compact">
                                        <div class="example-side">
                                            <h4>📥 Avant</h4>
                                            <div class="preview-box">
                                                <div class="preview-line">Amazon - Livraison</div>
                                                <div class="preview-line">PayPal - Paiement</div>
                                                <div class="preview-line">Amazon - Promo</div>
                                                <div class="preview-line">GitHub - Notification</div>
                                            </div>
                                        </div>
                                        <div class="example-arrow">→</div>
                                        <div class="example-side">
                                            <h4>📁 Après</h4>
                                            <div class="preview-box">
                                                <div class="preview-line">📁 amazon.com (2)</div>
                                                <div class="preview-line">📁 paypal.com (1)</div>
                                                <div class="preview-line">📁 github.com (1)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="tips-compact">
                                        <div class="tip-item">
                                            <span class="tip-icon">🧪</span>
                                            <span><strong>Testez :</strong> Créez d'abord les dossiers seulement</span>
                                        </div>
                                        <div class="tip-item">
                                            <span class="tip-icon">📊</span>
                                            <span><strong>Seuil :</strong> 3+ emails par domaine recommandé</span>
                                        </div>
                                        <div class="tip-item">
                                            <span class="tip-icon">✏️</span>
                                            <span><strong>Nouveau :</strong> Éditez la destination de chaque email</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="action-bar">
                                    <div></div>
                                    <button class="btn btn-primary btn-large" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                        <i class="fas fa-arrow-right"></i>
                                        Commencer l'organisation
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Configuration -->
                        <div class="step-content hidden" id="step-configuration">
                            <div class="step-card">
                                <div class="card-header">
                                    <h2>⚙️ Configuration</h2>
                                    <p>Paramétrez l'analyse selon vos besoins</p>
                                </div>

                                <div class="config-grid">
                                    <div class="config-group">
                                        <label>📅 Période d'analyse</label>
                                        <div class="date-row">
                                            <input type="date" id="startDate" title="Date de début">
                                            <span>→</span>
                                            <input type="date" id="endDate" title="Date de fin">
                                        </div>
                                    </div>

                                    <div class="config-group">
                                        <label>📊 Critères</label>
                                        <div class="criteria-row">
                                            <div class="input-group">
                                                <span>Min emails/domaine</span>
                                                <input type="number" id="minEmails" value="3" min="1" max="50">
                                            </div>
                                            <div class="input-group">
                                                <span>Limite scan</span>
                                                <select id="emailLimit">
                                                    <option value="0">Tous</option>
                                                    <option value="1000">1000</option>
                                                    <option value="2000">2000</option>
                                                    <option value="5000">5000</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="config-group">
                                        <label>🚫 Exclusions (optionnel)</label>
                                        <input type="text" id="excludeDomains" placeholder="domaine1.com, domaine2.com" 
                                               value="gmail.com, outlook.com, hotmail.com, hotmail.fr">
                                        <textarea id="excludeEmails" placeholder="email1@exemple.com&#10;email2@exemple.com" rows="2"></textarea>
                                    </div>
                                </div>

                                <div class="action-bar">
                                    <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('introduction')">
                                        <i class="fas fa-arrow-left"></i>
                                        Retour
                                    </button>
                                    <button class="btn btn-primary" id="startScanBtn">
                                        <i class="fas fa-search"></i>
                                        Analyser
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Scanning -->
                        <div class="step-content hidden" id="step-scanning">
                            <div class="step-card">
                                <div class="card-header">
                                    <h2>🔍 Analyse en cours</h2>
                                    <p id="scanStatus">Initialisation...</p>
                                </div>

                                <div class="scan-progress">
                                    <div class="progress-container">
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="progressBar"></div>
                                        </div>
                                        <div class="progress-text" id="progressPercent">0%</div>
                                    </div>

                                    <div class="scan-stats">
                                        <div class="stat">
                                            <span class="stat-number" id="scannedEmails">0</span>
                                            <span class="stat-label">Emails</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="foundDomains">0</span>
                                            <span class="stat-label">Domaines</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="existingFolders">0</span>
                                            <span class="stat-label">Existants</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="newFoldersNeeded">0</span>
                                            <span class="stat-label">Nouveaux</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Plan - VERSION AVEC ÉDITION INDIVIDUELLE -->
                        <div class="step-content hidden" id="step-plan">
                            <div class="step-card plan-card-simple">
                                <!-- Header condensé -->
                                <div class="card-header-simple">
                                    <h2>📋 Plan d'organisation</h2>
                                    <p class="edit-hint">💡 Cliquez sur ✏️ pour éditer la destination de chaque email</p>
                                </div>

                                <!-- Contenu principal -->
                                <div class="plan-content-simple">
                                    <!-- Stats + Options en ligne -->
                                    <div class="plan-top-bar">
                                        <div class="stats-simple" id="planSummary">
                                            <span><strong>16</strong> Domaines</span>
                                            <span><strong>145</strong> Emails</span>
                                            <span><strong>15</strong> Nouveaux</span>
                                        </div>
                                        <div class="options-simple">
                                            <label><input type="radio" name="executionType" value="folders-only"> 📁 Dossiers</label>
                                            <label><input type="radio" name="executionType" value="complete" checked> ⚡ Complet</label>
                                        </div>
                                        <div class="count-simple">
                                            <span id="selectedEmailsText">145 emails sélectionnés</span>
                                        </div>
                                    </div>

                                    <!-- Contrôles -->
                                    <div class="controls-simple">
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.selectAllDomains()">✅ Tout</button>
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.deselectAllDomains()">❌ Rien</button>
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.expandAllDomains()">📂 Déplier</button>
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.collapseAllDomains()">📁 Replier</button>
                                        <button class="btn-xs btn-reset" onclick="window.modernDomainOrganizer.resetAllCustomDestinations()">🔄 Reset destinations</button>
                                    </div>

                                    <!-- Liste des domaines avec hauteur fixe -->
                                    <div class="domains-wrapper">
                                        <div class="domains-container-simple" id="domainsContainer"></div>
                                    </div>
                                </div>

                                <!-- Boutons d'action FIXES en bas -->
                                <div class="action-bar-simple">
                                    <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                        ← Reconfigurer
                                    </button>
                                    <button class="btn btn-primary btn-execute" id="executeSelectedBtn" onclick="window.modernDomainOrganizer.executeSelectedAction()">
                                        <span id="executeButtonText">⚡ Exécuter</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Execution -->
                        <div class="step-content hidden" id="step-execution">
                            <div class="step-card">
                                <div class="card-header">
                                    <h2>⚡ <span id="executionTitle">Exécution</span></h2>
                                    <p id="executionStatus">Préparation...</p>
                                </div>

                                <div class="execution-progress">
                                    <div class="progress-container">
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="executionProgressBar"></div>
                                        </div>
                                        <div class="progress-text" id="executionPercent">0%</div>
                                    </div>

                                    <div class="execution-stats">
                                        <div class="stat">
                                            <span class="stat-number" id="foldersCreated">0</span>
                                            <span class="stat-label">Dossiers</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="emailsMoved">0</span>
                                            <span class="stat-label">Emails</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="domainsProcessed">0</span>
                                            <span class="stat-label">Domaines</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="errorsCount">0</span>
                                            <span class="stat-label">Erreurs</span>
                                        </div>
                                    </div>

                                    <div class="execution-log" id="executionLog"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Success -->
                        <div class="step-content hidden" id="step-success">
                            <div class="step-card success-card">
                                <div class="success-content">
                                    <div class="success-icon">🎉</div>
                                    <h2 id="successTitle">Terminé !</h2>
                                    <div class="success-report" id="successReport"></div>
                                </div>

                                <div class="action-bar">
                                    <button class="btn btn-outline" onclick="window.modernDomainOrganizer.goToStep('plan')">
                                        <i class="fas fa-arrow-left"></i>
                                        Retour
                                    </button>
                                    <button class="btn btn-primary" onclick="window.modernDomainOrganizer.restart()">
                                        <i class="fas fa-redo"></i>
                                        Recommencer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal d'édition EMAIL INDIVIDUEL -->
                <div class="email-modal hidden" id="emailModal">
                    <div class="email-modal-content">
                        <div class="email-modal-header">
                            <h3>✏️ Édition de la destination</h3>
                            <button class="modal-close" onclick="window.modernDomainOrganizer.closeEmailModal()">×</button>
                        </div>
                        <div class="email-modal-body" id="emailModalBody">
                            <!-- Contenu généré dynamiquement -->
                        </div>
                        <div class="email-modal-footer">
                            <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.closeEmailModal()">
                                Annuler
                            </button>
                            <button class="btn btn-outline" onclick="window.modernDomainOrganizer.resetEmailDestination()">
                                🔄 Reset
                            </button>
                            <button class="btn btn-primary" id="saveEmailBtn" onclick="window.modernDomainOrganizer.saveEmailChanges()">
                                💾 Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .modern-organizer {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    box-sizing: border-box;
                }

                .organizer-header {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }

                .organizer-main {
                    flex: 1;
                    overflow-y: auto;
                }

                .progress-steps {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    min-width: 80px;
                    opacity: 0.5;
                    transition: opacity 0.3s;
                }

                .step.active, .step.completed {
                    opacity: 1;
                }

                .step-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: background 0.3s;
                }

                .step.active .step-circle {
                    background: #3b82f6;
                    color: white;
                }

                .step.completed .step-circle {
                    background: #10b981;
                    color: white;
                }

                .step-line {
                    flex: 1;
                    height: 2px;
                    background: #e5e7eb;
                    margin: 0 -5px;
                }

                .step span {
                    font-size: 12px;
                    font-weight: 500;
                    color: #6b7280;
                }

                .step.active span {
                    color: #1f2937;
                    font-weight: 600;
                }

                .step-content {
                    animation: fadeIn 0.3s ease;
                }

                .step-content.hidden {
                    display: none;
                }

                .step-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    min-height: 500px;
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .card-header h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    color: #1f2937;
                }

                .card-header p {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                }

                /* VERSION SIMPLIFIÉE - BOUTON GARANTI VISIBLE */
                .plan-card-simple {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    height: calc(100vh - 200px);
                    max-height: 600px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* Header condensé */
                .card-header-simple {
                    padding: 10px 16px;
                    flex-shrink: 0;
                    border-bottom: 1px solid #e5e7eb;
                    text-align: center;
                }

                .card-header-simple h2 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 4px 0;
                    color: #1f2937;
                }

                .edit-hint {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0;
                    font-style: italic;
                }

                /* Contenu principal */
                .plan-content-simple {
                    flex: 1;
                    padding: 12px 16px 0 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    overflow: hidden;
                }

                /* Top bar avec stats + options */
                .plan-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 8px 12px;
                    flex-shrink: 0;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .stats-simple {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    font-size: 12px;
                    color: #374151;
                }

                .stats-simple strong {
                    font-size: 14px;
                    color: #1f2937;
                }

                .options-simple {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .options-simple label {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    color: #374151;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background: white;
                    border: 1px solid #d1d5db;
                    transition: all 0.2s;
                }

                .options-simple label:hover {
                    border-color: #3b82f6;
                    background: #f0f9ff;
                }

                .options-simple input[type="radio"] {
                    width: 12px;
                    height: 12px;
                }

                .count-simple {
                    font-size: 11px;
                    color: #0369a1;
                    font-weight: 500;
                    white-space: nowrap;
                }

                /* Contrôles */
                .controls-simple {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    flex-shrink: 0;
                    flex-wrap: wrap;
                }

                .btn-xs {
                    padding: 4px 8px;
                    font-size: 10px;
                    border: 1px solid #d1d5db;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #374151;
                    transition: all 0.2s;
                }

                .btn-xs:hover {
                    background: #f9fafb;
                    border-color: #3b82f6;
                }

                .btn-reset {
                    background: #fef3c7 !important;
                    color: #92400e !important;
                    border-color: #fbbf24 !important;
                }

                .btn-reset:hover {
                    background: #fde68a !important;
                    border-color: #f59e0b !important;
                }

                /* Wrapper pour les domaines */
                .domains-wrapper {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                }

                .domains-container-simple {
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    background: white;
                    flex: 1;
                    overflow-y: auto;
                    min-height: 250px;
                    max-height: 400px;
                }

                /* Action bar FIXE en bas */
                .action-bar-simple {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-top: 2px solid #e5e7eb;
                    flex-shrink: 0;
                    background: #fafbfc;
                    border-radius: 0 0 12px 12px;
                    position: relative;
                    z-index: 10;
                }

                .btn-execute {
                    background: #3b82f6 !important;
                    color: white !important;
                    padding: 10px 20px !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    border-radius: 6px !important;
                    border: none !important;
                    cursor: pointer !important;
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
                    transition: all 0.2s !important;
                }

                .btn-execute:hover {
                    background: #2563eb !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
                }

                /* Introduction compacte */
                .intro-compact {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .process-flow {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .flow-step {
                    text-align: center;
                    min-width: 120px;
                }

                .flow-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .flow-step h4 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 4px 0;
                    color: #1f2937;
                }

                .flow-step p {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0;
                }

                .flow-arrow {
                    font-size: 16px;
                    color: #3b82f6;
                    font-weight: bold;
                }

                .example-compact {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 24px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .example-side {
                    flex: 1;
                    max-width: 200px;
                }

                .example-side h4 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    color: #1f2937;
                }

                .preview-box {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 12px;
                }

                .preview-line {
                    font-size: 12px;
                    padding: 4px 0;
                    color: #374151;
                }

                .example-arrow {
                    font-size: 20px;
                    color: #3b82f6;
                    font-weight: bold;
                }

                .tips-compact {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .tip-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #374151;
                }

                .tip-icon {
                    font-size: 16px;
                    flex-shrink: 0;
                }

                /* Configuration */
                .config-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .config-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .config-group label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .date-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .date-row input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .criteria-row {
                    display: flex;
                    gap: 16px;
                }

                .input-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .input-group span {
                    font-size: 12px;
                    color: #6b7280;
                }

                .input-group input, .input-group select {
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .config-group input[type="text"], .config-group textarea {
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    resize: none;
                }

                .config-group input:focus, .config-group select:focus, .config-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                /* Progress */
                .progress-container {
                    position: relative;
                    margin-bottom: 20px;
                }

                .progress-bar {
                    width: 100%;
                    height: 12px;
                    background: #e5e7eb;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    width: 0%;
                    transition: width 0.4s ease;
                }

                .progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 10px;
                    font-weight: 600;
                    color: #1f2937;
                }

                .scan-stats, .execution-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .stat {
                    text-align: center;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .stat-number {
                    display: block;
                    font-size: 20px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 11px;
                    color: #6b7280;
                    margin-top: 2px;
                }

                /* Plan */
                .plan-summary {
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 16px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    text-align: center;
                    flex-shrink: 0;
                }

                .plan-controls {
                    flex-shrink: 0;
                }

                .domain-item {
                    border-bottom: 1px solid #f3f4f6;
                }

                .domain-item:last-child {
                    border-bottom: none;
                }

                .domain-header {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .domain-header:hover {
                    background: #f9fafb;
                }

                .domain-checkbox {
                    width: 16px;
                    height: 16px;
                }

                .domain-expand {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 2px;
                    color: #6b7280;
                    font-size: 12px;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1f2937;
                }

                .domain-stats {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 2px;
                }

                .domain-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .folder-input {
                    padding: 6px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 12px;
                    min-width: 120px;
                }

                .action-badge {
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .action-new {
                    background: #d1fae5;
                    color: #065f46;
                }

                .action-existing {
                    background: #e0e7ff;
                    color: #3730a3;
                }

                .domain-content {
                    display: none;
                    padding: 0 16px 12px 40px;
                    background: #fafbfc;
                }

                .domain-content.expanded {
                    display: block;
                }

                .emails-list {
                    max-height: 200px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    background: white;
                }

                .email-item {
                    padding: 8px 12px;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    transition: background-color 0.2s;
                }

                .email-item:last-child {
                    border-bottom: none;
                }

                .email-item:hover {
                    background: #f9fafb;
                }

                .email-checkbox {
                    width: 14px;
                    height: 14px;
                }

                .email-info {
                    flex: 1;
                    min-width: 0;
                }

                .email-subject {
                    font-weight: 500;
                    color: #1f2937;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .email-from {
                    font-size: 11px;
                    color: #6b7280;
                }

                .email-date {
                    font-size: 11px;
                    color: #9ca3af;
                }

                .email-actions {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    flex-shrink: 0;
                }

                .edit-email-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #3b82f6;
                    font-size: 14px;
                    padding: 2px 4px;
                    border-radius: 3px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .edit-email-btn:hover {
                    background: #e0f2fe;
                    color: #0369a1;
                }

                .custom-destination {
                    font-size: 10px;
                    color: #7c3aed;
                    font-weight: 500;
                    background: #f3e8ff;
                    padding: 1px 4px;
                    border-radius: 3px;
                    margin-left: 4px;
                }

                .execution-options {
                    background: #f0f9ff;
                    border: 1px solid #bae6fd;
                    border-radius: 8px;
                    padding: 16px;
                    flex-shrink: 0;
                }

                .option-row {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .option-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 6px;
                    transition: background 0.2s;
                }

                .option-label:hover {
                    background: rgba(255, 255, 255, 0.7);
                }

                .option-label input[type="radio"] {
                    width: 16px;
                    height: 16px;
                }

                .selection-info {
                    text-align: center;
                    font-size: 14px;
                    font-weight: 500;
                    color: #0369a1;
                }

                /* Execution */
                .execution-log {
                    max-height: 150px;
                    overflow-y: auto;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 12px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 11px;
                }

                .log-entry {
                    margin-bottom: 2px;
                    color: #6b7280;
                    line-height: 1.3;
                }

                .log-entry.success { color: #059669; }
                .log-entry.error { color: #dc2626; }
                .log-entry.info { color: #3b82f6; }

                /* Success */
                .success-card {
                    text-align: center;
                }

                .success-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .success-report {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                    text-align: left;
                    font-size: 14px;
                }

                .report-section {
                    margin-bottom: 12px;
                }

                .report-section h4 {
                    margin: 0 0 8px 0;
                    color: #065f46;
                    font-size: 14px;
                }

                .report-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .report-list li {
                    padding: 2px 0;
                    color: #047857;
                    font-size: 13px;
                }

                /* Modal d'édition d'email */
                .email-modal {
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
                }

                .email-modal.hidden {
                    display: none;
                }

                .email-modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }

                .email-modal-header {
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f9fafb;
                }

                .email-modal-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 4px;
                }

                .email-modal-body {
                    padding: 20px;
                    max-height: 50vh;
                    overflow-y: auto;
                }

                .email-modal-footer {
                    padding: 16px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    background: #f9fafb;
                }

                .email-detail {
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .email-detail h4 {
                    margin: 0 0 12px 0;
                    color: #1f2937;
                    font-size: 16px;
                }

                .email-meta {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 8px 16px;
                    margin-bottom: 12px;
                    font-size: 14px;
                }

                .email-meta-label {
                    font-weight: 600;
                    color: #374151;
                }

                .email-meta-value {
                    color: #6b7280;
                }

                .destination-editor {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .destination-editor h4 {
                    margin: 0;
                    font-size: 16px;
                    color: #1f2937;
                }

                .destination-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .destination-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .destination-option:hover {
                    background: #f9fafb;
                    border-color: #3b82f6;
                }

                .destination-option.selected {
                    background: #eff6ff;
                    border-color: #3b82f6;
                }

                .destination-option input[type="radio"] {
                    width: 16px;
                    height: 16px;
                }

                .destination-info {
                    flex: 1;
                }

                .destination-name {
                    font-weight: 500;
                    color: #1f2937;
                }

                .destination-description {
                    font-size: 12px;
                    color: #6b7280;
                }

                .custom-folder-input {
                    margin-top: 8px;
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 14px;
                    width: 100%;
                }

                .custom-folder-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                .existing-folders-list {
                    max-height: 150px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    background: white;
                    margin-top: 8px;
                }

                .folder-option {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 13px;
                    color: #374151;
                    transition: background-color 0.2s;
                }

                .folder-option:last-child {
                    border-bottom: none;
                }

                .folder-option:hover {
                    background: #f9fafb;
                }

                .folder-option.selected {
                    background: #eff6ff;
                    color: #1d4ed8;
                    font-weight: 500;
                }

                /* Buttons */
                .action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-top: 24px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #2563eb;
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                .btn-outline {
                    background: transparent;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .btn-outline:hover {
                    background: #f9fafb;
                }

                .btn-small {
                    padding: 6px 12px;
                    font-size: 12px;
                }

                .btn-large {
                    padding: 14px 28px;
                    font-size: 16px;
                    font-weight: 700;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .modern-organizer {
                        padding: 6px;
                    }

                    .organizer-header {
                        padding: 8px;
                        margin-bottom: 8px;
                    }

                    .step-card {
                        padding: 12px;
                        min-height: 400px;
                    }

                    /* Plan mobile simplifié */
                    .plan-card-simple {
                        height: calc(100vh - 160px);
                        max-height: none;
                    }

                    .card-header-simple {
                        padding: 8px 12px;
                    }

                    .card-header-simple h2 {
                        font-size: 16px;
                    }

                    .plan-content-simple {
                        padding: 8px 12px 0 12px;
                        gap: 8px;
                    }

                    .action-bar-simple {
                        padding: 10px 12px;
                    }

                    .plan-top-bar {
                        flex-direction: column;
                        gap: 8px;
                        padding: 6px;
                    }

                    .stats-simple {
                        gap: 10px;
                        justify-content: space-around;
                        width: 100%;
                        font-size: 11px;
                    }

                    .stats-simple strong {
                        font-size: 13px;
                    }

                    .options-simple {
                        gap: 8px;
                        justify-content: center;
                    }

                    .options-simple label {
                        font-size: 10px;
                        padding: 3px 6px;
                    }

                    .count-simple {
                        font-size: 10px;
                        text-align: center;
                    }

                    .controls-simple {
                        gap: 4px;
                    }

                    .btn-xs {
                        padding: 3px 6px;
                        font-size: 9px;
                    }

                    .domains-container-simple {
                        min-height: 200px;
                        max-height: 300px;
                    }

                    .btn-execute {
                        padding: 8px 16px !important;
                        font-size: 12px !important;
                    }

                    .domain-header {
                        padding: 8px 12px;
                        gap: 8px;
                    }

                    .domain-name {
                        font-size: 12px;
                    }

                    .domain-stats {
                        font-size: 10px;
                    }

                    .folder-input {
                        font-size: 10px;
                        padding: 4px 6px;
                        min-width: 80px;
                    }

                    .action-badge {
                        font-size: 8px;
                        padding: 1px 4px;
                    }

                    .emails-list {
                        max-height: 100px;
                    }

                    .email-item {
                        padding: 4px 8px;
                        font-size: 10px;
                    }

                    .domain-content {
                        padding: 0 12px 8px 28px;
                    }

                    .btn {
                        padding: 6px 12px;
                        font-size: 12px;
                    }

                    .btn-large {
                        padding: 8px 16px;
                        font-size: 13px;
                    }

                    .email-modal-content {
                        width: 95%;
                        margin: 10px;
                    }

                    .email-modal-body {
                        padding: 16px;
                    }

                    .email-meta {
                        grid-template-columns: 1fr;
                        gap: 4px;
                    }
                }

                .hidden {
                    display: none !important;
                }

                .error-message {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 12px;
                    border-radius: 6px;
                    margin: 8px 0;
                    font-size: 14px;
                }

                .warning-message {
                    background: #fef3cd;
                    border: 1px solid #fbbf24;
                    color: #92400e;
                    padding: 12px;
                    border-radius: 6px;
                    margin: 8px 0;
                    font-size: 14px;
                }

                .info-message {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    color: #1e40af;
                    padding: 12px;
                    border-radius: 6px;
                    margin: 8px 0;
                    font-size: 14px;
                }
            </style>
        `;
    }

    // Méthodes principales avec gestion d'erreurs renforcée
    async initializePage() {
        try {
            console.log('[ModernDomainOrganizer] Initialisation...');
            
            if (!window.authService?.isAuthenticated()) {
                this.showError('Veuillez vous connecter pour continuer');
                return false;
            }

            this.setupEventListeners();
            this.setDefaultDates();
            
            return true;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur initialisation:', error);
            this.showError('Erreur lors de l\'initialisation: ' + error.message);
            return false;
        }
    }

    setupEventListeners() {
        try {
            // Event listeners pour les boutons principaux
            const startBtn = document.getElementById('startScanBtn');
            const executeBtn = document.getElementById('executeSelectedBtn');
            const saveBtn = document.getElementById('saveEmailBtn');
            
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startAnalysis());
                console.log('[ModernDomainOrganizer] ✅ Event listener startScanBtn ajouté');
            }
            
            if (executeBtn) {
                executeBtn.addEventListener('click', () => this.executeSelectedAction());
                console.log('[ModernDomainOrganizer] ✅ Event listener executeSelectedBtn ajouté');
            }
            
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveEmailChanges());
                console.log('[ModernDomainOrganizer] ✅ Event listener saveEmailBtn ajouté');
            }
            
            // Event listeners pour les types d'exécution
            document.querySelectorAll('input[name="executionType"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    console.log('[ModernDomainOrganizer] Type d\'exécution changé:', radio.value);
                    this.updateExecutionButton();
                });
            });
            
            console.log('[ModernDomainOrganizer] ✅ Tous les event listeners configurés');
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur setup listeners:', error);
        }
    }

    setDefaultDates() {
        try {
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');
            
            if (startDate) startDate.valueAsDate = thirtyDaysAgo;
            if (endDate) endDate.valueAsDate = today;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur dates par défaut:', error);
        }
    }

    goToStep(stepName) {
        try {
            document.querySelectorAll('.step-content').forEach(content => {
                content.classList.add('hidden');
            });

            const stepElement = document.getElementById(`step-${stepName}`);
            if (stepElement) {
                stepElement.classList.remove('hidden');
                this.updateStepProgress(stepName);
                this.currentStep = stepName;
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur navigation:', error);
        }
    }

    updateStepProgress(currentStep) {
        try {
            const steps = ['introduction', 'configuration', 'scanning', 'plan', 'execution'];
            const currentIndex = steps.indexOf(currentStep);

            document.querySelectorAll('.step').forEach((step, index) => {
                step.classList.remove('active', 'completed');
                
                if (index < currentIndex) {
                    step.classList.add('completed');
                } else if (index === currentIndex) {
                    step.classList.add('active');
                }
            });
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour progression:', error);
        }
    }

    updateExecutionButton() {
        try {
            const executionType = document.querySelector('input[name="executionType"]:checked')?.value;
            const buttonText = document.getElementById('executeButtonText');
            
            if (buttonText) {
                if (executionType === 'folders-only') {
                    buttonText.textContent = '📁 Créer dossiers';
                } else {
                    buttonText.textContent = '⚡ Exécution complète';
                }
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour bouton:', error);
        }
    }

    executeSelectedAction() {
        try {
            const executionType = document.querySelector('input[name="executionType"]:checked')?.value;
            
            if (executionType === 'folders-only') {
                this.createFoldersOnly();
            } else {
                this.executeOrganization();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur action sélectionnée:', error);
            this.showError('Erreur lors de l\'exécution: ' + error.message);
        }
    }

    // Analyse avec gestion d'erreurs
    async startAnalysis() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.clearErrors();
            this.goToStep('scanning');
            
            const config = this.getConfigurationFromForm();
            if (!this.validateConfiguration(config)) {
                this.goToStep('configuration');
                return;
            }
            
            console.log('[ModernDomainOrganizer] Configuration:', config);
            
            // Reset
            this.emailsByDomain.clear();
            this.allFolders.clear();
            this.organizationPlan.clear();
            this.expandedDomains.clear();
            
            // Étapes avec gestion d'erreurs
            await this.executeWithProgress([
                { percent: 5, message: 'Chargement des dossiers...', action: () => this.loadAllFolders() },
                { percent: 20, message: 'Scan des emails...', action: () => this.scanEmails(config) },
                { percent: 70, message: 'Analyse des domaines...', action: (emails) => this.analyzeDomains(emails, config) },
                { percent: 90, message: 'Création du plan...', action: () => this.createOrganizationPlan() },
                { percent: 100, message: 'Terminé !', action: () => this.showOrganizationPlan() }
            ]);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur analyse:', error);
            this.showError('Erreur lors de l\'analyse: ' + error.message);
            this.goToStep('configuration');
        } finally {
            this.isProcessing = false;
        }
    }

    async executeWithProgress(steps) {
        let result = null;
        
        for (const step of steps) {
            try {
                this.updateProgress(step.percent, step.message);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (step.action) {
                    result = await step.action(result);
                }
            } catch (error) {
                throw new Error(`${step.message} - ${error.message}`);
            }
        }
        
        return result;
    }

    validateConfiguration(config) {
        try {
            if (!config.startDate || !config.endDate) {
                this.showError('Veuillez sélectionner une période valide');
                return false;
            }
            
            const startDate = new Date(config.startDate);
            const endDate = new Date(config.endDate);
            
            if (startDate >= endDate) {
                this.showError('La date de début doit être antérieure à la date de fin');
                return false;
            }
            
            if (config.minEmails < 1 || config.minEmails > 100) {
                this.showError('Le nombre minimum d\'emails doit être entre 1 et 100');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur validation:', error);
            this.showError('Configuration invalide: ' + error.message);
            return false;
        }
    }

    getConfigurationFromForm() {
        try {
            const startDate = document.getElementById('startDate')?.value || '';
            const endDate = document.getElementById('endDate')?.value || '';
            const minEmails = parseInt(document.getElementById('minEmails')?.value) || 3;
            const emailLimit = parseInt(document.getElementById('emailLimit')?.value) || 0;
            
            const excludeDomains = (document.getElementById('excludeDomains')?.value || '')
                .split(',')
                .map(d => d.trim())
                .filter(d => d);
            
            const excludeEmails = (document.getElementById('excludeEmails')?.value || '')
                .split('\n')
                .map(e => e.trim())
                .filter(e => e);

            return { startDate, endDate, minEmails, emailLimit, excludeDomains, excludeEmails };
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur lecture config:', error);
            throw new Error('Impossible de lire la configuration');
        }
    }

    async loadAllFolders() {
        try {
            console.log('[ModernDomainOrganizer] Chargement des dossiers...');
            
            if (!window.mailService) {
                throw new Error('Service mail non disponible');
            }
            
            const folders = await window.mailService.getFolders();
            if (!Array.isArray(folders)) {
                throw new Error('Format de dossiers invalide');
            }
            
            this.allFolders.clear();
            
            folders.forEach(folder => {
                if (folder && folder.displayName) {
                    const folderKey = folder.displayName.toLowerCase().trim();
                    this.allFolders.set(folderKey, {
                        id: folder.id,
                        displayName: folder.displayName,
                        totalItemCount: folder.totalItemCount || 0,
                        parentFolderId: folder.parentFolderId
                    });
                    
                    console.log(`[ModernDomainOrganizer] Dossier: "${folder.displayName}"`);
                }
            });

            console.log(`[ModernDomainOrganizer] ✅ ${this.allFolders.size} dossiers chargés`);
            this.updateStat('existingFolders', this.allFolders.size);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur chargement dossiers:', error);
            throw new Error('Impossible de charger les dossiers: ' + error.message);
        }
    }

    async scanEmails(config) {
        try {
            console.log('[ModernDomainOrganizer] Scan des emails...');
            
            if (!window.mailService) {
                throw new Error('Service mail non disponible');
            }
            
            const scanLimit = config.emailLimit === 0 ? 10000 : config.emailLimit;
            
            const options = {
                top: Math.min(scanLimit, 10000), // Limitation de sécurité
                orderBy: 'receivedDateTime desc'
            };

            if (config.startDate) options.startDate = config.startDate;
            if (config.endDate) options.endDate = config.endDate;

            const emails = await window.mailService.getEmailsFromFolder('inbox', options);
            
            if (!Array.isArray(emails)) {
                throw new Error('Format d\'emails invalide');
            }
            
            console.log(`[ModernDomainOrganizer] ${emails.length} emails récupérés`);
            this.updateStat('scannedEmails', emails.length);
            
            return emails;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur scan emails:', error);
            throw new Error('Impossible de scanner les emails: ' + error.message);
        }
    }

    async analyzeDomains(emails, config) {
        try {
            const domainCounts = new Map();
            
            console.log(`[ModernDomainOrganizer] Analyse de ${emails.length} emails...`);
            
            for (const email of emails) {
                try {
                    const domain = this.extractDomain(email);
                    if (!domain) continue;
                    
                    if (this.shouldExcludeDomain(domain, config.excludeDomains)) continue;
                    if (this.shouldExcludeEmail(email, config.excludeEmails)) continue;
                    
                    if (!domainCounts.has(domain)) {
                        domainCounts.set(domain, {
                            count: 0,
                            emails: []
                        });
                    }
                    
                    const domainData = domainCounts.get(domain);
                    domainData.count++;
                    // Initialiser chaque email avec les propriétés par défaut
                    email.selected = true;
                    email.customFolder = null;
                    email.customFolderId = null;
                    domainData.emails.push(email);
                } catch (emailError) {
                    console.warn('[ModernDomainOrganizer] Erreur traitement email:', emailError);
                }
            }

            // Filtrer par seuil minimum
            domainCounts.forEach((data, domain) => {
                if (data.count >= config.minEmails) {
                    this.emailsByDomain.set(domain, data);
                }
            });

            console.log(`[ModernDomainOrganizer] ${this.emailsByDomain.size} domaines valides trouvés`);
            this.updateStat('foundDomains', this.emailsByDomain.size);
            
            if (this.emailsByDomain.size === 0) {
                throw new Error('Aucun domaine trouvé avec le seuil configuré');
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur analyse domaines:', error);
            throw new Error('Erreur lors de l\'analyse des domaines: ' + error.message);
        }
    }

    createOrganizationPlan() {
        try {
            this.organizationPlan.clear();
            
            let newFoldersCount = 0;
            
            this.emailsByDomain.forEach((data, domain) => {
                try {
                    const existingFolder = this.findExistingFolder(domain);
                    
                    if (existingFolder) {
                        console.log(`[ModernDomainOrganizer] ✅ Dossier existant trouvé pour ${domain}: ${existingFolder.displayName}`);
                        this.organizationPlan.set(domain, {
                            domain,
                            action: 'use-existing',
                            targetFolder: existingFolder.displayName,
                            targetFolderId: existingFolder.id,
                            emailCount: data.count,
                            emails: data.emails,
                            selected: true
                        });
                    } else {
                        console.log(`[ModernDomainOrganizer] 📁 Nouveau dossier nécessaire pour ${domain}`);
                        this.organizationPlan.set(domain, {
                            domain,
                            action: 'create-new',
                            targetFolder: domain,
                            targetFolderId: null,
                            emailCount: data.count,
                            emails: data.emails,
                            selected: true
                        });
                        newFoldersCount++;
                    }
                } catch (domainError) {
                    console.warn(`[ModernDomainOrganizer] Erreur plan pour ${domain}:`, domainError);
                }
            });

            this.updateStat('newFoldersNeeded', newFoldersCount);
            console.log(`[ModernDomainOrganizer] Plan créé: ${this.organizationPlan.size} domaines, ${newFoldersCount} nouveaux dossiers`);
            
            if (this.organizationPlan.size === 0) {
                throw new Error('Aucun plan d\'organisation créé');
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création plan:', error);
            throw new Error('Erreur lors de la création du plan: ' + error.message);
        }
    }

    showOrganizationPlan() {
        try {
            this.goToStep('plan');
            
            const summary = document.getElementById('planSummary');
            const container = document.getElementById('domainsContainer');
            
            if (!summary || !container) {
                throw new Error('Éléments d\'interface manquants');
            }
            
            this.displayPlanSummary(summary);
            this.displayDomainsWithEmails(container);
            this.updateTotalEmailsCount();
            this.updateExecutionButton();
            
            // Réattacher les event listeners après affichage
            setTimeout(() => {
                this.setupEventListeners();
            }, 100);
            
            console.log('[ModernDomainOrganizer] ✅ Plan d\'organisation affiché avec édition individuelle');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage plan:', error);
            this.showError('Erreur lors de l\'affichage du plan: ' + error.message);
        }
    }

    displayPlanSummary(summary) {
        try {
            const totalEmails = Array.from(this.organizationPlan.values())
                .reduce((sum, plan) => sum + plan.emailCount, 0);
            
            const newFolders = Array.from(this.organizationPlan.values())
                .filter(plan => plan.action === 'create-new');
            
            const existingFolders = Array.from(this.organizationPlan.values())
                .filter(plan => plan.action === 'use-existing');

            summary.innerHTML = `
                <span><strong>${this.organizationPlan.size}</strong> Domaines</span>
                <span><strong>${totalEmails.toLocaleString()}</strong> Emails</span>
                <span><strong>${newFolders.length}</strong> Nouveaux</span>
                <span><strong>${existingFolders.length}</strong> Existants</span>
            `;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage résumé:', error);
        }
    }

    displayDomainsWithEmails(container) {
        try {
            container.innerHTML = '';
            
            const sortedDomains = Array.from(this.organizationPlan.entries())
                .sort((a, b) => b[1].emailCount - a[1].emailCount);

            sortedDomains.forEach(([domain, plan]) => {
                try {
                    const domainElement = this.createDomainElement(domain, plan);
                    container.appendChild(domainElement);
                } catch (elementError) {
                    console.warn(`[ModernDomainOrganizer] Erreur élément ${domain}:`, elementError);
                }
            });
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage domaines:', error);
        }
    }

    createDomainElement(domain, plan) {
        try {
            const div = document.createElement('div');
            div.className = 'domain-item';
            div.dataset.domain = domain;
            
            const isExpanded = this.expandedDomains.has(domain);
            if (isExpanded) {
                div.classList.add('expanded');
            }

            const safeSubject = (email) => {
                try {
                    return email.subject || '(Sans sujet)';
                } catch {
                    return '(Erreur)';
                }
            };

            const safeFrom = (email) => {
                try {
                    return email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
                } catch {
                    return 'Inconnu';
                }
            };

            const safeDate = (email) => {
                try {
                    return new Date(email.receivedDateTime).toLocaleDateString();
                } catch {
                    return 'Date inconnue';
                }
            };

            // Compter les emails avec destinations personnalisées
            const customDestinationCount = plan.emails.filter(e => e.customFolder).length;

            div.innerHTML = `
                <div class="domain-header" onclick="window.modernDomainOrganizer.toggleDomain('${domain}')">
                    <input type="checkbox" class="domain-checkbox" ${plan.selected ? 'checked' : ''} 
                           onclick="event.stopPropagation(); window.modernDomainOrganizer.toggleDomainSelection('${domain}')" 
                           data-domain="${domain}">
                    
                    <button class="domain-expand">
                        <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'}"></i>
                    </button>
                    
                    <div class="domain-info">
                        <div class="domain-name">📧 ${domain}</div>
                        <div class="domain-stats">
                            ${plan.emailCount} emails • ${plan.emails.filter(e => e.selected !== false).length} sélectionnés
                            ${customDestinationCount > 0 ? ` • ${customDestinationCount} personnalisés` : ''}
                        </div>
                    </div>
                    
                    <div class="domain-actions" onclick="event.stopPropagation()">
                        <input type="text" class="folder-input" value="${plan.targetFolder}" 
                               placeholder="Nom du dossier" data-domain="${domain}"
                               onchange="window.modernDomainOrganizer.updateFolderName('${domain}', this.value)">
                        
                        <span class="action-badge ${plan.action === 'create-new' ? 'action-new' : 'action-existing'}">
                            ${plan.action === 'create-new' ? 'Nouveau' : 'Existant'}
                        </span>
                    </div>
                </div>
                
                <div class="domain-content ${isExpanded ? 'expanded' : ''}">
                    <div class="emails-list">
                        ${plan.emails.map((email) => {
                            const customDest = email.customFolder ? `<span class="custom-destination">${email.customFolder}</span>` : '';
                            return `
                                <div class="email-item" data-email-id="${email.id}">
                                    <input type="checkbox" class="email-checkbox" ${email.selected !== false ? 'checked' : ''} 
                                           onchange="window.modernDomainOrganizer.toggleEmailSelection('${domain}', '${email.id}')"
                                           data-domain="${domain}" data-email-id="${email.id}">
                                    
                                    <div class="email-info">
                                        <div class="email-subject" title="${safeSubject(email)}">
                                            ${safeSubject(email)}
                                        </div>
                                        <div class="email-from">De: ${safeFrom(email)}</div>
                                    </div>
                                    
                                    <div class="email-date">${safeDate(email)}</div>
                                    
                                    <div class="email-actions">
                                        ${customDest}
                                        <button class="edit-email-btn" 
                                                onclick="window.modernDomainOrganizer.editEmailDestination('${domain}', '${email.id}')"
                                                title="Éditer la destination">
                                            ✏️
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            return div;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création élément domaine:', error);
            
            // Élément de fallback en cas d'erreur
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'domain-item error';
            fallbackDiv.innerHTML = `
                <div class="domain-header">
                    <div class="domain-info">
                        <div class="domain-name">❌ ${domain}</div>
                        <div class="domain-stats">Erreur d'affichage</div>
                    </div>
                </div>
            `;
            return fallbackDiv;
        }
    }

    // NOUVELLES FONCTIONS POUR L'ÉDITION INDIVIDUELLE
    
    editEmailDestination(domain, emailId) {
        try {
            console.log(`[ModernDomainOrganizer] Édition email ${emailId} du domaine ${domain}`);
            
            const plan = this.organizationPlan.get(domain);
            if (!plan) {
                this.showError('Domaine non trouvé');
                return;
            }
            
            const email = plan.emails.find(e => e.id === emailId);
            if (!email) {
                this.showError('Email non trouvé');
                return;
            }
            
            this.currentEditingEmail = { domain, emailId, email };
            this.showEmailEditModal(email, plan);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur édition email:', error);
            this.showError('Erreur lors de l\'ouverture de l\'éditeur: ' + error.message);
        }
    }

    showEmailEditModal(email, plan) {
        try {
            const modal = document.getElementById('emailModal');
            const modalBody = document.getElementById('emailModalBody');
            
            if (!modal || !modalBody) {
                throw new Error('Modal non trouvée');
            }
            
            const safeSubject = email.subject || '(Sans sujet)';
            const safeFrom = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
            const safeDate = new Date(email.receivedDateTime).toLocaleString();
            
            // Générer la liste des dossiers existants
            const existingFoldersOptions = Array.from(this.allFolders.values())
                .sort((a, b) => a.displayName.localeCompare(b.displayName))
                .map(folder => `
                    <div class="folder-option" onclick="window.modernDomainOrganizer.selectExistingFolder('${folder.displayName}', '${folder.id}')">
                        📁 ${folder.displayName}
                    </div>
                `).join('');
            
            // Déterminer la destination actuelle
            let currentDestination = 'domain';
            let customFolderValue = '';
            
            if (email.customFolder) {
                if (email.customFolderId) {
                    currentDestination = 'existing';
                } else {
                    currentDestination = 'custom';
                    customFolderValue = email.customFolder;
                }
            }
            
            modalBody.innerHTML = `
                <div class="email-detail">
                    <h4>📧 Détails de l'email</h4>
                    <div class="email-meta">
                        <span class="email-meta-label">Sujet:</span>
                        <span class="email-meta-value">${safeSubject}</span>
                        <span class="email-meta-label">De:</span>
                        <span class="email-meta-value">${safeFrom}</span>
                        <span class="email-meta-label">Date:</span>
                        <span class="email-meta-value">${safeDate}</span>
                    </div>
                </div>

                <div class="destination-editor">
                    <h4>🎯 Choisir la destination</h4>
                    
                    <div class="destination-options">
                        <div class="destination-option ${currentDestination === 'domain' ? 'selected' : ''}" 
                             onclick="window.modernDomainOrganizer.selectDestinationType('domain')">
                            <input type="radio" name="destinationType" value="domain" ${currentDestination === 'domain' ? 'checked' : ''}>
                            <div class="destination-info">
                                <div class="destination-name">📧 Dossier du domaine</div>
                                <div class="destination-description">Utiliser "${plan.targetFolder}" (par défaut)</div>
                            </div>
                        </div>

                        <div class="destination-option ${currentDestination === 'existing' ? 'selected' : ''}" 
                             onclick="window.modernDomainOrganizer.selectDestinationType('existing')">
                            <input type="radio" name="destinationType" value="existing" ${currentDestination === 'existing' ? 'checked' : ''}>
                            <div class="destination-info">
                                <div class="destination-name">📁 Dossier existant</div>
                                <div class="destination-description">Choisir un dossier déjà créé</div>
                            </div>
                        </div>
                        
                        <div class="existing-folders-list ${currentDestination === 'existing' ? '' : 'hidden'}" id="existingFoldersList">
                            ${existingFoldersOptions}
                        </div>

                        <div class="destination-option ${currentDestination === 'custom' ? 'selected' : ''}" 
                             onclick="window.modernDomainOrganizer.selectDestinationType('custom')">
                            <input type="radio" name="destinationType" value="custom" ${currentDestination === 'custom' ? 'checked' : ''}>
                            <div class="destination-info">
                                <div class="destination-name">✨ Nouveau dossier</div>
                                <div class="destination-description">Créer un nouveau dossier personnalisé</div>
                            </div>
                        </div>
                        
                        <input type="text" class="custom-folder-input ${currentDestination === 'custom' ? '' : 'hidden'}" 
                               id="customFolderInput" placeholder="Nom du nouveau dossier" value="${customFolderValue}">
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
            
            // Mettre le focus sur l'input si nécessaire
            if (currentDestination === 'custom') {
                setTimeout(() => {
                    const input = document.getElementById('customFolderInput');
                    if (input) input.focus();
                }, 100);
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage modal:', error);
            this.showError('Erreur lors de l\'affichage de l\'éditeur: ' + error.message);
        }
    }

    selectDestinationType(type) {
        try {
            // Mettre à jour les styles visuels
            document.querySelectorAll('.destination-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            document.querySelectorAll('input[name="destinationType"]').forEach(radio => {
                radio.checked = false;
            });
            
            const selectedOption = document.querySelector(`input[name="destinationType"][value="${type}"]`).parentElement;
            selectedOption.classList.add('selected');
            document.querySelector(`input[name="destinationType"][value="${type}"]`).checked = true;
            
            // Afficher/masquer les options appropriées
            const existingList = document.getElementById('existingFoldersList');
            const customInput = document.getElementById('customFolderInput');
            
            if (existingList) {
                existingList.classList.toggle('hidden', type !== 'existing');
            }
            
            if (customInput) {
                customInput.classList.toggle('hidden', type !== 'custom');
                if (type === 'custom') {
                    setTimeout(() => customInput.focus(), 100);
                }
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sélection type destination:', error);
        }
    }

    selectExistingFolder(folderName, folderId) {
        try {
            // Mettre à jour la sélection visuelle
            document.querySelectorAll('.folder-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            event.target.closest('.folder-option').classList.add('selected');
            
            // Stocker la sélection
            const existingList = document.getElementById('existingFoldersList');
            if (existingList) {
                existingList.dataset.selectedFolder = folderName;
                existingList.dataset.selectedFolderId = folderId;
            }
            
            console.log(`[ModernDomainOrganizer] Dossier existant sélectionné: ${folderName} (${folderId})`);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sélection dossier existant:', error);
        }
    }

    resetEmailDestination() {
        try {
            if (!this.currentEditingEmail) return;
            
            const { domain, emailId } = this.currentEditingEmail;
            const plan = this.organizationPlan.get(domain);
            const email = plan?.emails.find(e => e.id === emailId);
            
            if (email) {
                email.customFolder = null;
                email.customFolderId = null;
                
                console.log(`[ModernDomainOrganizer] Destination réinitialisée pour l'email ${emailId}`);
                
                // Fermer la modal et rafraîchir l'affichage
                this.closeEmailModal();
                this.showOrganizationPlan();
                this.showMessage('Destination réinitialisée', 'info');
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur reset destination:', error);
            this.showError('Erreur lors de la réinitialisation: ' + error.message);
        }
    }

    saveEmailChanges() {
        try {
            if (!this.currentEditingEmail) {
                this.showError('Aucun email en cours d\'édition');
                return;
            }
            
            const { domain, emailId } = this.currentEditingEmail;
            const plan = this.organizationPlan.get(domain);
            const email = plan?.emails.find(e => e.id === emailId);
            
            if (!email) {
                this.showError('Email non trouvé');
                return;
            }
            
            const selectedType = document.querySelector('input[name="destinationType"]:checked')?.value;
            
            if (!selectedType) {
                this.showError('Veuillez sélectionner un type de destination');
                return;
            }
            
            switch (selectedType) {
                case 'domain':
                    // Utiliser la destination par défaut du domaine
                    email.customFolder = null;
                    email.customFolderId = null;
                    console.log(`[ModernDomainOrganizer] Email ${emailId} utilise la destination du domaine: ${plan.targetFolder}`);
                    break;
                    
                case 'existing':
                    // Utiliser un dossier existant
                    const existingList = document.getElementById('existingFoldersList');
                    const selectedFolder = existingList?.dataset.selectedFolder;
                    const selectedFolderId = existingList?.dataset.selectedFolderId;
                    
                    if (!selectedFolder || !selectedFolderId) {
                        this.showError('Veuillez sélectionner un dossier existant');
                        return;
                    }
                    
                    email.customFolder = selectedFolder;
                    email.customFolderId = selectedFolderId;
                    console.log(`[ModernDomainOrganizer] Email ${emailId} assigné au dossier existant: ${selectedFolder}`);
                    break;
                    
                case 'custom':
                    // Créer un nouveau dossier
                    const customInput = document.getElementById('customFolderInput');
                    const customFolderName = customInput?.value?.trim();
                    
                    if (!customFolderName) {
                        this.showError('Veuillez saisir un nom de dossier');
                        return;
                    }
                    
                    // Vérifier si le dossier existe déjà
                    const existingFolder = this.findExistingFolderByName(customFolderName);
                    if (existingFolder) {
                        email.customFolder = existingFolder.displayName;
                        email.customFolderId = existingFolder.id;
                        console.log(`[ModernDomainOrganizer] Email ${emailId} assigné au dossier existant trouvé: ${existingFolder.displayName}`);
                    } else {
                        email.customFolder = customFolderName;
                        email.customFolderId = null; // Sera créé lors de l'exécution
                        console.log(`[ModernDomainOrganizer] Email ${emailId} assigné au nouveau dossier: ${customFolderName}`);
                    }
                    break;
                    
                default:
                    this.showError('Type de destination invalide');
                    return;
            }
            
            // Fermer la modal et rafraîchir l'affichage
            this.closeEmailModal();
            this.showOrganizationPlan();
            this.showMessage('Destination mise à jour avec succès', 'info');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sauvegarde email:', error);
            this.showError('Erreur lors de la sauvegarde: ' + error.message);
        }
    }

    resetAllCustomDestinations() {
        try {
            let resetCount = 0;
            
            this.organizationPlan.forEach((plan, domain) => {
                plan.emails.forEach(email => {
                    if (email.customFolder) {
                        email.customFolder = null;
                        email.customFolderId = null;
                        resetCount++;
                    }
                });
            });
            
            if (resetCount > 0) {
                this.showOrganizationPlan();
                this.showMessage(`${resetCount} destinations personnalisées réinitialisées`, 'info');
                console.log(`[ModernDomainOrganizer] ${resetCount} destinations réinitialisées`);
            } else {
                this.showMessage('Aucune destination personnalisée à réinitialiser', 'info');
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur reset toutes destinations:', error);
            this.showError('Erreur lors de la réinitialisation: ' + error.message);
        }
    }
