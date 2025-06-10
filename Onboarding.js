// Onboarding.js - Guide d'introduction avec ordre des menus corrigé

class OnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4;
        this.isActive = false;
        this.overlay = null;
        this.modal = null;
        
        // Étapes du guide avec ordre corrigé
        this.steps = [
            {
                title: "1) Paramètres - Configuration de base",
                icon: "fas fa-cog",
                color: "#4F46E5",
                description: "Commencez par vérifier et personnaliser vos catégories d'emails",
                target: ".nav-item[data-page='settings']",
                content: `
                    <div class="onboarding-content">
                        <div class="step-header">
                            <div class="step-icon" style="background: #4F46E5">
                                <i class="fas fa-cog"></i>
                            </div>
                            <h3>Étape 1 : Configuration des paramètres</h3>
                        </div>
                        <div class="step-body">
                            <p><strong>Première étape importante :</strong> Cliquez sur <strong>"Paramètres"</strong> pour :</p>
                            <ul>
                                <li>✅ <strong>Vérifier les catégories d'emails</strong> pré-configurées</li>
                                <li>✅ Ajouter vos catégories personnalisées si nécessaire</li>
                                <li>✅ Ajuster les couleurs et icônes de vos catégories</li>
                                <li>✅ Configurer les règles de tri automatique</li>
                            </ul>
                            <div class="tip-box">
                                <i class="fas fa-lightbulb"></i>
                                <div>
                                    <strong>Conseil :</strong> Plus vos catégories sont précises, plus l'IA pourra organiser efficacement vos emails !
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                position: "bottom-start",
                actionText: "Aller aux Paramètres",
                actionCallback: () => this.navigateToSettings()
            },
            {
                title: "2) Scanner - Analyse intelligente",
                icon: "fas fa-search",
                color: "#3b82f6",
                description: "Lancez l'analyse IA de vos emails pour une organisation automatique",
                target: ".nav-item[data-page='scanner']",
                content: `
                    <div class="onboarding-content">
                        <div class="step-header">
                            <div class="step-icon" style="background: #3b82f6">
                                <i class="fas fa-search"></i>
                            </div>
                            <h3>Étape 2 : Scanner vos emails</h3>
                        </div>
                        <div class="step-body">
                            <p>Une fois vos catégories configurées, utilisez le <strong>Scanner</strong> pour :</p>
                            <ul>
                                <li>🔍 <strong>Analyser automatiquement</strong> vos emails avec l'IA</li>
                                <li>📊 <strong>Catégoriser intelligemment</strong> selon vos paramètres</li>
                                <li>📈 <strong>Obtenir des statistiques</strong> détaillées</li>
                                <li>⚡ <strong>Traitement rapide</strong> de milliers d'emails</li>
                            </ul>
                            <div class="feature-highlight">
                                <i class="fas fa-brain"></i>
                                <div>
                                    <strong>IA Avancée :</strong> L'intelligence artificielle apprend de vos catégories pour une précision maximale !
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                position: "bottom",
                actionText: "Découvrir le Scanner",
                actionCallback: () => this.navigateToScanner()
            },
            {
                title: "3) Organiser - Rangement par domaines",
                icon: "fas fa-folder-tree",
                color: "#10b981",
                description: "Organisez vos emails par expéditeurs et domaines pour un tri optimal",
                target: ".nav-item[data-page='ranger']",
                content: `
                    <div class="onboarding-content">
                        <div class="step-header">
                            <div class="step-icon" style="background: #10b981">
                                <i class="fas fa-folder-tree"></i>
                            </div>
                            <h3>Étape 3 : Organiser par domaines</h3>
                        </div>
                        <div class="step-body">
                            <p>Après le scan, utilisez <strong>"Ranger"</strong> pour :</p>
                            <ul>
                                <li>📁 <strong>Grouper par expéditeurs</strong> et domaines</li>
                                <li>🏢 <strong>Identifier les entreprises</strong> principales</li>
                                <li>📋 <strong>Créer des dossiers automatiques</strong></li>
                                <li>🧹 <strong>Nettoyer votre boîte mail</strong> efficacement</li>
                            </ul>
                            <div class="stats-preview">
                                <div class="mini-stat">
                                    <span class="stat-value">🔢</span>
                                    <span class="stat-label">Stats par domaine</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="stat-value">📊</span>
                                    <span class="stat-label">Analyse détaillée</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                position: "bottom",
                actionText: "Voir l'organisation",
                actionCallback: () => this.navigateToRanger()
            },
            {
                title: "4) Tâches - Suivi et actions",
                icon: "fas fa-tasks",
                color: "#f59e0b",
                description: "Consultez les tâches générées automatiquement par l'IA",
                target: ".nav-item[data-page='tasks']",
                content: `
                    <div class="onboarding-content">
                        <div class="step-header">
                            <div class="step-icon" style="background: #f59e0b">
                                <i class="fas fa-tasks"></i>
                            </div>
                            <h3>Étape 4 : Gérer vos tâches</h3>
                        </div>
                        <div class="step-body">
                            <p>Enfin, consultez les <strong>"Tâches"</strong> pour :</p>
                            <ul>
                                <li>✅ <strong>Voir les actions suggérées</strong> par l'IA</li>
                                <li>📝 <strong>Suivre les emails importants</strong></li>
                                <li>⏰ <strong>Gérer les échéances</strong> et rappels</li>
                                <li>🎯 <strong>Prioriser vos actions</strong> quotidiennes</li>
                            </ul>
                            <div class="completion-message">
                                <i class="fas fa-check-circle"></i>
                                <div>
                                    <strong>Félicitations !</strong> Vous maîtrisez maintenant tous les outils pour une gestion d'emails optimale.
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                position: "bottom-end",
                actionText: "Voir les tâches",
                actionCallback: () => this.navigateToTasks()
            }
        ];

        console.log('[Onboarding] Manager initialized with corrected menu order');
    }

    // =====================================
    // DÉMARRAGE DU GUIDE
    // =====================================
    startOnboarding(forceRestart = false) {
        // Vérifier si l'onboarding a déjà été fait
        if (!forceRestart && this.hasCompletedOnboarding()) {
            console.log('[Onboarding] Already completed, skipping...');
            return false;
        }

        console.log('[Onboarding] Starting guided tour with correct order...');
        
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(this.currentStep);
        
        return true;
    }

    // =====================================
    // AFFICHAGE DES ÉTAPES
    // =====================================
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            this.completeOnboarding();
            return;
        }

        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;

        console.log(`[Onboarding] Showing step ${stepIndex + 1}/${this.steps.length}: ${step.title}`);

        // Supprimer l'ancienne modal
        this.removeModal();

        // Créer la nouvelle modal
        this.createStepModal(step);

        // Mettre en surbrillance l'élément cible
        this.highlightTarget(step.target);
    }

    createStepModal(step) {
        const modal = document.createElement('div');
        modal.className = 'onboarding-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="step-indicator">
                        <span class="current-step">${this.currentStep + 1}</span>
                        <span class="total-steps">/${this.totalSteps}</span>
                    </div>
                    <button class="close-btn" onclick="window.onboardingManager?.stopOnboarding()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    ${step.content}
                </div>
                
                <div class="modal-footer">
                    <div class="navigation-buttons">
                        ${this.currentStep > 0 ? `
                            <button class="btn btn-secondary" onclick="window.onboardingManager?.previousStep()">
                                <i class="fas fa-arrow-left"></i>
                                Précédent
                            </button>
                        ` : ''}
                        
                        <button class="btn btn-primary" onclick="window.onboardingManager?.${step.actionCallback ? step.actionCallback.name + '()' : 'nextStep()'}">
                            ${step.actionText || 'Suivant'}
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        
                        ${this.currentStep === this.steps.length - 1 ? `
                            <button class="btn btn-success" onclick="window.onboardingManager?.completeOnboarding()">
                                <i class="fas fa-check"></i>
                                Terminer
                            </button>
                        ` : `
                            <button class="btn btn-outline" onclick="window.onboardingManager?.nextStep()">
                                Passer
                                <i class="fas fa-forward"></i>
                            </button>
                        `}
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((this.currentStep + 1) / this.totalSteps) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;

        this.modal = modal;
        document.body.appendChild(modal);

        // Animation d'entrée
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        this.ensureOnboardingStyles();
    }

    // =====================================
    // NAVIGATION
    // =====================================
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.completeOnboarding();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    // =====================================
    // ACTIONS DE NAVIGATION VERS LES PAGES
    // =====================================
    navigateToSettings() {
        console.log('[Onboarding] Navigating to Settings page...');
        if (window.pageManager) {
            window.pageManager.loadPage('settings');
        }
        this.nextStep();
    }

    navigateToScanner() {
        console.log('[Onboarding] Navigating to Scanner page...');
        if (window.pageManager) {
            window.pageManager.loadPage('scanner');
        }
        this.nextStep();
    }

    navigateToRanger() {
        console.log('[Onboarding] Navigating to Ranger page...');
        if (window.pageManager) {
            window.pageManager.loadPage('ranger');
        }
        this.nextStep();
    }

    navigateToTasks() {
        console.log('[Onboarding] Navigating to Tasks page...');
        if (window.pageManager) {
            window.pageManager.loadPage('tasks');
        }
        this.nextStep();
    }

    // =====================================
    // GESTION DE L'OVERLAY ET HIGHLIGHT
    // =====================================
    createOverlay() {
        if (this.overlay) return;

        const overlay = document.createElement('div');
        overlay.className = 'onboarding-overlay';
        this.overlay = overlay;
        document.body.appendChild(overlay);

        // Empêcher le scroll pendant l'onboarding
        document.body.classList.add('onboarding-active');
    }

    highlightTarget(selector) {
        // Supprimer les anciens highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });

        // Ajouter le highlight au nouvel élément
        if (selector) {
            const target = document.querySelector(selector);
            if (target) {
                target.classList.add('onboarding-highlight');
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // =====================================
    // COMPLETION ET NETTOYAGE
    // =====================================
    completeOnboarding() {
        console.log('[Onboarding] Tour completed!');
        
        this.markAsCompleted();
        this.cleanup();
        
        // Afficher un message de félicitations
        if (window.uiManager) {
            window.uiManager.showToast(
                '🎉 Félicitations ! Vous maîtrisez maintenant EmailSortProAI !',
                'success',
                6000
            );
        }

        // Retourner au dashboard
        if (window.pageManager) {
            setTimeout(() => {
                window.pageManager.loadPage('dashboard');
            }, 1000);
        }
    }

    stopOnboarding() {
        console.log('[Onboarding] Tour stopped by user');
        this.cleanup();
    }

    cleanup() {
        this.isActive = false;
        
        // Supprimer l'overlay
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        // Supprimer la modal
        this.removeModal();

        // Supprimer les highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });

        // Restaurer le scroll
        document.body.classList.remove('onboarding-active');
    }

    removeModal() {
        if (this.modal) {
            this.modal.classList.add('hiding');
            setTimeout(() => {
                if (this.modal && this.modal.parentElement) {
                    this.modal.parentElement.removeChild(this.modal);
                }
                this.modal = null;
            }, 300);
        }
    }

    // =====================================
    // PERSISTANCE
    // =====================================
    hasCompletedOnboarding() {
        try {
            return localStorage.getItem('emailsort_onboarding_completed') === 'true';
        } catch (e) {
            return false;
        }
    }

    markAsCompleted() {
        try {
            localStorage.setItem('emailsort_onboarding_completed', 'true');
            localStorage.setItem('emailsort_onboarding_date', new Date().toISOString());
        } catch (e) {
            console.warn('[Onboarding] Could not save completion status');
        }
    }

    resetOnboarding() {
        try {
            localStorage.removeItem('emailsort_onboarding_completed');
            localStorage.removeItem('emailsort_onboarding_date');
            console.log('[Onboarding] Reset completed');
        } catch (e) {
            console.warn('[Onboarding] Could not reset onboarding');
        }
    }

    // =====================================
    // STYLES CSS
    // =====================================
    ensureOnboardingStyles() {
        if (document.getElementById('onboarding-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'onboarding-styles';
        styles.textContent = `
            /* Overlay principal */
            .onboarding-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                z-index: 9999;
                backdrop-filter: blur(2px);
            }

            /* Modal d'étape */
            .onboarding-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .onboarding-modal.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }

            .onboarding-modal.hiding {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
            }

            .modal-content {
                background: white;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                max-width: 600px;
                width: 90vw;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            /* Header de modal */
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
                color: white;
            }

            .step-indicator {
                font-size: 18px;
                font-weight: 700;
            }

            .current-step {
                font-size: 24px;
            }

            .total-steps {
                opacity: 0.8;
                font-size: 16px;
            }

            .close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            /* Corps de modal */
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            .onboarding-content {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .step-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 16px;
            }

            .step-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
                flex-shrink: 0;
            }

            .step-header h3 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
            }

            .step-body {
                line-height: 1.6;
            }

            .step-body p {
                margin: 0 0 16px 0;
                color: #374151;
                font-size: 16px;
            }

            .step-body ul {
                margin: 16px 0;
                padding-left: 0;
                list-style: none;
            }

            .step-body li {
                padding: 8px 0;
                color: #374151;
                font-size: 15px;
                display: flex;
                align-items: flex-start;
                gap: 8px;
            }

            /* Boxes spéciaux */
            .tip-box,
            .feature-highlight,
            .completion-message {
                padding: 16px;
                border-radius: 12px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin: 16px 0;
            }

            .tip-box {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #f59e0b;
            }

            .feature-highlight {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #3b82f6;
            }

            .completion-message {
                background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                border: 1px solid #10b981;
            }

            .tip-box i,
            .feature-highlight i,
            .completion-message i {
                color: #f59e0b;
                font-size: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .feature-highlight i {
                color: #3b82f6;
            }

            .completion-message i {
                color: #10b981;
            }

            /* Stats preview */
            .stats-preview {
                display: flex;
                gap: 16px;
                margin: 16px 0;
            }

            .mini-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
                flex: 1;
                text-align: center;
            }

            .stat-value {
                font-size: 24px;
                margin-bottom: 4px;
            }

            .stat-label {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }

            /* Footer de modal */
            .modal-footer {
                padding: 20px 24px;
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }

            .navigation-buttons {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
            }

            .btn-primary {
                background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
                color: white;
            }

            .btn-primary:hover {
                background: linear-gradient(135deg, #4338ca 0%, #5b21b6 100%);
                transform: translateY(-1px);
            }

            .btn-secondary {
                background: #6b7280;
                color: white;
            }

            .btn-secondary:hover {
                background: #4b5563;
                transform: translateY(-1px);
            }

            .btn-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }

            .btn-success:hover {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                transform: translateY(-1px);
            }

            .btn-outline {
                background: transparent;
                color: #6b7280;
                border: 1px solid #d1d5db;
            }

            .btn-outline:hover {
                background: #f3f4f6;
                color: #374151;
            }

            /* Barre de progression */
            .progress-bar {
                width: 100%;
                height: 6px;
                background: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
                transition: width 0.3s ease;
                border-radius: 3px;
            }

            /* Highlight des éléments */
            .onboarding-highlight {
                position: relative;
                z-index: 10001;
                box-shadow: 0 0 0 4px #4F46E5, 0 0 0 8px rgba(79, 70, 229, 0.3) !important;
                border-radius: 8px !important;
                transition: all 0.3s ease !important;
            }

            /* Empêcher le scroll pendant l'onboarding */
            body.onboarding-active {
                overflow: hidden;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .modal-content {
                    width: 95vw;
                    margin: 20px;
                }

                .modal-body {
                    padding: 16px;
                }

                .modal-header {
                    padding: 16px;
                }

                .modal-footer {
                    padding: 16px;
                }

                .navigation-buttons {
                    flex-direction: column-reverse;
                    gap: 8px;
                }

                .btn {
                    width: 100%;
                    justify-content: center;
                }

                .stats-preview {
                    flex-direction: column;
                    gap: 8px;
                }

                .step-header {
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                }

                .step-icon {
                    align-self: center;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // =====================================
    // MÉTHODES UTILITAIRES
    // =====================================
    getDebugInfo() {
        return {
            isActive: this.isActive,
            currentStep: this.currentStep,
            totalSteps: this.totalSteps,
            hasCompleted: this.hasCompletedOnboarding(),
            stepsOrder: this.steps.map((step, index) => `${index + 1}) ${step.title}`)
        };
    }
}

// =====================================
// INITIALISATION GLOBALE
// =====================================

// Créer l'instance globale
window.onboardingManager = new OnboardingManager();

// Fonction pour démarrer l'onboarding
window.startOnboarding = function(forceRestart = false) {
    if (window.onboardingManager) {
        return window.onboardingManager.startOnboarding(forceRestart);
    } else {
        console.error('[Onboarding] Manager not available');
        return false;
    }
};

// Fonction pour reset l'onboarding
window.resetOnboarding = function() {
    if (window.onboardingManager) {
        window.onboardingManager.resetOnboarding();
        console.log('[Onboarding] Reset completed - you can restart the tour');
    }
};

// Auto-démarrage si premier lancement
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que l'app soit prête
    setTimeout(() => {
        // Démarrer automatiquement si c'est la première fois
        if (window.onboardingManager && !window.onboardingManager.hasCompletedOnboarding()) {
            console.log('[Onboarding] First time user detected - starting automatic tour...');
            
            // Attendre que l'utilisateur soit connecté
            const checkAuthAndStart = () => {
                if (document.body.classList.contains('app-active')) {
                    setTimeout(() => {
                        window.startOnboarding();
                    }, 2000); // Délai pour laisser l'app se charger
                } else {
                    setTimeout(checkAuthAndStart, 1000);
                }
            };
            
            checkAuthAndStart();
        }
    }, 3000);
});

console.log('✅ Onboarding Manager loaded with CORRECTED MENU ORDER:');
console.log('   1) Paramètres (vérifier catégories)');
console.log('   2) Scanner (analyse IA)');
console.log('   3) Organiser (domaines)');
console.log('   4) Tâches (actions)');
