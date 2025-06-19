// CategoriesPage.js - Version avec sauvegarde automatique par défaut + choix utilisateur
// Sauvegarde automatique dans dossier par défaut SANS intervention + option de personnalisation

(function() {
    'use strict';

    class CategoriesPageManager {
        constructor() {
            this.categories = [];
            this.customCategories = [];
            this.currentPage = 1;
            this.itemsPerPage = 10;
            this.searchTerm = '';
            this.selectedFilter = 'all';
            this.isEditing = false;
            this.editingCategoryId = null;
            
            // SYSTÈME DE SAUVEGARDE HYBRIDE
            this.externalBackupHandle = null;
            this.backupFolderConfigured = false;
            this.useDefaultBackup = true; // Toujours utiliser le backup par défaut
            this.lastExternalBackup = null;
            this.backupTimer = null;
            
            this.init();
        }

        // ================================================
        // INITIALISATION AVEC SAUVEGARDE AUTOMATIQUE
        // ================================================
        async init() {
            console.log('[CategoriesPage] 🚀 Initialisation avec sauvegarde automatique...');
            
            try {
                await this.loadCategories();
                await this.setupHybridBackup();
                this.render();
                this.attachEvents();
                this.startBackupTimer();
                
                console.log('[CategoriesPage] ✅ Initialisé avec sauvegarde hybride');
            } catch (error) {
                console.error('[CategoriesPage] ❌ Erreur initialisation:', error);
                this.render(); // Afficher quand même la page
            }
        }

        // ================================================
        // CONFIGURATION SAUVEGARDE HYBRIDE (Défaut + Optionnel)
        // ================================================
        async setupHybridBackup() {
            try {
                // 1. TOUJOURS activer la sauvegarde par défaut (téléchargements programmés)
                this.useDefaultBackup = true;
                console.log('[CategoriesPage] ✅ Sauvegarde par défaut activée');

                // 2. Essayer de restaurer un dossier personnalisé précédent (OPTIONNEL)
                const savedHandle = await this.loadSavedBackupHandle();
                if (savedHandle && await this.testBackupHandle(savedHandle)) {
                    this.externalBackupHandle = savedHandle;
                    this.backupFolderConfigured = true;
                    console.log('[CategoriesPage] ✅ Dossier personnalisé restauré');
                } else {
                    console.log('[CategoriesPage] 📁 Dossier personnalisé non configuré (optionnel)');
                }

                // 3. Faire une sauvegarde immédiate dans tous les systèmes disponibles
                await this.performHybridBackup('initialization');

            } catch (error) {
                console.warn('[CategoriesPage] ⚠️ Erreur setup sauvegarde:', error);
                // Même en cas d'erreur, on garde la sauvegarde par défaut
                this.useDefaultBackup = true;
            }
        }

        // ================================================
        // SAUVEGARDE HYBRIDE (Défaut + Optionnel)
        // ================================================
        async performHybridBackup(trigger = 'auto') {
            try {
                const timestamp = new Date().toISOString();
                
                // Collecter toutes les données
                const categoriesData = this.collectCategoriesData();
                const tasksData = this.collectTasksData();
                const settingsData = this.collectSettingsData();
                
                // Créer le backup complet
                const fullBackup = {
                    version: '1.0',
                    exportDate: timestamp,
                    source: 'EmailSortPro-Categories',
                    trigger: trigger,
                    data: {
                        categories: categoriesData,
                        tasks: tasksData,
                        settings: settingsData
                    },
                    metadata: {
                        categoriesCount: categoriesData.all?.length || 0,
                        tasksCount: tasksData.all?.length || 0,
                        hasSettings: !!settingsData,
                        backupMethod: this.getActiveBackupMethods()
                    }
                };

                let successCount = 0;

                // 1. SAUVEGARDE PAR DÉFAUT (TOUJOURS ACTIVE)
                if (this.useDefaultBackup) {
                    try {
                        await this.performDefaultBackup(fullBackup, trigger);
                        successCount++;
                        console.log('[CategoriesPage] ✅ Sauvegarde par défaut réussie');
                    } catch (error) {
                        console.warn('[CategoriesPage] ⚠️ Erreur sauvegarde par défaut:', error);
                    }
                }

                // 2. SAUVEGARDE PERSONNALISÉE (SI CONFIGURÉE)
                if (this.backupFolderConfigured && this.externalBackupHandle) {
                    try {
                        await this.performCustomBackup(fullBackup);
                        successCount++;
                        console.log('[CategoriesPage] ✅ Sauvegarde personnalisée réussie');
                    } catch (error) {
                        console.warn('[CategoriesPage] ⚠️ Erreur sauvegarde personnalisée:', error);
                        // Si erreur, on perd l'accès au dossier personnalisé
                        this.backupFolderConfigured = false;
                    }
                }

                // 3. SAUVEGARDE NAVIGATEUR (TOUJOURS EN BACKUP)
                try {
                    await this.performBrowserBackup(fullBackup);
                    successCount++;
                    console.log('[CategoriesPage] ✅ Sauvegarde navigateur réussie');
                } catch (error) {
                    console.warn('[CategoriesPage] ⚠️ Erreur sauvegarde navigateur:', error);
                }

                this.lastExternalBackup = new Date();
                localStorage.setItem('emailsortpro_last_hybrid_backup', timestamp);

                if (trigger === 'manual') {
                    this.showNotification(`✅ Sauvegarde réussie sur ${successCount} emplacements !`, 'success');
                }

                console.log(`[CategoriesPage] 💾 Sauvegarde hybride réussie (${trigger}) - ${successCount} emplacements`);
                return true;

            } catch (error) {
                console.error('[CategoriesPage] ❌ Erreur sauvegarde hybride:', error);
                
                if (trigger === 'manual') {
                    this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
                }

                return false;
            }
        }

        // ================================================
        // SAUVEGARDE PAR DÉFAUT (Documents/EmailSortPro via téléchargement)
        // ================================================
        async performDefaultBackup(fullBackup, trigger) {
            try {
                // Stratégie : Téléchargement automatique avec nom intelligent
                const date = new Date();
                const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
                const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
                
                // Noms de fichiers différents selon le type
                let filename;
                if (trigger === 'manual') {
                    filename = `EmailSortPro-Manuel-${dateStr}_${timeStr}.json`;
                } else if (trigger === 'initialization') {
                    filename = `EmailSortPro-Init-${dateStr}_${timeStr}.json`;
                } else {
                    // Backup auto : nom simple avec rotation
                    const hour = date.getHours().toString().padStart(2, '0');
                    filename = `EmailSortPro-Auto-${dateStr}_${hour}h.json`;
                }

                await this.downloadBackupFile(fullBackup, filename);

                // Sauvegarder aussi un fichier "latest" pour récupération facile
                if (Math.random() < 0.2) { // 20% de chance de créer un "latest"
                    await this.downloadBackupFile(fullBackup, 'EmailSortPro-Latest.json');
                }

                return true;

            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde par défaut:', error);
                throw error;
            }
        }

        async downloadBackupFile(data, filename) {
            try {
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';
                
                // Téléchargement silencieux
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                setTimeout(() => URL.revokeObjectURL(url), 100);
                return true;

            } catch (error) {
                console.error('[CategoriesPage] Erreur téléchargement:', error);
                return false;
            }
        }

        // ================================================
        // SAUVEGARDE PERSONNALISÉE (Dossier choisi par l'utilisateur)
        // ================================================
        async performCustomBackup(fullBackup) {
            if (!this.externalBackupHandle) {
                throw new Error('Dossier personnalisé non configuré');
            }

            try {
                // Sauvegarder les fichiers séparés dans le dossier personnalisé
                await this.saveDataFile('categories-data.json', fullBackup.data.categories);
                await this.saveDataFile('tasks-data.json', fullBackup.data.tasks);
                await this.saveDataFile('settings-data.json', fullBackup.data.settings);
                await this.saveDataFile('full-backup.json', fullBackup);

                // Mettre à jour le README
                await this.updateCustomReadme();

                return true;

            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde personnalisée:', error);
                throw error;
            }
        }

        async saveDataFile(filename, data) {
            const fileHandle = await this.externalBackupHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        }

        async updateCustomReadme() {
            try {
                const readmeContent = `# EmailSortPro - Dossier personnalisé

Ce dossier contient vos données EmailSortPro sauvegardées automatiquement.

## 📁 Contenu
- categories-data.json : Vos catégories et mots-clés
- tasks-data.json : Vos tâches
- settings-data.json : Vos paramètres et préférences
- full-backup.json : Sauvegarde complète (pour importation)

## 🔄 Sauvegarde
- Type : Dossier personnalisé (choisi par l'utilisateur)
- Fréquence : Toutes les 10 minutes + à chaque modification
- Complément : Sauvegarde par défaut également active

## ⚠️ IMPORTANT
- NE PAS SUPPRIMER ce dossier
- Ces fichiers permettent la récupération complète
- Sauvegarde redondante avec système par défaut

## 📍 Informations
Dernière mise à jour : ${new Date().toLocaleString('fr-FR')}
Application : ${window.location.origin}
Mode : Sauvegarde hybride (défaut + personnalisé)

---
Généré automatiquement par EmailSortPro
`;

                const readmeHandle = await this.externalBackupHandle.getFileHandle('README.txt', { create: true });
                const writable = await readmeHandle.createWritable();
                await writable.write(readmeContent);
                await writable.close();

            } catch (error) {
                console.warn('[CategoriesPage] Impossible de créer README personnalisé:', error);
            }
        }

        // ================================================
        // SAUVEGARDE NAVIGATEUR (Fallback dans localStorage/IndexedDB)
        // ================================================
        async performBrowserBackup(fullBackup) {
            try {
                // Sauvegarder dans localStorage
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const key = `emailsortpro_browser_backup_${timestamp}`;
                
                localStorage.setItem(key, JSON.stringify(fullBackup));
                localStorage.setItem('emailsortpro_browser_backup_latest', JSON.stringify(fullBackup));
                
                // Nettoyer les anciens backups (garder les 5 derniers)
                this.cleanupBrowserBackups();

                return true;

            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde navigateur:', error);
                throw error;
            }
        }

        cleanupBrowserBackups() {
            try {
                const keys = Object.keys(localStorage)
                    .filter(key => key.startsWith('emailsortpro_browser_backup_'))
                    .sort()
                    .reverse();
                
                if (keys.length > 5) {
                    const toDelete = keys.slice(5);
                    toDelete.forEach(key => {
                        if (key !== 'emailsortpro_browser_backup_latest') {
                            localStorage.removeItem(key);
                        }
                    });
                }
            } catch (error) {
                console.warn('[CategoriesPage] Erreur nettoyage backup navigateur:', error);
            }
        }

        // ================================================
        // CONFIGURATION DOSSIER PERSONNALISÉ
        // ================================================
        async configureCustomBackup() {
            try {
                if (!window.showDirectoryPicker) {
                    this.showNotification('Votre navigateur ne supporte pas l\'accès aux dossiers', 'error');
                    return false;
                }

                // Demander à l'utilisateur de choisir un dossier
                const directoryHandle = await window.showDirectoryPicker({
                    mode: 'readwrite',
                    startIn: 'documents',
                    id: 'emailsortpro-custom-backup'
                });

                // Créer le sous-dossier EmailSortPro
                let backupFolderHandle;
                try {
                    backupFolderHandle = await directoryHandle.getDirectoryHandle('EmailSortPro-Data');
                } catch {
                    backupFolderHandle = await directoryHandle.getDirectoryHandle('EmailSortPro-Data', { create: true });
                }

                // Tester l'accès en écriture
                await this.testWriteAccess(backupFolderHandle);

                // Sauvegarder le handle
                this.externalBackupHandle = backupFolderHandle;
                this.backupFolderConfigured = true;
                await this.saveBackupHandle(backupFolderHandle);

                // Faire une sauvegarde immédiate
                await this.performHybridBackup('custom-setup');

                this.showNotification('✅ Dossier personnalisé configuré avec succès !', 'success');
                this.render(); // Recharger l'interface

                console.log('[CategoriesPage] ✅ Dossier personnalisé configuré');
                return true;

            } catch (error) {
                if (error.name === 'AbortError') {
                    this.showNotification('Configuration annulée', 'info');
                } else {
                    console.error('[CategoriesPage] Erreur configuration:', error);
                    this.showNotification('Erreur lors de la configuration', 'error');
                }
                return false;
            }
        }

        // ================================================
        // GESTION DES HANDLES PERSONNALISÉS
        // ================================================
        async saveBackupHandle(handle) {
            try {
                if ('indexedDB' in window) {
                    const db = await this.openIndexedDB();
                    const transaction = db.transaction(['handles'], 'readwrite');
                    const store = transaction.objectStore('handles');
                    await store.put({
                        id: 'custom-backup-handle',
                        handle: handle,
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                console.warn('[CategoriesPage] Impossible de sauvegarder handle:', error);
            }
        }

        async loadSavedBackupHandle() {
            try {
                if ('indexedDB' in window) {
                    const db = await this.openIndexedDB();
                    const transaction = db.transaction(['handles'], 'readonly');
                    const store = transaction.objectStore('handles');
                    const result = await store.get('custom-backup-handle');
                    return result?.handle;
                }
            } catch (error) {
                return null;
            }
        }

        async openIndexedDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('EmailSortProHandles', 1);
                
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('handles')) {
                        db.createObjectStore('handles', { keyPath: 'id' });
                    }
                };
            });
        }

        async testBackupHandle(handle) {
            try {
                const testFile = await handle.getFileHandle('.test', { create: true });
                const writable = await testFile.createWritable();
                await writable.write('test');
                await writable.close();
                await handle.removeEntry('.test');
                return true;
            } catch (error) {
                return false;
            }
        }

        async testWriteAccess(directoryHandle) {
            const testFileName = '.emailsortpro-test-' + Date.now();
            
            try {
                const testFileHandle = await directoryHandle.getFileHandle(testFileName, { create: true });
                const writable = await testFileHandle.createWritable();
                await writable.write('Test EmailSortPro - ' + new Date().toISOString());
                await writable.close();
                await directoryHandle.removeEntry(testFileName);
                return true;
            } catch (error) {
                throw new Error('Test écriture échoué');
            }
        }

        // ================================================
        // COLLECTE DES DONNÉES
        // ================================================
        collectCategoriesData() {
            try {
                return {
                    all: window.categoryManager?.getCategories() || this.categories || [],
                    custom: window.categoryManager?.getCustomCategories() || this.customCategories || [],
                    keywords: window.categoryManager?.getAllKeywords() || {}
                };
            } catch (error) {
                return { all: [], custom: [], keywords: {} };
            }
        }

        collectTasksData() {
            try {
                const tasks = window.taskManager?.getAllTasks() || [];
                return {
                    all: tasks,
                    count: tasks.length,
                    completed: tasks.filter(t => t.status === 'completed').length
                };
            } catch (error) {
                return { all: [], count: 0, completed: 0 };
            }
        }

        collectSettingsData() {
            const settings = {};
            const settingsKeys = [
                'emailsortpro_settings',
                'emailsortpro_preferences', 
                'categorySettings',
                'taskSettings'
            ];
            
            settingsKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        settings[key] = JSON.parse(value);
                    } catch {
                        settings[key] = value;
                    }
                }
            });
            
            return settings;
        }

        // ================================================
        // TIMER DE SAUVEGARDE AUTOMATIQUE
        // ================================================
        startBackupTimer() {
            if (this.backupTimer) {
                clearInterval(this.backupTimer);
            }

            // Sauvegarde automatique toutes les 10 minutes
            this.backupTimer = setInterval(() => {
                this.performHybridBackup('timer');
            }, 600000); // 10 minutes

            // Première sauvegarde après 1 minute
            setTimeout(() => {
                this.performHybridBackup('delayed-init');
            }, 60000);

            console.log('[CategoriesPage] ⏰ Timer de sauvegarde hybride démarré (10 min)');
        }

        // ================================================
        // INTERFACE UTILISATEUR
        // ================================================
        render() {
            const container = document.querySelector('#page-content') || document.body;
            
            container.innerHTML = `
                <div class="categories-page">
                    <div class="page-header">
                        <h1><i class="fas fa-tags"></i> Gestion des catégories</h1>
                        <p class="page-description">Organisez et personnalisez vos catégories d'emails</p>
                        
                        ${this.renderBackupStatus()}
                    </div>

                    ${this.renderHybridBackupSection()}
                    ${this.renderCategoriesSection()}
                </div>

                <style>
                .categories-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .page-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .page-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                    opacity: 0.3;
                }

                .page-header > * {
                    position: relative;
                    z-index: 1;
                }

                .page-header h1 {
                    margin: 0 0 10px 0;
                    font-size: 28px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }

                .page-description {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 16px;
                }

                .backup-status {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .backup-status.hybrid {
                    background: rgba(40, 167, 69, 0.2);
                    border-color: rgba(40, 167, 69, 0.3);
                }

                .backup-status i {
                    font-size: 18px;
                }

                .backup-section {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    margin-bottom: 30px;
                    overflow: hidden;
                }

                .section-header {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 20px 30px;
                    border-bottom: 1px solid #e9ecef;
                }

                .section-header h3 {
                    margin: 0 0 8px 0;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 18px;
                }

                .section-header p {
                    margin: 0;
                    color: #6c757d;
                    font-size: 14px;
                }

                .backup-controls {
                    padding: 30px;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 25px;
                }

                .backup-card {
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 20px;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .backup-card:hover {
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }

                .backup-card.default {
                    border-left: 4px solid #28a745;
                }

                .backup-card.custom {
                    border-left: 4px solid #007bff;
                }

                .backup-card.browser {
                    border-left: 4px solid #6c757d;
                }

                .backup-card h4 {
                    margin: 0 0 12px 0;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                }

                .backup-card p {
                    margin: 0 0 15px 0;
                    color: #6c757d;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .backup-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .backup-status-indicator {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #28a745;
                }

                .backup-status-indicator.inactive {
                    background: #dc3545;
                }

                .backup-status-indicator.optional {
                    background: #ffc107;
                }

                .btn {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .btn-primary {
                    background: #007bff;
                    color: white;
                }

                .btn-primary:hover {
                    background: #0056b3;
                    transform: translateY(-1px);
                }

                .btn-success {
                    background: #28a745;
                    color: white;
                }

                .btn-success:hover {
                    background: #1e7e34;
                }

                .btn-warning {
                    background: #ffc107;
                    color: #212529;
                }

                .btn-warning:hover {
                    background: #e0a800;
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #545b62;
                }

                .backup-info {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 6px;
                    padding: 12px;
                    margin-top: 15px;
                    font-size: 13px;
                    color: #6c757d;
                }

                .backup-info.success {
                    background: #d4edda;
                    border-color: #c3e6cb;
                    color: #155724;
                }

                .backup-info.warning {
                    background: #fff3cd;
                    border-color: #ffeaa7;
                    color: #856404;
                }

                .categories-section {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }

                .categories-content {
                    padding: 30px;
                }

                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                }

                .notification.show {
                    transform: translateX(0);
                }

                .notification.success {
                    background: #28a745;
                }

                .notification.error {
                    background: #dc3545;
                }

                .notification.warning {
                    background: #ffc107;
                    color: #212529;
                }

                .notification.info {
                    background: #17a2b8;
                }

                @media (max-width: 968px) {
                    .backup-controls {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .page-header h1 {
                        font-size: 24px;
                    }
                }
                </style>
            `;
        }

        renderBackupStatus() {
            const methods = this.getActiveBackupMethods();
            const statusText = `✅ Sauvegarde hybride active (${methods.length} méthodes)`;

            return `
                <div class="backup-status hybrid">
                    <i class="fas fa-shield-check"></i>
                    <span>${statusText}</span>
                </div>
            `;
        }

        renderHybridBackupSection() {
            return `
                <div class="backup-section">
                    <div class="section-header">
                        <h3><i class="fas fa-shield-alt"></i> Sauvegarde hybride intelligente</h3>
                        <p>Système de sauvegarde multi-couches pour une protection maximale de vos données</p>
                    </div>
                    <div class="backup-controls">
                        <!-- SAUVEGARDE PAR DÉFAUT -->
                        <div class="backup-card default">
                            <div class="backup-status-indicator"></div>
                            <h4><i class="fas fa-download"></i> Sauvegarde par défaut</h4>
                            <p>Sauvegarde automatique dans votre dossier Téléchargements. 
                               <strong>Toujours active</strong> et ne nécessite aucune configuration.</p>
                            <div class="backup-actions">
                                <button id="manual-default-backup-btn" class="btn btn-success">
                                    <i class="fas fa-save"></i>
                                    Sauvegarder maintenant
                                </button>
                            </div>
                            <div class="backup-info success">
                                <i class="fas fa-check-circle"></i>
                                <strong>Actif :</strong> Fichiers créés automatiquement toutes les 10 minutes.
                                Recherchez "EmailSortPro-" dans vos téléchargements.
                            </div>
                        </div>

                        <!-- SAUVEGARDE PERSONNALISÉE -->
                        <div class="backup-card custom">
                            <div class="backup-status-indicator ${this.backupFolderConfigured ? '' : 'optional'}"></div>
                            <h4><i class="fas fa-folder-open"></i> Dossier personnalisé</h4>
                            <p>Choisissez un dossier permanent sur votre ordinateur. 
                               <strong>Recommandé</strong> pour un accès facile à vos données.</p>
                            <div class="backup-actions">
                                ${this.backupFolderConfigured ? `
                                    <button id="manual-custom-backup-btn" class="btn btn-success">
                                        <i class="fas fa-save"></i>
                                        Sauvegarder maintenant
                                    </button>
                                    <button id="reconfigure-custom-btn" class="btn btn-warning">
                                        <i class="fas fa-folder"></i>
                                        Changer de dossier
                                    </button>
                                ` : `
                                    <button id="setup-custom-btn" class="btn btn-primary">
                                        <i class="fas fa-folder-plus"></i>
                                        Configurer un dossier
                                    </button>
                                `}
                            </div>
                            <div class="backup-info ${this.backupFolderConfigured ? 'success' : 'warning'}">
                                ${this.backupFolderConfigured ? `
                                    <i class="fas fa-check-circle"></i>
                                    <strong>Configuré :</strong> Dossier personnalisé actif.
                                ` : `
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <strong>Optionnel :</strong> Configurez pour un accès direct aux fichiers.
                                `}
                            </div>
                        </div>

                        <!-- SAUVEGARDE NAVIGATEUR -->
                        <div class="backup-card browser">
                            <div class="backup-status-indicator"></div>
                            <h4><i class="fas fa-database"></i> Sauvegarde navigateur</h4>
                            <p>Sauvegarde dans le navigateur (localStorage/IndexedDB). 
                               <strong>Backup de sécurité</strong> toujours disponible.</p>
                            <div class="backup-actions">
                                <button id="export-browser-btn" class="btn btn-secondary">
                                    <i class="fas fa-download"></i>
                                    Exporter depuis navigateur
                                </button>
                                <button id="import-browser-btn" class="btn btn-secondary">
                                    <i class="fas fa-upload"></i>
                                    Importer vers navigateur
                                </button>
                            </div>
                            <div class="backup-info success">
                                <i class="fas fa-check-circle"></i>
                                <strong>Actif :</strong> Backup automatique dans le navigateur.
                                Survit aux redémarrages.
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        renderCategoriesSection() {
            return `
                <div class="categories-section">
                    <div class="section-header">
                        <h3><i class="fas fa-tags"></i> Vos catégories</h3>
                        <p>Gérez vos catégories d'emails personnalisées</p>
                    </div>
                    <div class="categories-content">
                        <p>Interface de gestion des catégories ici...</p>
                        <p><em>Cette section contiendrait la liste des catégories, les outils d'édition, etc.</em></p>
                    </div>
                </div>
            `;
        }

        // ================================================
        // ÉVÉNEMENTS
        // ================================================
        attachEvents() {
            // Sauvegarde manuelle par défaut
            document.getElementById('manual-default-backup-btn')?.addEventListener('click', () => {
                this.performHybridBackup('manual-default');
            });

            // Configuration dossier personnalisé
            document.getElementById('setup-custom-btn')?.addEventListener('click', () => {
                this.configureCustomBackup();
            });

            // Reconfiguration dossier personnalisé
            document.getElementById('reconfigure-custom-btn')?.addEventListener('click', () => {
                this.configureCustomBackup();
            });

            // Sauvegarde manuelle personnalisée
            document.getElementById('manual-custom-backup-btn')?.addEventListener('click', () => {
                this.performHybridBackup('manual-custom');
            });

            // Export depuis navigateur
            document.getElementById('export-browser-btn')?.addEventListener('click', () => {
                this.exportFromBrowser();
            });

            // Import vers navigateur
            document.getElementById('import-browser-btn')?.addEventListener('click', () => {
                this.importToBrowser();
            });
        }

        // ================================================
        // IMPORT/EXPORT MANUEL
        // ================================================
        exportFromBrowser() {
            try {
                const browserBackup = localStorage.getItem('emailsortpro_browser_backup_latest');
                if (!browserBackup) {
                    this.showNotification('Aucune sauvegarde navigateur trouvée', 'warning');
                    return;
                }

                const data = JSON.parse(browserBackup);
                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `EmailSortPro-Browser-Export-${timestamp}.json`;
                
                this.downloadBackupFile(data, filename);
                this.showNotification('✅ Export depuis navigateur réussi !', 'success');

            } catch (error) {
                console.error('[CategoriesPage] Erreur export navigateur:', error);
                this.showNotification('❌ Erreur lors de l\'export navigateur', 'error');
            }
        }

        importToBrowser() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleBrowserImport(e.target.files[0]);
                }
            });
            
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        }

        async handleBrowserImport(file) {
            try {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (!data.data) {
                            this.showNotification('❌ Fichier invalide', 'error');
                            return;
                        }

                        // Importer dans le navigateur
                        if (data.data.settings) {
                            Object.keys(data.data.settings).forEach(key => {
                                localStorage.setItem(key, JSON.stringify(data.data.settings[key]));
                            });
                        }

                        // Sauvegarder comme backup navigateur
                        localStorage.setItem('emailsortpro_browser_backup_latest', JSON.stringify(data));

                        this.showNotification('✅ Import navigateur réussi !', 'success');
                        
                        // Déclencher une sauvegarde hybride après l'import
                        setTimeout(() => {
                            this.performHybridBackup('post-import');
                        }, 1000);

                    } catch (error) {
                        this.showNotification('❌ Erreur format de fichier', 'error');
                    }
                };
                
                reader.readAsText(file);

            } catch (error) {
                console.error('[CategoriesPage] Erreur import navigateur:', error);
                this.showNotification('❌ Erreur lors de l\'import navigateur', 'error');
            }
        }

        // ================================================
        // UTILITAIRES
        // ================================================
        async loadCategories() {
            try {
                if (window.categoryManager) {
                    this.categories = window.categoryManager.getCategories() || [];
                    this.customCategories = window.categoryManager.getCustomCategories() || [];
                }
            } catch (error) {
                console.warn('[CategoriesPage] Erreur chargement catégories:', error);
                this.categories = [];
                this.customCategories = [];
            }
        }

        getActiveBackupMethods() {
            const methods = [];
            if (this.useDefaultBackup) methods.push('Défaut');
            if (this.backupFolderConfigured) methods.push('Personnalisé');
            methods.push('Navigateur');
            return methods;
        }

        getLastBackupTime() {
            const lastBackup = this.lastExternalBackup || 
                (localStorage.getItem('emailsortpro_last_hybrid_backup') ? 
                 new Date(localStorage.getItem('emailsortpro_last_hybrid_backup')) : null);
            
            return lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais';
        }

        showNotification(message, type = 'info', duration = 4000) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, duration);
        }

        // ================================================
        // NETTOYAGE
        // ================================================
        destroy() {
            if (this.backupTimer) {
                clearInterval(this.backupTimer);
            }
        }
    }

    // ================================================
    // INITIALISATION GLOBALE
    // ================================================
    
    // Créer l'instance globale
    window.categoriesPageManager = new CategoriesPageManager();
    
    // API publique
    window.renderCategoriesPage = () => {
        if (window.categoriesPageManager) {
            window.categoriesPageManager.render();
        }
    };

    window.configureCategoriesBackup = () => {
        if (window.categoriesPageManager) {
            window.categoriesPageManager.configureCustomBackup();
        }
    };

    window.triggerCategoriesBackup = () => {
        if (window.categoriesPageManager) {
            window.categoriesPageManager.performHybridBackup('manual');
        }
    };

    // Nettoyage à la fermeture
    window.addEventListener('beforeunload', () => {
        if (window.categoriesPageManager) {
            window.categoriesPageManager.destroy();
        }
    });

    console.log('✅ CategoriesPage chargée avec sauvegarde HYBRIDE');
    console.log('🔧 Sauvegarde par défaut : TOUJOURS ACTIVE (téléchargements)');
    console.log('📁 Sauvegarde personnalisée : OPTIONNELLE (dossier choisi)');
    console.log('💾 Sauvegarde navigateur : FALLBACK (localStorage/IndexedDB)');

})();
