// Onboarding.js - Version désactivée (sans popup automatique)

class OnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4;
        this.isActive = false;
        this.tourCompleted = true; // Marquer comme complété pour éviter l'auto-démarrage
        
        // Désactiver complètement l'onboarding automatique
        this.autoStartEnabled = false;
        
        console.log('[Onboarding] Manager initialized - ONBOARDING DISABLED');
    }

    // Méthode désactivée - ne démarre plus automatiquement
    init() {
        console.log('[Onboarding] Init called - ONBOARDING DISABLED, skipping auto-start');
        // Ne rien faire - onboarding désactivé
        return false;
    }

    // Désactiver la détection des nouveaux utilisateurs
    checkFirstTimeUser() {
        console.log('[Onboarding] First time user check - DISABLED');
        return false; // Toujours retourner false
    }

    // Désactiver le démarrage automatique du tour
    startGuidedTour() {
        console.log('[Onboarding] Guided tour start - DISABLED');
        // Ne rien faire
        return false;
    }

    // Désactiver l'affichage des étapes
    showStep(stepNumber) {
        console.log('[Onboarding] Show step - DISABLED');
        // Ne rien faire
        return false;
    }

    // Méthodes vides pour éviter les erreurs
    nextStep() {
        console.log('[Onboarding] Next step - DISABLED');
    }

    previousStep() {
        console.log('[Onboarding] Previous step - DISABLED');
    }

    stopTour() {
        console.log('[Onboarding] Tour stopped - DISABLED');
        this.isActive = false;
    }

    // Marquer le tour comme complété pour éviter tout redémarrage
    completeTour() {
        this.tourCompleted = true;
        this.isActive = false;
        console.log('[Onboarding] Tour marked as completed');
    }

    // Méthode pour réactiver manuellement si nécessaire (optionnel)
    manualStart() {
        console.log('[Onboarding] Manual start requested - but DISABLED');
        // Optionnel : vous pouvez garder cette méthode si vous voulez réactiver manuellement
        // return this.startGuidedTour();
        return false;
    }
}

// =====================================
// INITIALISATION GLOBALE DÉSACTIVÉE
// =====================================

// Créer l'instance mais désactivée
window.onboardingManager = new OnboardingManager();

// Désactiver tous les événements automatiques
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Onboarding] DOM ready - ONBOARDING DISABLED');
    // Ne pas démarrer l'onboarding
});

// Fonction globale désactivée
window.startOnboarding = function() {
    console.log('[Onboarding] Global start function - DISABLED');
    return false;
};

console.log('[Onboarding] ✅ Manager loaded - ONBOARDING COMPLETELY DISABLED');

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingManager;
}
