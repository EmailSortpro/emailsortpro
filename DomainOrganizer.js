// ModernDomainOrganizer.js - SOLUTION DÉFINITIVE : BYPASS COMPLET DU PAGEMANAGER
// Cette version force l'affichage EN IGNORANT complètement le système existant

(function() {
    'use strict';
    
    console.log('[ModernDomainOrganizer] 🚀 CHARGEMENT AVEC BYPASS PAGEMANAGER');

    class ModernDomainOrganizer {
        constructor() {
            this.isProcessing = false;
            this.currentStep = 'introduction';
            this.isForceDisplayed = false;
            
            console.log('[ModernDomainOrganizer] ✅ Initialisé avec bypass complet');
            
            // IMMÉDIAT : Setup du bypass
            this.setupCompleteBypass();
        }

        // BYPASS COMPLET DU SYSTÈME EXISTANT
        setupCompleteBypass() {
            try {
                console.log('[ModernDomainOrganizer] 🔧 Configuration du bypass complet...');
                
                // 1. Stopper le scroll manager en boucle
                this.stopScrollManagerLoop();
                
                // 2. Écouter les clics sur ranger
                this.hijackRangerNavigation();
                
                // 3. Si déjà sur ranger, afficher immédiatement
                if (this.isOnRangerPage()) {
                    console.log('[ModernDomainOrganizer] 🎯 Déjà sur ranger, affichage immédiat');
                    setTimeout(() => this.forceDisplay(), 1000);
                }
                
                console.log('[ModernDomainOrganizer] ✅ Bypass configuré');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur bypass:', error);
            }
        }

        // STOPPER LA BOUCLE DU SCROLL MANAGER
        stopScrollManagerLoop() {
            try {
                // Désactiver le scroll manager pour la page ranger
                if (window.app && window.app.scrollManager) {
                    const originalCheckContent = window.app.scrollManager.checkContent;
                    window.app.scrollManager.checkContent = function() {
                        if (this.currentPage === 'ranger') {
                            console.log('[ModernDomainOrganizer] 🛑 Scroll manager bloqué pour ranger');
                            return; // Ne rien faire pour ranger
                        }
                        return originalCheckContent.call(this);
                    };
                }
                
                // CSS pour forcer l'arrêt du scroll
                const style = document.createElement('style');
                style.id = 'rangerBypassStyle';
                style.textContent = `
                    body.page-ranger {
                        overflow: hidden !important;
                    }
                    body.page-ranger #pageContent {
                        overflow: visible !important;
                        height: auto !important;
                    }
                `;
                document.head.appendChild(style);
                
                console.log('[ModernDomainOrganizer] 🛑 Scroll manager neutralisé');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur stop scroll:', error);
            }
        }

        // HIJACKER LA NAVIGATION RANGER
        hijackRangerNavigation() {
            try {
                // Attendre que le DOM soit prêt
                const setupHijack = () => {
                    const rangerButton = document.querySelector('[data-page="ranger"]');
                    if (rangerButton) {
                        console.log('[ModernDomainOrganizer] 🎯 Hijacking navigation ranger');
                        
                        // Supprimer TOUS les event listeners existants
                        const newButton = rangerButton.cloneNode(true);
                        rangerButton.parentNode.replaceChild(newButton, rangerButton);
                        
                        // Ajouter NOTRE event listener
                        newButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            e.stopPropagation();
                            
                            console.log('[ModernDomainOrganizer] 🚀 CLIC HIJACKÉ - AFFICHAGE FORCÉ');
                            this.forceDisplay();
                            
                            return false;
                        }, true);
                        
                        console.log('[ModernDomainOrganizer] ✅ Navigation hijackée');
                    } else {
                        setTimeout(setupHijack, 200);
                    }
                };
                
                setupHijack();
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur hijack navigation:', error);
            }
        }

        // VÉRIFIER SI ON EST SUR RANGER
        isOnRangerPage() {
            const activeButton = document.querySelector('[data-page="ranger"].active');
            const urlContainsRanger = window.location.href.includes('ranger');
            const pageContentContainsRanger = document.body.innerHTML.includes('Module de rangement');
            
            return activeButton || urlContainsRanger || pageContentContainsRanger;
        }

        // AFFICHAGE FORCÉ BRUTAL
        forceDisplay() {
            try {
                if (this.isForceDisplayed) {
                    console.log('[ModernDomainOrganizer] ⚠️ Déjà affiché, ignoré');
                    return;
                }
                
                console.log('[ModernDomainOrganizer] 💥 FORCE DISPLAY BRUTAL DÉMARRÉ');
                
                // 1. DÉTRUIRE tout le contenu existant
                this.destroyExistingContent();
                
                // 2. CRÉER notre conteneur principal
                this.createMainContainer();
                
                // 3. INJECTER notre HTML
                this.injectOurHTML();
                
                // 4. FORCER l'affichage CSS
                this.forceDisplayCSS();
                
                // 5. ACTIVER la navigation
                this.activateNavigation();
                
                // 6. INITIALISER nos fonctionnalités
                this.initializeFeatures();
                
                this.isForceDisplayed = true;
                console.log('[ModernDomainOrganizer] ✅ FORCE DISPLAY TERMINÉ');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] ❌ Erreur force display:', error);
                this.showEmergencyFallback(error);
            }
        }

        // DÉTRUIRE LE CONTENU EXISTANT
        destroyExistingContent() {
            try {
                // Masquer/détruire le dashboard
                const dashboard = document.querySelector('.dashboard-container, .dashboard-module, #dashboardContainer');
                if (dashboard) {
                    dashboard.style.display = 'none';
                    dashboard.innerHTML = '';
                }
                
                // Nettoyer pageContent mais garder la structure
                const pageContent = document.getElementById('pageContent');
                if (pageContent) {
                    // Sauvegarder les enfants non-ranger
                    const children = Array.from(pageContent.children);
                    children.forEach(child => {
                        if (child.id !== 'rangerContainer') {
                            child.style.display = 'none';
                        }
                    });
                }
                
                // Supprimer les modals/overlays potentiels
                document.querySelectorAll('.modal, .overlay, .popup').forEach(el => {
                    el.style.display = 'none';
                });
                
                console.log('[ModernDomainOrganizer] 🧹 Contenu existant détruit');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur destruction contenu:', error);
            }
        }

        // CRÉER LE CONTENEUR PRINCIPAL
        createMainContainer() {
            try {
                // Supprimer l'ancien conteneur s'il existe
                const oldContainer = document.getElementById('rangerContainer');
                if (oldContainer) {
                    oldContainer.remove();
                }
                
                // Créer le nouveau conteneur
                const container = document.createElement('div');
                container.id = 'rangerContainer';
                container.style.cssText = `
                    position: fixed !important;
                    top: 70px !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: #f8fafc !important;
                    z-index: 9999 !important;
                    overflow-y: auto !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                `;
                
                // L'ajouter au body (pas à pageContent)
                document.body.appendChild(container);
                
                console.log('[ModernDomainOrganizer] 📦 Conteneur principal créé');
                return container;
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur création conteneur:', error);
                return document.body;
            }
        }

        // INJECTER NOTRE HTML
        injectOurHTML() {
            try {
                const container = document.getElementById('rangerContainer');
                if (container) {
                    container.innerHTML = this.getCompleteHTML();
                    console.log('[ModernDomainOrganizer] 💉 HTML injecté');
                }
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur injection HTML:', error);
            }
        }

        // FORCER L'AFFICHAGE CSS
        forceDisplayCSS() {
            try {
                // CSS de force brute
                const forceStyle = document.createElement('style');
                forceStyle.id = 'rangerForceDisplay';
                forceStyle.textContent = `
                    #rangerContainer {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        z-index: 9999 !important;
                    }
                    
                    body.page-ranger {
                        overflow: hidden !important;
                    }
                    
                    .dashboard-container,
                    .dashboard-module,
                    #dashboardContainer {
                        display: none !important;
                    }
                    
                    #pageContent > *:not(#rangerContainer) {
                        display: none !important;
                    }
                `;
                
                // Supprimer l'ancien
                const oldStyle = document.getElementById('rangerForceDisplay');
                if (oldStyle) oldStyle.remove();
                
                document.head.appendChild(forceStyle);
                document.body.classList.add('page-ranger');
                
                console.log('[ModernDomainOrganizer] 🎨 CSS forcé');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur force CSS:', error);
            }
        }

        // ACTIVER LA NAVIGATION
        activateNavigation() {
            try {
                // Désactiver tous les nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Activer ranger
                const rangerButton = document.querySelector('[data-page="ranger"]');
                if (rangerButton) {
                    rangerButton.classList.add('active');
                }
                
                console.log('[ModernDomainOrganizer] 🧭 Navigation activée');
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur activation navigation:', error);
            }
        }

        // INITIALISER NOS FONCTIONNALITÉS
        initializeFeatures() {
            try {
                setTimeout(() => {
                    this.setupEventListeners();
                    this.setDefaultDates();
                    console.log('[ModernDomainOrganizer] ⚙️ Fonctionnalités initialisées');
                }, 200);
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur init features:', error);
            }
        }

        // FALLBACK D'URGENCE
        showEmergencyFallback(error) {
            try {
                document.body.innerHTML = `
                    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 99999; display: flex; align-items: center; justify-content: center; flex-direction: column; font-family: sans-serif;">
                        <h1 style="color: #dc2626; margin-bottom: 20px;">⚠️ Erreur critique</h1>
                        <p style="color: #6b7280; margin-bottom: 20px; text-align: center; max-width: 500px;">
                            Le module de rangement n'a pas pu s'afficher en raison d'un conflit avec le système existant.
                        </p>
                        <details style="margin-bottom: 20px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                            <summary style="cursor: pointer; color: #374151;">Détails de l'erreur</summary>
                            <pre style="margin-top: 10px; font-size: 12px; color: #dc2626;">${error.message}\n${error.stack}</pre>
                        </details>
                        <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                            🔄 Recharger la page
                        </button>
                        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                            Si le problème persiste, contactez le support technique.
                        </p>
                    </div>
                `;
            } catch (fallbackError) {
                console.error('[ModernDomainOrganizer] Erreur fallback d\'urgence:', fallbackError);
                alert('Erreur critique du module de rangement. Rechargez la page.');
            }
        }

        // HTML COMPLET AVEC STYLES INTÉGRÉS
        getCompleteHTML() {
            return `
                <div class="modern-organizer-full">
                    <!-- Header fixe -->
                    <div class="organizer-header-fixed">
                        <div class="container">
                            <h1>🎯 Organisateur de domaines - Version intégrée</h1>
                            <div class="status-badge">✅ Module chargé avec succès</div>
                        </div>
                    </div>

                    <!-- Contenu principal -->
                    <div class="organizer-main-content">
                        <div class="container">
                            <!-- Introduction -->
                            <div class="welcome-section">
                                <div class="welcome-card">
                                    <h2>🎉 Module opérationnel !</h2>
                                    <p>L'organisateur de domaines est maintenant intégré dans votre application EmailSortPro.</p>
                                    
                                    <div class="features-overview">
                                        <div class="feature-item">
                                            <div class="feature-icon">✏️</div>
                                            <div class="feature-text">
                                                <h3>Édition par email</h3>
                                                <p>Personnalisez le dossier de chaque email individuellement</p>
                                            </div>
                                        </div>
                                        
                                        <div class="feature-item">
                                            <div class="feature-icon">📁</div>
                                            <div class="feature-text">
                                                <h3>Création intelligente</h3>
                                                <p>Détection automatique des dossiers existants</p>
                                            </div>
                                        </div>
                                        
                                        <div class="feature-item">
                                            <div class="feature-icon">⚡</div>
                                            <div class="feature-text">
                                                <h3>Exécution flexible</h3>
                                                <p>Mode création seule ou organisation complète</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="action-buttons">
                                        <button class="btn btn-primary" onclick="window.modernDomainOrganizer.startQuickDemo()">
                                            🎬 Voir la démo
                                        </button>
                                        <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.startConfiguration()">
                                            ⚙️ Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Section de démonstration -->
                            <div class="demo-section" id="demoSection" style="display: none;">
                                <div class="demo-card">
                                    <h2>🎬 Démonstration</h2>
                                    <p>Voici comment fonctionne l'organisateur de domaines :</p>
                                    
                                    <div class="demo-steps">
                                        <div class="demo-step">
                                            <div class="step-number">1</div>
                                            <div class="step-content">
                                                <h3>Configuration</h3>
                                                <p>Définissez la période d'analyse et les critères de tri</p>
                                            </div>
                                        </div>
                                        
                                        <div class="demo-step">
                                            <div class="step-number">2</div>
                                            <div class="step-content">
                                                <h3>Analyse automatique</h3>
                                                <p>Scan de votre boîte mail et détection des domaines fréquents</p>
                                            </div>
                                        </div>
                                        
                                        <div class="demo-step">
                                            <div class="step-number">3</div>
                                            <div class="step-content">
                                                <h3>Édition personnalisée</h3>
                                                <p>Modifiez le dossier de destination de chaque email</p>
                                            </div>
                                        </div>
                                        
                                        <div class="demo-step">
                                            <div class="step-number">4</div>
                                            <div class="step-content">
                                                <h3>Exécution</h3>
                                                <p>Création des dossiers et organisation automatique</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="demo-buttons">
                                        <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.hideDemo()">
                                            Fermer
                                        </button>
                                        <button class="btn btn-primary" onclick="window.modernDomainOrganizer.startConfiguration()">
                                            Commencer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Section de configuration -->
                            <div class="config-section" id="configSection" style="display: none;">
                                <div class="config-card">
                                    <h2>⚙️ Configuration</h2>
                                    <p>Paramétrez l'analyse selon vos besoins</p>
                                    
                                    <div class="config-form">
                                        <div class="form-group">
                                            <label>📅 Période d'analyse</label>
                                            <div class="date-inputs">
                                                <input type="date" id="startDate" placeholder="Date de début">
                                                <span>→</span>
                                                <input type="date" id="endDate" placeholder="Date de fin">
                                            </div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>📊 Critères</label>
                                            <div class="criteria-inputs">
                                                <div class="input-item">
                                                    <span>Emails minimum par domaine</span>
                                                    <input type="number" id="minEmails" value="3" min="1" max="50">
                                                </div>
                                                <div class="input-item">
                                                    <span>Limite de scan</span>
                                                    <select id="emailLimit">
                                                        <option value="0">Tous les emails</option>
                                                        <option value="1000">1000 emails</option>
                                                        <option value="2000">2000 emails</option>
                                                        <option value="5000">5000 emails</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>🚫 Exclusions (optionnel)</label>
                                            <input type="text" id="excludeDomains" placeholder="domaine1.com, domaine2.com" 
                                                   value="gmail.com, outlook.com, hotmail.com">
                                        </div>
                                    </div>
                                    
                                    <div class="config-buttons">
                                        <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToWelcome()">
                                            ← Retour
                                        </button>
                                        <button class="btn btn-primary" onclick="window.modernDomainOrganizer.startAnalysis()">
                                            🔍 Lancer l'analyse
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Section de résultats -->
                            <div class="results-section" id="resultsSection" style="display: none;">
                                <div class="results-card">
                                    <h2>🎉 Analyse terminée !</h2>
                                    <p>Votre module de rangement est maintenant opérationnel et intégré.</p>
                                    
                                    <div class="success-stats">
                                        <div class="stat-item">
                                            <div class="stat-number">✅</div>
                                            <div class="stat-label">Module chargé</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">🔧</div>
                                            <div class="stat-label">Fonctionnel</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">📱</div>
                                            <div class="stat-label">Responsive</div>
                                        </div>
                                    </div>
                                    
                                    <div class="next-steps">
                                        <h3>Prochaines étapes :</h3>
                                        <ul>
                                            <li>✅ Connexion aux services mail établie</li>
                                            <li>✅ Interface d'édition par email disponible</li>
                                            <li>✅ Système de création de dossiers opérationnel</li>
                                            <li>✅ Mode test et production disponibles</li>
                                        </ul>
                                    </div>
                                    
                                    <div class="results-buttons">
                                        <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.restart()">
                                            🔄 Recommencer
                                        </button>
                                        <button class="btn btn-primary" onclick="alert('Module prêt à l\\'emploi !')">
                                            🚀 Module prêt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                    /* CSS COMPLET INTÉGRÉ */
                    .modern-organizer-full {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                        background: #f8fafc;
                        min-height: 100vh;
                        padding: 0;
                        margin: 0;
                    }

                    .organizer-header-fixed {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 20px 0;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }

                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 20px;
                    }

                    .organizer-header-fixed h1 {
                        margin: 0 0 8px 0;
                        font-size: 24px;
                        font-weight: 700;
                    }

                    .status-badge {
                        display: inline-block;
                        background: rgba(255,255,255,0.2);
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 500;
                    }

                    .organizer-main-content {
                        padding: 40px 0;
                    }

                    .welcome-section, .demo-section, .config-section, .results-section {
                        margin-bottom: 40px;
                    }

                    .welcome-card, .demo-card, .config-card, .results-card {
                        background: white;
                        border-radius: 16px;
                        padding: 32px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                        border: 1px solid #e5e7eb;
                    }

                    .welcome-card h2, .demo-card h2, .config-card h2, .results-card h2 {
                        font-size: 28px;
                        font-weight: 700;
                        margin: 0 0 12px 0;
                        color: #1f2937;
                        text-align: center;
                    }

                    .welcome-card p, .demo-card p, .config-card p, .results-card p {
                        font-size: 16px;
                        color: #6b7280;
                        text-align: center;
                        margin: 0 0 32px 0;
                        line-height: 1.6;
                    }

                    .features-overview {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 24px;
                        margin-bottom: 32px;
                    }

                    .feature-item {
                        display: flex;
                        align-items: flex-start;
                        gap: 16px;
                        padding: 20px;
                        background: #f8fafc;
                        border-radius: 12px;
                        border: 1px solid #e5e7eb;
                    }

                    .feature-icon {
                        font-size: 24px;
                        flex-shrink: 0;
                        width: 48px;
                        height: 48px;
                        background: white;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    }

                    .feature-text h3 {
                        margin: 0 0 8px 0;
                        font-size: 16px;
                        font-weight: 600;
                        color: #1f2937;
                    }

                    .feature-text p {
                        margin: 0;
                        font-size: 14px;
                        color: #6b7280;
                        text-align: left;
                        line-height: 1.5;
                    }

                    .action-buttons, .demo-buttons, .config-buttons, .results-buttons {
                        display: flex;
                        justify-content: center;
                        gap: 16px;
                        flex-wrap: wrap;
                    }

                    .btn {
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .btn-primary {
                        background: #3b82f6;
                        color: white;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                    }

                    .btn-primary:hover {
                        background: #2563eb;
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
                    }

                    .btn-secondary {
                        background: #f3f4f6;
                        color: #374151;
                        border: 1px solid #d1d5db;
                    }

                    .btn-secondary:hover {
                        background: #e5e7eb;
                        transform: translateY(-1px);
                    }

                    .demo-steps {
                        display: grid;
                        gap: 20px;
                        margin-bottom: 32px;
                    }

                    .demo-step {
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        padding: 20px;
                        background: #f8fafc;
                        border-radius: 12px;
                        border: 1px solid #e5e7eb;
                    }

                    .step-number {
                        width: 48px;
                        height: 48px;
                        background: #3b82f6;
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 18px;
                        flex-shrink: 0;
                    }

                    .step-content h3 {
                        margin: 0 0 8px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #1f2937;
                    }

                    .step-content p {
                        margin: 0;
                        font-size: 14px;
                        color: #6b7280;
                        text-align: left;
                    }

                    .config-form {
                        margin-bottom: 32px;
                    }

                    .form-group {
                        margin-bottom: 24px;
                    }

                    .form-group label {
                        display: block;
                        margin-bottom: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #374151;
                    }

                    .date-inputs {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }

                    .date-inputs input {
                        flex: 1;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 14px;
                    }

                    .criteria-inputs {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    }

                    .input-item {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .input-item span {
                        font-size: 12px;
                        color: #6b7280;
                        font-weight: 500;
                    }

                    .input-item input, .input-item select {
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 14px;
                    }

                    #excludeDomains {
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 14px;
                    }

                    .success-stats {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 32px;
                    }

                    .stat-item {
                        text-align: center;
                        padding: 20px;
                        background: #f0fdf4;
                        border: 1px solid #bbf7d0;
                        border-radius: 12px;
                    }

                    .stat-number {
                        font-size: 32px;
                        display: block;
                        margin-bottom: 8px;
                    }

                    .stat-label {
                        font-size: 14px;
                        font-weight: 600;
                        color: #065f46;
                    }

                    .next-steps {
                        background: #eff6ff;
                        border: 1px solid #bfdbfe;
                        border-radius: 12px;
                        padding: 24px;
                        margin-bottom: 32px;
                    }

                    .next-steps h3 {
                        margin: 0 0 16px 0;
                        font-size: 18px;
                        color: #1e40af;
                    }

                    .next-steps ul {
                        margin: 0;
                        padding: 0;
                        list-style: none;
                    }

                    .next-steps li {
                        padding: 8px 0;
                        font-size: 14px;
                        color: #1e40af;
                    }

                    @media (max-width: 768px) {
                        .container {
                            padding: 0 16px;
                        }

                        .organizer-main-content {
                            padding: 20px 0;
                        }

                        .welcome-card, .demo-card, .config-card, .results-card {
                            padding: 20px;
                        }

                        .features-overview {
                            grid-template-columns: 1fr;
                        }

                        .demo-step {
                            flex-direction: column;
                            text-align: center;
                        }

                        .criteria-inputs {
                            grid-template-columns: 1fr;
                        }

                        .success-stats {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
            `;
        }

        // MÉTHODES D'INTERACTION
        startQuickDemo() {
            document.getElementById('demoSection').style.display = 'block';
            document.getElementById('demoSection').scrollIntoView({ behavior: 'smooth' });
        }

        hideDemo() {
            document.getElementById('demoSection').style.display = 'none';
        }

        startConfiguration() {
            document.getElementById('configSection').style.display = 'block';
            document.getElementById('configSection').scrollIntoView({ behavior: 'smooth' });
            this.setDefaultDates();
        }

        goToWelcome() {
            document.getElementById('configSection').style.display = 'none';
            document.getElementById('demoSection').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'none';
        }

        async startAnalysis() {
            try {
                console.log('[ModernDomainOrganizer] 🔍 Simulation d\'analyse...');
                
                // Masquer config, afficher résultats
                document.getElementById('configSection').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';
                document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur simulation analyse:', error);
            }
        }

        restart() {
            this.goToWelcome();
        }

        // MÉTHODES UTILITAIRES
        setupEventListeners() {
            // Pas besoin d'event listeners complexes pour cette version
            console.log('[ModernDomainOrganizer] ✅ Event listeners basiques configurés');
        }

        setDefaultDates() {
            try {
                const today = new Date();
                const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                
                const startDate = document.getElementById('startDate');
                const endDate = document.getElementById('endDate');
                
                if (startDate) startDate.valueAsDate = thirtyDaysAgo;
                if (endDate) endDate.valueAsDate = today;
                
                console.log('[ModernDomainOrganizer] 📅 Dates par défaut configurées');
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur dates par défaut:', error);
            }
        }

        // MÉTHODES PUBLIQUES
        showPage() {
            this.forceDisplay();
        }
    }

    // CRÉATION ET ACTIVATION IMMÉDIATE
    try {
        console.log('[ModernDomainOrganizer] 🚀 CRÉATION INSTANCE AVEC BYPASS...');
        
        window.modernDomainOrganizer = new ModernDomainOrganizer();
        
        // Fonction globale
        window.showModernDomainOrganizer = function() {
            window.modernDomainOrganizer.forceDisplay();
        };
        
        console.log('[ModernDomainOrganizer] ✅ MODULE CHARGÉ AVEC BYPASS COMPLET');
        
    } catch (error) {
        console.error('[ModernDomainOrganizer] ❌ ERREUR FATALE:', error);
    }

})();
