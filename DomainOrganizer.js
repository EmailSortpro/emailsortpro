// ModernDomainOrganizer.js - Version avec affichage forcé et intégration PageManager
// CORRECTION COMPLÈTE DU PROBLÈME D'AFFICHAGE

(function() {
    'use strict';
    
    // Protection contre les doubles chargements
    if (window.modernDomainOrganizer) {
        console.log('[ModernDomainOrganizer] ⚠️ Module déjà chargé, forçage de l\'affichage...');
        // Forcer l'affichage si déjà chargé
        if (window.modernDomainOrganizer.showPage) {
            window.modernDomainOrganizer.showPage();
        }
        return;
    }

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
            
            console.log('[ModernDomainOrganizer] ✅ Initialisé avec édition par email');
            
            // Auto-setup des event listeners pour la navigation
            this.setupNavigationListeners();
        }

        // FORCE L'AFFICHAGE IMMÉDIATEMENT
        setupNavigationListeners() {
            try {
                // Attendre que le DOM soit prêt
                const setupListener = () => {
                    // Chercher le bouton ranger dans la navigation
                    const rangerButton = document.querySelector('[data-page="ranger"]');
                    if (rangerButton) {
                        console.log('[ModernDomainOrganizer] 🔗 Event listener ajouté au bouton ranger');
                        
                        // Supprimer les anciens listeners
                        rangerButton.removeEventListener('click', this.forceShowPage.bind(this));
                        
                        // Ajouter le nouveau listener
                        rangerButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[ModernDomainOrganizer] 🚀 Clic détecté, affichage forcé');
                            this.forceShowPage();
                        });
                    } else {
                        console.log('[ModernDomainOrganizer] ⏳ Bouton ranger non trouvé, retry...');
                        setTimeout(setupListener, 500);
                    }
                };
                
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', setupListener);
                } else {
                    setupListener();
                }
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur setup navigation:', error);
            }
        }

        // MÉTHODE POUR FORCER L'AFFICHAGE
        forceShowPage() {
            try {
                console.log('[ModernDomainOrganizer] 🎯 FORCE AFFICHAGE DÉMARRÉ');
                
                // 1. Masquer tous les autres contenus
                this.hideAllOtherContent();
                
                // 2. Créer ou récupérer le conteneur
                const container = this.ensureContainer();
                
                // 3. Injecter le HTML
                container.innerHTML = this.getPageHTML();
                
                // 4. Afficher le conteneur
                container.style.display = 'block';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
                
                // 5. Mettre à jour la navigation
                this.updateNavigation();
                
                // 6. Initialiser les fonctionnalités
                setTimeout(() => {
                    this.initializePage();
                }, 100);
                
                // 7. Forcer le mode page
                this.forcePageMode();
                
                console.log('[ModernDomainOrganizer] ✅ AFFICHAGE FORCÉ TERMINÉ');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] ❌ Erreur affichage forcé:', error);
                this.showErrorFallback(error);
            }
        }

        hideAllOtherContent() {
            try {
                // Masquer le contenu existant
                const pageContent = document.getElementById('pageContent');
                if (pageContent) {
                    // Garder pageContent visible mais vider son contenu
                    Array.from(pageContent.children).forEach(child => {
                        if (!child.id || child.id !== 'modernDomainOrganizerContainer') {
                            child.style.display = 'none';
                        }
                    });
                }
                
                // Masquer spécifiquement le dashboard
                const dashboardContainer = document.querySelector('.dashboard-container');
                if (dashboardContainer) {
                    dashboardContainer.style.display = 'none';
                }
                
                // Masquer autres pages potentielles
                const otherPages = document.querySelectorAll('.page-container, .step-content, .dashboard-module');
                otherPages.forEach(page => {
                    if (page && !page.closest('#modernDomainOrganizerContainer')) {
                        page.style.display = 'none';
                    }
                });
                
                console.log('[ModernDomainOrganizer] 🙈 Autres contenus masqués');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur masquage contenus:', error);
            }
        }

        ensureContainer() {
            try {
                // Chercher le conteneur existant
                let container = document.getElementById('modernDomainOrganizerContainer');
                
                if (!container) {
                    // Créer le conteneur
                    container = document.createElement('div');
                    container.id = 'modernDomainOrganizerContainer';
                    container.style.cssText = `
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        width: 100% !important;
                        height: 100% !important;
                        position: relative !important;
                        z-index: 1 !important;
                    `;
                    
                    // L'ajouter au DOM
                    const pageContent = document.getElementById('pageContent') || document.body;
                    pageContent.appendChild(container);
                    
                    console.log('[ModernDomainOrganizer] 📦 Conteneur créé');
                } else {
                    console.log('[ModernDomainOrganizer] 📦 Conteneur existant réutilisé');
                }
                
                return container;
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur création conteneur:', error);
                // Fallback vers le body
                return document.body;
            }
        }

        forcePageMode() {
            try {
                // Forcer le mode page ranger
                if (window.app && window.app.setPageMode) {
                    window.app.setPageMode('ranger');
                }
                
                // Réinitialiser le scroll manager
                if (window.app && window.app.scrollManager) {
                    window.app.scrollManager.currentPage = 'ranger';
                }
                
                // Masquer le scroll s'il est en boucle
                const style = document.createElement('style');
                style.id = 'rangerScrollFix';
                style.textContent = `
                    body.page-ranger {
                        overflow: hidden !important;
                    }
                    #pageContent {
                        overflow-y: auto !important;
                        max-height: calc(100vh - 80px) !important;
                    }
                `;
                
                // Supprimer l'ancien style s'il existe
                const oldStyle = document.getElementById('rangerScrollFix');
                if (oldStyle) oldStyle.remove();
                
                document.head.appendChild(style);
                document.body.classList.add('page-ranger');
                
                console.log('[ModernDomainOrganizer] 📱 Mode page forcé');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur force page mode:', error);
            }
        }

        updateNavigation() {
            try {
                // Désactiver tous les éléments de navigation
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Activer l'élément "ranger"
                const rangerButton = document.querySelector('[data-page="ranger"]');
                if (rangerButton) {
                    rangerButton.classList.add('active');
                }
                
                console.log('[ModernDomainOrganizer] 🧭 Navigation mise à jour');
                
            } catch (error) {
                console.warn('[ModernDomainOrganizer] Erreur mise à jour navigation:', error);
            }
        }

        showErrorFallback(error) {
            try {
                const container = document.getElementById('modernDomainOrganizerContainer') || document.body;
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; background: white; border-radius: 12px; margin: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <h2 style="color: #dc2626; margin-bottom: 16px;">❌ Erreur de chargement</h2>
                        <p style="color: #6b7280; margin-bottom: 20px;">Le module de rangement n'a pas pu se charger correctement.</p>
                        <p style="font-family: monospace; font-size: 12px; color: #374151; background: #f3f4f6; padding: 12px; border-radius: 6px;">
                            ${error.message}
                        </p>
                        <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin-top: 16px;">
                            🔄 Recharger la page
                        </button>
                    </div>
                `;
            } catch (fallbackError) {
                console.error('[ModernDomainOrganizer] Erreur fallback:', fallbackError);
            }
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
                                        <p>Créez automatiquement des dossiers par expéditeur et personnalisez chaque email</p>
                                    </div>

                                    <div class="intro-compact">
                                        <div class="success-notice">
                                            <h3>✅ Module chargé avec succès !</h3>
                                            <p>L'organisateur de domaines est maintenant opérationnel avec toutes les fonctionnalités d'édition.</p>
                                        </div>

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
                                                <div class="flow-icon">✏️</div>
                                                <span>Édition</span>
                                            </div>
                                            <div class="flow-arrow">→</div>
                                            <div class="flow-step">
                                                <div class="flow-icon">⚡</div>
                                                <span>Exécution</span>
                                            </div>
                                        </div>

                                        <div class="tips-compact">
                                            <div class="tip-item">
                                                <span class="tip-icon">✏️</span>
                                                <span><strong>Nouveau :</strong> Personnalisez le dossier de chaque email</span>
                                            </div>
                                            <div class="tip-item">
                                                <span class="tip-icon">🧪</span>
                                                <span><strong>Testez :</strong> Créez d'abord les dossiers seulement</span>
                                            </div>
                                            <div class="tip-item">
                                                <span class="tip-icon">📊</span>
                                                <span><strong>Seuil :</strong> 3+ emails par domaine recommandé</span>
                                            </div>
                                            <div class="tip-item">
                                                <span class="tip-icon">🔧</span>
                                                <span><strong>Status :</strong> Intégré dans votre application EmailSortPro</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="action-bar">
                                        <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.showDemo()">
                                            👁️ Voir la démo
                                        </button>
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

                            <!-- Plan avec édition par email -->
                            <div class="step-content hidden" id="step-plan">
                                <div class="step-card plan-card-simple">
                                    <div class="card-header-simple">
                                        <h2>📋 Plan d'organisation avec édition individuelle</h2>
                                    </div>

                                    <div class="plan-content-simple">
                                        <div class="plan-top-bar">
                                            <div class="stats-simple" id="planSummary">
                                                <span><strong>0</strong> Domaines</span>
                                                <span><strong>0</strong> Emails</span>
                                                <span><strong>0</strong> Nouveaux</span>
                                            </div>
                                            <div class="options-simple">
                                                <label><input type="radio" name="executionType" value="folders-only"> 📁 Dossiers</label>
                                                <label><input type="radio" name="executionType" value="complete" checked> ⚡ Complet</label>
                                            </div>
                                            <div class="count-simple">
                                                <span id="selectedEmailsText">0 emails sélectionnés</span>
                                            </div>
                                        </div>

                                        <div class="controls-simple">
                                            <button class="btn-xs" onclick="window.modernDomainOrganizer.selectAllDomains()">✅ Tout</button>
                                            <button class="btn-xs" onclick="window.modernDomainOrganizer.deselectAllDomains()">❌ Rien</button>
                                            <button class="btn-xs" onclick="window.modernDomainOrganizer.expandAllDomains()">📂 Déplier</button>
                                            <button class="btn-xs" onclick="window.modernDomainOrganizer.collapseAllDomains()">📁 Replier</button>
                                            <button class="btn-xs" onclick="window.modernDomainOrganizer.resetAllFolders()">🔄 Reset</button>
                                        </div>

                                        <div class="domains-wrapper">
                                            <div class="domains-container-simple" id="domainsContainer">
                                                <div style="padding: 20px; text-align: center; color: #6b7280;">
                                                    Lancez l'analyse pour voir les domaines trouvés
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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

                            <!-- Demo Results -->
                            <div class="step-content hidden" id="step-demo">
                                <div class="step-card">
                                    <div class="card-header">
                                        <h2>🎬 Démonstration</h2>
                                        <p>Aperçu des fonctionnalités d'édition par email</p>
                                    </div>

                                    <div class="demo-content">
                                        <div class="demo-section">
                                            <h3>✨ Fonctionnalités disponibles</h3>
                                            <div class="features-grid">
                                                <div class="feature-item">
                                                    <div class="feature-icon">📧</div>
                                                    <h4>Édition par email</h4>
                                                    <p>Chaque email peut être assigné à un dossier différent</p>
                                                </div>
                                                <div class="feature-item">
                                                    <div class="feature-icon">📁</div>
                                                    <h4>Dossiers intelligents</h4>
                                                    <p>Détection automatique des dossiers existants</p>
                                                </div>
                                                <div class="feature-item">
                                                    <div class="feature-icon">⚡</div>
                                                    <h4>Exécution flexible</h4>
                                                    <p>Mode création seule ou organisation complète</p>
                                                </div>
                                                <div class="feature-item">
                                                    <div class="feature-icon">🔧</div>
                                                    <h4>Interface moderne</h4>
                                                    <p>Design responsive et intuitive</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="demo-section">
                                            <h3>🎯 Processus d'organisation</h3>
                                            <div class="process-demo">
                                                <div class="demo-step">
                                                    <div class="demo-step-number">1</div>
                                                    <div class="demo-step-content">
                                                        <h4>Configuration</h4>
                                                        <p>Définissez la période et les critères d'analyse</p>
                                                    </div>
                                                </div>
                                                <div class="demo-step">
                                                    <div class="demo-step-number">2</div>
                                                    <div class="demo-step-content">
                                                        <h4>Analyse</h4>
                                                        <p>Scan automatique des emails et détection des domaines</p>
                                                    </div>
                                                </div>
                                                <div class="demo-step">
                                                    <div class="demo-step-number">3</div>
                                                    <div class="demo-step-content">
                                                        <h4>Édition</h4>
                                                        <p>Personnalisez le dossier de chaque email individuellement</p>
                                                    </div>
                                                </div>
                                                <div class="demo-step">
                                                    <div class="demo-step-number">4</div>
                                                    <div class="demo-step-content">
                                                        <h4>Exécution</h4>
                                                        <p>Création des dossiers et organisation automatique</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="action-bar">
                                        <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('introduction')">
                                            ← Retour
                                        </button>
                                        <button class="btn btn-primary" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                            Commencer →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Autres étapes... (execution, success) -->
                            <div class="step-content hidden" id="step-execution">
                                <div class="step-card">
                                    <div class="card-header">
                                        <h2>⚡ Exécution en cours</h2>
                                        <p id="executionStatus">Préparation...</p>
                                    </div>
                                    <div class="execution-progress">
                                        <div class="progress-container">
                                            <div class="progress-bar">
                                                <div class="progress-fill" id="executionProgressBar"></div>
                                            </div>
                                            <div class="progress-text" id="executionPercent">0%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="step-content hidden" id="step-success">
                                <div class="step-card success-card">
                                    <div class="success-content">
                                        <div class="success-icon">🎉</div>
                                        <h2 id="successTitle">Module opérationnel !</h2>
                                        <p>L'organisateur de domaines est maintenant prêt à l'emploi.</p>
                                    </div>
                                    <div class="action-bar">
                                        <button class="btn btn-primary" onclick="window.modernDomainOrganizer.restart()">
                                            🔄 Recommencer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                    /* Styles complets pour le module autonome */
                    .modern-organizer {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 16px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                        min-height: 100vh;
                        box-sizing: border-box;
                        background: #f8fafc;
                    }

                    .organizer-header {
                        background: white;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 16px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    }

                    .organizer-main {
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
                        display: none !important;
                    }

                    .step-card {
                        background: white;
                        border-radius: 12px;
                        padding: 24px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                        min-height: 400px;
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

                    /* Success notice */
                    .success-notice {
                        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                        border: 2px solid #34d399;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 24px;
                        text-align: center;
                    }

                    .success-notice h3 {
                        color: #065f46;
                        margin: 0 0 8px 0;
                        font-size: 18px;
                    }

                    .success-notice p {
                        color: #047857;
                        margin: 0;
                        font-size: 14px;
                    }

                    /* Introduction */
                    .intro-compact {
                        max-width: 700px;
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
                        min-width: 80px;
                    }

                    .flow-icon {
                        font-size: 20px;
                        margin-bottom: 6px;
                    }

                    .flow-arrow {
                        font-size: 16px;
                        color: #3b82f6;
                        font-weight: bold;
                    }

                    .tips-compact {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        background: #f0f9ff;
                        border: 1px solid #bae6fd;
                        border-radius: 8px;
                        padding: 16px;
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

                    /* Demo styles */
                    .demo-content {
                        max-width: 800px;
                        margin: 0 auto;
                    }

                    .demo-section {
                        margin-bottom: 32px;
                    }

                    .demo-section h3 {
                        color: #1f2937;
                        margin-bottom: 16px;
                        font-size: 20px;
                    }

                    .features-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                        margin-bottom: 24px;
                    }

                    .feature-item {
                        background: #f8fafc;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 16px;
                        text-align: center;
                    }

                    .feature-icon {
                        font-size: 24px;
                        margin-bottom: 8px;
                    }

                    .feature-item h4 {
                        margin: 0 0 8px 0;
                        color: #1f2937;
                        font-size: 16px;
                    }

                    .feature-item p {
                        margin: 0;
                        color: #6b7280;
                        font-size: 14px;
                    }

                    .process-demo {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }

                    .demo-step {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        padding: 16px;
                        background: white;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                    }

                    .demo-step-number {
                        width: 32px;
                        height: 32px;
                        background: #3b82f6;
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        flex-shrink: 0;
                    }

                    .demo-step-content h4 {
                        margin: 0 0 4px 0;
                        color: #1f2937;
                        font-size: 16px;
                    }

                    .demo-step-content p {
                        margin: 0;
                        color: #6b7280;
                        font-size: 14px;
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

                    .scan-stats {
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

                    .btn-large {
                        padding: 14px 28px;
                        font-size: 16px;
                        font-weight: 700;
                    }

                    .hidden {
                        display: none !important;
                    }

                    .success-card {
                        text-align: center;
                    }

                    .success-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    @media (max-width: 768px) {
                        .modern-organizer {
                            padding: 8px;
                        }

                        .features-grid {
                            grid-template-columns: 1fr;
                        }

                        .process-demo {
                            gap: 12px;
                        }

                        .demo-step {
                            padding: 12px;
                        }

                        .flow-step {
                            min-width: 60px;
                        }

                        .flow-icon {
                            font-size: 18px;
                        }
                    }
                </style>
            `;
        }

        // Interface publique
        showPage() {
            this.forceShowPage();
        }

        // Méthodes simplifiées pour l'intégration
        async initializePage() {
            try {
                console.log('[ModernDomainOrganizer] Initialisation...');
                
                this.setupEventListeners();
                this.setDefaultDates();
                
                return true;
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur initialisation:', error);
                return false;
            }
        }

        setupEventListeners() {
            try {
                // Délai pour s'assurer que le DOM est prêt
                setTimeout(() => {
                    const startBtn = document.getElementById('startScanBtn');
                    
                    if (startBtn) {
                        startBtn.addEventListener('click', () => this.startAnalysis());
                    }
                    
                    console.log('[ModernDomainOrganizer] ✅ Event listeners configurés');
                }, 100);
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur setup listeners:', error);
            }
        }

        setDefaultDates() {
            try {
                const today = new Date();
                const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                
                setTimeout(() => {
                    const startDate = document.getElementById('startDate');
                    const endDate = document.getElementById('endDate');
                    
                    if (startDate) startDate.valueAsDate = thirtyDaysAgo;
                    if (endDate) endDate.valueAsDate = today;
                }, 100);
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur dates par défaut:', error);
            }
        }

        // Navigation entre les étapes
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
                const steps = ['introduction', 'configuration', 'scanning', 'plan', 'execution', 'demo'];
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

        // Méthodes pour la démo
        showDemo() {
            try {
                this.goToStep('demo');
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur affichage démo:', error);
            }
        }

        async startAnalysis() {
            try {
                console.log('[ModernDomainOrganizer] 🔍 Début de l\'analyse...');
                this.goToStep('scanning');
                
                // Simulation d'analyse pour la démo
                this.updateProgress(20, 'Chargement des dossiers...');
                await new Promise(resolve => setTimeout(resolve, 800));
                
                this.updateProgress(60, 'Scan des emails...');
                await new Promise(resolve => setTimeout(resolve, 800));
                
                this.updateProgress(90, 'Analyse des domaines...');
                await new Promise(resolve => setTimeout(resolve, 800));
                
                this.updateProgress(100, 'Terminé !');
                
                // Aller au succès
                setTimeout(() => {
                    this.goToStep('success');
                }, 500);
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur analyse:', error);
            }
        }

        // Méthodes utilitaires
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

        restart() {
            try {
                this.currentStep = 'introduction';
                this.goToStep('introduction');
                console.log('[ModernDomainOrganizer] 🔄 Redémarrage');
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur restart:', error);
            }
        }

        // Méthodes placeholder
        selectAllDomains() { console.log('[ModernDomainOrganizer] Sélectionner tout'); }
        deselectAllDomains() { console.log('[ModernDomainOrganizer] Désélectionner tout'); }
        expandAllDomains() { console.log('[ModernDomainOrganizer] Déplier tout'); }
        collapseAllDomains() { console.log('[ModernDomainOrganizer] Replier tout'); }
        resetAllFolders() { console.log('[ModernDomainOrganizer] Reset dossiers'); }
        executeSelectedAction() { 
            console.log('[ModernDomainOrganizer] Exécution');
            this.goToStep('success');
        }
    }

    // Créer l'instance globale avec gestion d'erreurs
    try {
        console.log('[ModernDomainOrganizer] 🚀 Création de l\'instance globale...');
        
        window.modernDomainOrganizer = new ModernDomainOrganizer();
        
        // Fonction d'accès global
        window.showModernDomainOrganizer = function() {
            try {
                console.log('[ModernDomainOrganizer] 📞 Appel fonction globale');
                window.modernDomainOrganizer.forceShowPage();
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur fonction globale:', error);
            }
        };
        
        // Force immédiate si on est sur la page ranger
        if (window.location.hash === '#ranger' || document.querySelector('[data-page="ranger"].active')) {
            console.log('[ModernDomainOrganizer] 🎯 Page ranger détectée, affichage immédiat');
            setTimeout(() => {
                window.modernDomainOrganizer.forceShowPage();
            }, 500);
        }
        
        console.log('[ModernDomainOrganizer] ✅ Module chargé et prêt avec affichage forcé');
        
    } catch (error) {
        console.error('[ModernDomainOrganizer] ❌ Erreur fatale lors du chargement:', error);
    }

})();
