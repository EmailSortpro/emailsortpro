// TaskManager Pro v11.0 - Design Chaleureux & Excel Import/Export

// =====================================
// ENHANCED TASK MANAGER CLASS
// =====================================
class TaskManager {
    constructor() {
        this.tasks = [];
        this.initialized = false;
        this.selectedTasks = new Set();
        this.init();
    }

    async init() {
        try {
            console.log('[TaskManager] Initializing v11.0 - Design chaleureux & Excel...');
            await this.loadTasks();
            this.initialized = true;
            console.log('[TaskManager] Initialization complete with', this.tasks.length, 'tasks');
        } catch (error) {
            console.error('[TaskManager] Initialization error:', error);
            this.tasks = [];
            this.initialized = true;
        }
    }

    async loadTasks() {
        try {
            const saved = localStorage.getItem('emailsort_tasks');
            if (saved) {
                this.tasks = JSON.parse(saved);
                console.log(`[TaskManager] Loaded ${this.tasks.length} tasks from storage`);
                
                // Assurer que toutes les tâches ont les propriétés requises
                this.tasks = this.tasks.map(task => this.ensureTaskProperties(task));
            } else {
                console.log('[TaskManager] No saved tasks found, creating sample tasks');
                this.generateSampleTasks();
            }
        } catch (error) {
            console.error('[TaskManager] Error loading tasks:', error);
            this.tasks = [];
        }
    }

    ensureTaskProperties(task) {
        return {
            // Propriétés de base obligatoires
            id: task.id || this.generateId(),
            title: task.title || 'Tâche sans titre',
            description: task.description || '',
            priority: task.priority || 'medium',
            status: task.status || 'todo',
            dueDate: task.dueDate || null,
            category: task.category || 'other',
            
            // Métadonnées
            client: task.client || 'Interne',
            tags: Array.isArray(task.tags) ? task.tags : [],
            
            // Email info
            hasEmail: task.hasEmail || false,
            emailId: task.emailId || null,
            emailFrom: task.emailFrom || null,
            emailFromName: task.emailFromName || null,
            emailSubject: task.emailSubject || null,
            emailContent: task.emailContent || '',
            emailHtmlContent: task.emailHtmlContent || '',
            emailDomain: task.emailDomain || null,
            emailDate: task.emailDate || null,
            emailReplied: task.emailReplied || false,
            needsReply: task.needsReply || false,
            hasAttachments: task.hasAttachments || false,
            
            // Données structurées IA
            summary: task.summary || '',
            actions: Array.isArray(task.actions) ? task.actions : [],
            keyInfo: Array.isArray(task.keyInfo) ? task.keyInfo : [],
            risks: Array.isArray(task.risks) ? task.risks : [],
            aiAnalysis: task.aiAnalysis || null,
            
            // Suggestions de réponse IA (obligatoires)
            suggestedReplies: Array.isArray(task.suggestedReplies) ? task.suggestedReplies : this.generateBasicReplies(task),
            aiRepliesGenerated: task.aiRepliesGenerated || false,
            aiRepliesGeneratedAt: task.aiRepliesGeneratedAt || null,
            
            // Timestamps
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: task.updatedAt || new Date().toISOString(),
            completedAt: task.completedAt || null,
            
            // Méthode de création
            method: task.method || 'manual'
        };
    }

    generateBasicReplies(task) {
        if (!task.hasEmail || !task.emailFrom) return [];
        
        const senderName = task.emailFromName || task.emailFrom.split('@')[0] || 'l\'expéditeur';
        const subject = task.emailSubject || 'votre message';
        
        return [
            {
                tone: 'professionnel',
                subject: `Re: ${subject}`,
                content: `Bonjour ${senderName},\n\nMerci pour votre message concernant "${subject}".\n\nJ'ai bien pris connaissance de votre demande et je m'en occupe rapidement.\n\nCordialement,\n[Votre nom]`,
                description: 'Réponse professionnelle standard',
                generatedBy: 'basic-template',
                generatedAt: new Date().toISOString()
            },
            {
                tone: 'détaillé',
                subject: `Re: ${subject} - Réponse détaillée`,
                content: `Bonjour ${senderName},\n\nJe vous confirme la bonne réception de votre message.\n\nJ'étudie attentivement votre demande et je vous recontacte rapidement avec les éléments nécessaires.\n\nN'hésitez pas à me recontacter si vous avez des questions complémentaires.\n\nCordialement,\n[Votre nom]`,
                description: 'Réponse complète et détaillée',
                generatedBy: 'basic-template',
                generatedAt: new Date().toISOString()
            }
        ];
    }

    generateSampleTasks() {
        const sampleTasks = [
            {
                id: 'sample_1',
                title: 'Répondre à l\'équipe marketing sur la campagne Q2',
                description: '📧 RÉSUMÉ EXÉCUTIF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDe: Sarah Martin (acme-corp.com)\nObjet: Demande de validation pour la campagne marketing Q2\n📮 Réponse attendue\n\n🎯 ACTIONS REQUISES:\n1. Valider les visuels de la campagne\n2. Confirmer le budget alloué\n3. Définir les dates de lancement\n\n💡 INFORMATIONS CLÉS:\n• Budget proposé : 50k€\n• Cible : 25-45 ans\n• Canaux : LinkedIn, Google Ads\n\n⚠️ POINTS D\'ATTENTION:\n• Deadline serrée pour le lancement\n• Coordination avec l\'équipe commerciale requise',
                priority: 'high',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                emailDate: '2025-06-06T09:15:00Z',
                emailDomain: 'acme-corp.com',
                emailContent: `Email de: Sarah Martin <sarah.martin@acme-corp.com>\nDate: ${new Date().toLocaleString('fr-FR')}\nSujet: Validation campagne marketing Q2\n\nBonjour,\n\nJ'espère que vous allez bien. Je vous contacte concernant notre campagne marketing Q2 qui nécessite votre validation.\n\nNous avons préparé les éléments suivants :\n- Visuels créatifs pour les réseaux sociaux\n- Budget détaillé de 50k€\n- Calendrier de lancement\n\nPourriez-vous valider ces éléments avant vendredi ? Nous devons coordonner avec l'équipe commerciale pour le lancement.\n\nMerci d'avance,\nSarah Martin`,
                tags: ['marketing', 'validation', 'q2'],
                client: 'ACME Corp',
                dueDate: '2025-06-20',
                needsReply: true,
                summary: 'Validation urgente de la campagne marketing Q2 avec budget de 50k€',
                actions: [
                    { text: 'Valider les visuels de la campagne', deadline: null },
                    { text: 'Confirmer le budget alloué', deadline: '2025-06-18' },
                    { text: 'Définir les dates de lancement', deadline: null }
                ],
                keyInfo: [
                    'Budget proposé : 50k€',
                    'Cible : 25-45 ans',
                    'Canaux : LinkedIn, Google Ads'
                ],
                risks: [
                    'Deadline serrée pour le lancement',
                    'Coordination avec l\'équipe commerciale requise'
                ],
                method: 'ai'
            },
            {
                id: 'sample_2',
                title: 'Préparer présentation trimestrielle',
                description: 'Préparer la présentation des résultats Q1 pour le comité de direction',
                priority: 'medium',
                status: 'in-progress',
                category: 'work',
                client: 'Direction',
                dueDate: '2025-06-25',
                summary: 'Présentation des résultats trimestriels avec analyse des performances',
                actions: [
                    { text: 'Collecter les données financières', deadline: '2025-06-22' },
                    { text: 'Créer les graphiques', deadline: '2025-06-24' },
                    { text: 'Répéter la présentation', deadline: '2025-06-25' }
                ],
                keyInfo: [
                    'Résultats Q1 en hausse de 15%',
                    'Nouveau client majeur acquis',
                    'Équipe agrandie de 3 personnes'
                ],
                method: 'manual'
            },
            {
                id: 'sample_3',
                title: 'Répondre à Jean Dupont - Devis urgent',
                description: 'Jean Dupont demande un devis pour un projet de refonte website',
                priority: 'urgent',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'jean.dupont@example.com',
                emailFromName: 'Jean Dupont',
                emailSubject: 'Demande de devis - Refonte site web',
                emailDate: '2025-06-15T14:30:00Z',
                emailDomain: 'example.com',
                client: 'Jean Dupont',
                dueDate: '2025-06-17',
                needsReply: true,
                summary: 'Demande de devis urgent pour refonte complète du site web',
                method: 'ai'
            }
        ];
        
        // Assurer les propriétés complètes pour chaque tâche
        this.tasks = sampleTasks.map(task => this.ensureTaskProperties(task));
        this.saveTasks();
    }

    // ================================================
    // MÉTHODES CRUD COMPLÈTES
    // ================================================
    
    createTask(taskData) {
        console.log('[TaskManager] Creating task:', taskData.title || 'Untitled');
        
        const task = this.ensureTaskProperties({
            ...taskData,
            id: taskData.id || this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        console.log('[TaskManager] Task created successfully:', task.id);
        return task;
    }

    createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email:', taskData.title);
        
        const fullEmailContent = this.extractFullEmailContent(email, taskData);
        const htmlEmailContent = this.extractHtmlEmailContent(email, taskData);
        
        const task = this.ensureTaskProperties({
            ...taskData,
            id: taskData.id || this.generateId(),
            hasEmail: true,
            emailContent: fullEmailContent,
            emailHtmlContent: htmlEmailContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        console.log('[TaskManager] Email task created successfully:', task.id);
        return task;
    }

    updateTask(id, updates) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) {
            console.error('[TaskManager] Task not found for update:', id);
            return null;
        }
        
        this.tasks[index] = this.ensureTaskProperties({
            ...this.tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        if (updates.status === 'completed' && !this.tasks[index].completedAt) {
            this.tasks[index].completedAt = new Date().toISOString();
        }
        
        this.saveTasks();
        this.emitTaskUpdate('update', this.tasks[index]);
        
        console.log('[TaskManager] Task updated successfully:', id);
        return this.tasks[index];
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) {
            console.error('[TaskManager] Task not found for deletion:', id);
            return null;
        }
        
        const deleted = this.tasks.splice(index, 1)[0];
        this.saveTasks();
        this.emitTaskUpdate('delete', deleted);
        
        console.log('[TaskManager] Task deleted successfully:', id);
        return deleted;
    }

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    getAllTasks() {
        return [...this.tasks];
    }

    // ================================================
    // MÉTHODES DE FILTRAGE ET TRI
    // ================================================
    
    filterTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(task => task.category === filters.category);
        }
        
        if (filters.client && filters.client !== 'all') {
            filtered = filtered.filter(task => task.client === filters.client);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                (task.emailFromName && task.emailFromName.toLowerCase().includes(search)) ||
                (task.client && task.client.toLowerCase().includes(search))
            );
        }
        
        if (filters.overdue) {
            filtered = filtered.filter(task => {
                if (!task.dueDate || task.status === 'completed') return false;
                return new Date(task.dueDate) < new Date();
            });
        }
        
        if (filters.needsReply) {
            filtered = filtered.filter(task => 
                task.needsReply || (task.hasEmail && !task.emailReplied && task.status !== 'completed')
            );
        }
        
        return this.sortTasks(filtered, filters.sortBy || 'created');
    }

    sortTasks(tasks, sortBy) {
        const sorted = [...tasks];
        
        switch (sortBy) {
            case 'priority':
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'dueDate':
                sorted.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'title':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'client':
                sorted.sort((a, b) => a.client.localeCompare(b.client));
                break;
            case 'updated':
                sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'created':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return sorted;
    }

    // ================================================
    // STATISTIQUES
    // ================================================
    
    getStats() {
        const byStatus = {
            todo: this.tasks.filter(t => t.status === 'todo').length,
            'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
            completed: this.tasks.filter(t => t.status === 'completed').length
        };

        return {
            total: this.tasks.length,
            byStatus,
            todo: byStatus.todo,
            inProgress: byStatus['in-progress'],
            completed: byStatus.completed,
            overdue: this.tasks.filter(t => {
                if (!t.dueDate || t.status === 'completed') return false;
                return new Date(t.dueDate) < new Date();
            }).length,
            needsReply: this.tasks.filter(t => 
                t.needsReply || (t.hasEmail && !t.emailReplied && t.status !== 'completed')
            ).length
        };
    }

    // ================================================
    // EXPORT/IMPORT EXCEL - NOUVEAU
    // ================================================
    
    async exportToExcel() {
        try {
            // Créer un workbook
            const workbook = {
                SheetNames: ['Tâches'],
                Sheets: {}
            };

            // Préparer les données
            const exportData = this.tasks.map(task => ({
                'ID': task.id,
                'Titre': task.title,
                'Description': task.description,
                'Priorité': this.getPriorityLabel(task.priority),
                'Statut': this.getStatusLabel(task.status),
                'Client/Projet': task.client,
                'Catégorie': task.category,
                'Date d\'échéance': task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '',
                'A un email': task.hasEmail ? 'Oui' : 'Non',
                'Expéditeur': task.emailFromName || task.emailFrom || '',
                'Sujet email': task.emailSubject || '',
                'Réponse requise': task.needsReply ? 'Oui' : 'Non',
                'Email répondu': task.emailReplied ? 'Oui' : 'Non',
                'Date de création': new Date(task.createdAt).toLocaleDateString('fr-FR'),
                'Dernière modification': new Date(task.updatedAt).toLocaleDateString('fr-FR'),
                'Date de completion': task.completedAt ? new Date(task.completedAt).toLocaleDateString('fr-FR') : '',
                'Méthode de création': task.method,
                'Tags': task.tags.join(', '),
                'Résumé': task.summary,
                'Actions requises': task.actions.map(a => a.text).join('; '),
                'Informations clés': task.keyInfo.join('; '),
                'Points d\'attention': task.risks.join('; ')
            }));

            // Créer la feuille
            workbook.Sheets['Tâches'] = this.jsonToWorksheet(exportData);

            // Générer le fichier Excel
            const excelBuffer = this.writeWorkbook(workbook);
            
            // Télécharger le fichier
            const blob = new Blob([excelBuffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `taches_${new Date().toISOString().split('T')[0]}.xlsx`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return { success: true, message: 'Export Excel terminé avec succès' };
        } catch (error) {
            console.error('[TaskManager] Export Excel error:', error);
            return { success: false, message: 'Erreur lors de l\'export Excel: ' + error.message };
        }
    }

    async importFromExcel(file) {
        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const workbook = this.readWorkbook(arrayBuffer);
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = this.worksheetToJson(worksheet);
            
            if (!jsonData || jsonData.length === 0) {
                return { success: false, message: 'Aucune donnée trouvée dans le fichier Excel' };
            }

            let imported = 0;
            let updated = 0;
            let errors = 0;

            for (const row of jsonData) {
                try {
                    const taskData = this.parseExcelRowToTask(row);
                    
                    if (!taskData.title) {
                        errors++;
                        continue;
                    }

                    // Vérifier si la tâche existe déjà
                    const existingTask = this.tasks.find(t => t.id === taskData.id);
                    
                    if (existingTask) {
                        // Mettre à jour la tâche existante
                        this.updateTask(taskData.id, taskData);
                        updated++;
                    } else {
                        // Créer une nouvelle tâche
                        this.createTask(taskData);
                        imported++;
                    }
                } catch (error) {
                    console.error('[TaskManager] Error importing row:', error);
                    errors++;
                }
            }

            const message = `Import terminé: ${imported} nouvelles tâches, ${updated} mises à jour, ${errors} erreurs`;
            return { success: true, message, imported, updated, errors };

        } catch (error) {
            console.error('[TaskManager] Import Excel error:', error);
            return { success: false, message: 'Erreur lors de l\'import Excel: ' + error.message };
        }
    }

    parseExcelRowToTask(row) {
        return {
            id: row['ID'] || this.generateId(),
            title: row['Titre'] || '',
            description: row['Description'] || '',
            priority: this.parsePriorityFromLabel(row['Priorité']) || 'medium',
            status: this.parseStatusFromLabel(row['Statut']) || 'todo',
            client: row['Client/Projet'] || 'Interne',
            category: row['Catégorie'] || 'work',
            dueDate: this.parseExcelDate(row['Date d\'échéance']),
            hasEmail: row['A un email'] === 'Oui',
            emailFromName: row['Expéditeur'] || null,
            emailFrom: row['Expéditeur'] || null,
            emailSubject: row['Sujet email'] || null,
            needsReply: row['Réponse requise'] === 'Oui',
            emailReplied: row['Email répondu'] === 'Oui',
            method: row['Méthode de création'] || 'manual',
            tags: row['Tags'] ? row['Tags'].split(', ').filter(t => t.trim()) : [],
            summary: row['Résumé'] || '',
            actions: row['Actions requises'] ? row['Actions requises'].split('; ').map(text => ({ text: text.trim(), deadline: null })) : [],
            keyInfo: row['Informations clés'] ? row['Informations clés'].split('; ').filter(i => i.trim()) : [],
            risks: row['Points d\'attention'] ? row['Points d\'attention'].split('; ').filter(r => r.trim()) : []
        };
    }

    parsePriorityFromLabel(label) {
        const priorities = {
            'Basse': 'low',
            'Normale': 'medium', 
            'Haute': 'high',
            'Urgente': 'urgent'
        };
        return priorities[label] || 'medium';
    }

    parseStatusFromLabel(label) {
        const statuses = {
            'À faire': 'todo',
            'En cours': 'in-progress',
            'Terminé': 'completed'
        };
        return statuses[label] || 'todo';
    }

    parseExcelDate(dateStr) {
        if (!dateStr || dateStr.trim() === '') return null;
        
        try {
            // Essayer de parser différents formats de date
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                // Format DD/MM/YYYY
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Les mois commencent à 0
                const year = parseInt(parts[2]);
                const date = new Date(year, month, day);
                return date.toISOString().split('T')[0];
            }
            return null;
        } catch (error) {
            console.error('Error parsing date:', dateStr);
            return null;
        }
    }

    // Utilitaires Excel basiques (simulation des fonctions XLSX)
    jsonToWorksheet(jsonData) {
        if (!jsonData || jsonData.length === 0) return {};
        
        const worksheet = {};
        const headers = Object.keys(jsonData[0]);
        
        // Headers
        headers.forEach((header, colIndex) => {
            const cellRef = this.encodeCellAddress(0, colIndex);
            worksheet[cellRef] = { v: header, t: 's' };
        });
        
        // Data rows
        jsonData.forEach((row, rowIndex) => {
            headers.forEach((header, colIndex) => {
                const cellRef = this.encodeCellAddress(rowIndex + 1, colIndex);
                const cellValue = row[header];
                
                if (cellValue !== null && cellValue !== undefined) {
                    worksheet[cellRef] = { v: cellValue, t: 's' };
                }
            });
        });
        
        // Range
        const lastRow = jsonData.length;
        const lastCol = headers.length - 1;
        worksheet['!ref'] = `A1:${this.encodeCellAddress(lastRow, lastCol)}`;
        
        return worksheet;
    }

    worksheetToJson(worksheet) {
        if (!worksheet || !worksheet['!ref']) return [];
        
        const range = this.decodeRange(worksheet['!ref']);
        const jsonData = [];
        
        if (range.e.r < 1) return []; // Pas de données
        
        // Lire les headers
        const headers = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellRef = this.encodeCellAddress(0, col);
            const cell = worksheet[cellRef];
            headers.push(cell ? cell.v : `Col${col}`);
        }
        
        // Lire les données
        for (let row = 1; row <= range.e.r; row++) {
            const rowData = {};
            let hasData = false;
            
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellRef = this.encodeCellAddress(row, col);
                const cell = worksheet[cellRef];
                const header = headers[col - range.s.c];
                
                if (cell && cell.v !== undefined) {
                    rowData[header] = cell.v;
                    hasData = true;
                } else {
                    rowData[header] = '';
                }
            }
            
            if (hasData) {
                jsonData.push(rowData);
            }
        }
        
        return jsonData;
    }

    writeWorkbook(workbook) {
        // Simulation simplifiée d'export Excel
        // Dans un vrai projet, utiliser la libraire SheetJS
        const csvContent = this.workbookToCSV(workbook);
        return new TextEncoder().encode(csvContent);
    }

    readWorkbook(arrayBuffer) {
        // Simulation simplifiée d'import Excel
        // Dans un vrai projet, utiliser la libraire SheetJS
        const text = new TextDecoder().decode(arrayBuffer);
        return this.csvToWorkbook(text);
    }

    workbookToCSV(workbook) {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet['!ref']) return '';
        
        const range = this.decodeRange(worksheet['!ref']);
        const csvRows = [];
        
        for (let row = range.s.r; row <= range.e.r; row++) {
            const csvRow = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellRef = this.encodeCellAddress(row, col);
                const cell = worksheet[cellRef];
                const value = cell ? cell.v : '';
                csvRow.push(`"${String(value).replace(/"/g, '""')}"`);
            }
            csvRows.push(csvRow.join(','));
        }
        
        return csvRows.join('\n');
    }

    csvToWorkbook(csvText) {
        const lines = csvText.split('\n');
        const worksheet = {};
        
        lines.forEach((line, rowIndex) => {
            if (line.trim()) {
                const cells = this.parseCSVLine(line);
                cells.forEach((cell, colIndex) => {
                    const cellRef = this.encodeCellAddress(rowIndex, colIndex);
                    worksheet[cellRef] = { v: cell, t: 's' };
                });
            }
        });
        
        if (lines.length > 0) {
            const maxCols = Math.max(...lines.map(line => this.parseCSVLine(line).length));
            worksheet['!ref'] = `A1:${this.encodeCellAddress(lines.length - 1, maxCols - 1)}`;
        }
        
        return {
            SheetNames: ['Sheet1'],
            Sheets: { 'Sheet1': worksheet }
        };
    }

    parseCSVLine(line) {
        const cells = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                cells.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        cells.push(current);
        return cells;
    }

    encodeCellAddress(row, col) {
        let colStr = '';
        col++;
        while (col > 0) {
            col--;
            colStr = String.fromCharCode(65 + (col % 26)) + colStr;
            col = Math.floor(col / 26);
        }
        return colStr + (row + 1);
    }

    decodeRange(rangeStr) {
        const [start, end] = rangeStr.split(':');
        return {
            s: this.decodeCellAddress(start),
            e: this.decodeCellAddress(end)
        };
    }

    decodeCellAddress(cellStr) {
        const colMatch = cellStr.match(/[A-Z]+/);
        const rowMatch = cellStr.match(/\d+/);
        
        let col = 0;
        const colStr = colMatch[0];
        for (let i = 0; i < colStr.length; i++) {
            col = col * 26 + (colStr.charCodeAt(i) - 64);
        }
        col--;
        
        const row = parseInt(rowMatch[0]) - 1;
        
        return { r: row, c: col };
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    getPriorityLabel(priority) {
        const labels = { urgent: 'Urgente', high: 'Haute', medium: 'Normale', low: 'Basse' };
        return labels[priority] || 'Normale';
    }

    getStatusLabel(status) {
        const labels = { todo: 'À faire', 'in-progress': 'En cours', completed: 'Terminé' };
        return labels[status] || 'À faire';
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    extractFullEmailContent(email, taskData) {
        if (taskData.emailContent && taskData.emailContent.length > 50) {
            return taskData.emailContent;
        }
        
        if (email?.body?.content) {
            return this.cleanEmailContent(email.body.content);
        }
        
        if (email?.bodyPreview) {
            return email.bodyPreview;
        }
        
        return taskData.emailContent || '';
    }

    extractHtmlEmailContent(email, taskData) {
        if (taskData.emailHtmlContent && taskData.emailHtmlContent.length > 50) {
            return taskData.emailHtmlContent;
        }
        
        if (email?.body?.contentType === 'html' && email?.body?.content) {
            return this.cleanHtmlEmailContent(email.body.content);
        }
        
        return this.convertTextToHtml(this.extractFullEmailContent(email, taskData), email);
    }

    cleanEmailContent(content) {
        if (!content) return '';
        
        return content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
    }

    cleanHtmlEmailContent(htmlContent) {
        if (!htmlContent) return '';
        
        let cleanHtml = htmlContent
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
        
        return `<div class="email-content-viewer" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${cleanHtml}</div>`;
    }

    convertTextToHtml(textContent, email) {
        if (!textContent) return '';
        
        const senderName = email?.from?.emailAddress?.name || 'Expéditeur';
        const senderEmail = email?.from?.emailAddress?.address || '';
        const subject = email?.subject || 'Sans sujet';
        const date = email?.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString('fr-FR') : '';
        
        const htmlContent = textContent
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        return `<div class="email-content-viewer" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                    <strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;<br>
                    <strong>Date:</strong> ${date}<br>
                    <strong>Sujet:</strong> ${subject}
                </div>
            </div>
            <div style="font-size: 14px; line-height: 1.8;">
                ${htmlContent}
            </div>
        </div>`;
    }

    saveTasks() {
        try {
            localStorage.setItem('emailsort_tasks', JSON.stringify(this.tasks));
            console.log(`[TaskManager] Saved ${this.tasks.length} tasks`);
            return true;
        } catch (error) {
            console.error('[TaskManager] Error saving tasks:', error);
            return false;
        }
    }

    emitTaskUpdate(action, task) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { action, task }
            }));
        }
    }
}

// =====================================
// TASKS VIEW - DESIGN CHALEUREUX
// =====================================
class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all', 
            category: 'all',
            client: 'all',
            search: '',
            sortBy: 'created'
        };
        
        this.selectedTasks = new Set();
        this.currentViewMode = 'normal'; // normal, minimal, detailed
        this.showCompleted = false;
        this.showAdvancedFilters = false;
        
        window.addEventListener('taskUpdate', () => {
            this.refreshView();
        });
    }

    render(container) {
        if (!container) {
            console.error('[TasksView] No container provided');
            return;
        }

        if (!window.taskManager || !window.taskManager.initialized) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-icon">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Chargement des tâches...</p>
                </div>
            `;
            
            setTimeout(() => {
                if (window.taskManager && window.taskManager.initialized) {
                    this.render(container);
                }
            }, 500);
            return;
        }

        const stats = window.taskManager.getStats();
        const selectedCount = this.selectedTasks.size;
        
        container.innerHTML = `
            <div class="tasks-page-warm">
                <!-- PANNEAU DE CONTRÔLE CHALEUREUX -->
                <div class="controls-section-warm">
                    <!-- Ligne 1 : Recherche + Actions principales -->
                    <div class="main-controls-line">
                        <!-- Recherche -->
                        <div class="search-section">
                            <div class="search-box-warm">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" 
                                       class="search-input-warm" 
                                       id="taskSearchInput"
                                       placeholder="Rechercher tâches..." 
                                       value="${this.currentFilters.search}">
                                ${this.currentFilters.search ? `
                                    <button class="search-clear" onclick="window.tasksView.clearSearch()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Actions principales -->
                        <div class="main-actions">
                            <!-- Sélection info et actions -->
                            ${selectedCount > 0 ? `
                                <div class="selection-panel">
                                    <span class="selection-count">${selectedCount} sélectionné(s)</span>
                                    <button class="btn-action btn-clear" onclick="window.tasksView.clearSelection()" title="Effacer sélection">
                                        <i class="fas fa-times"></i>
                                    </button>
                                    <button class="btn-action btn-bulk" onclick="window.tasksView.bulkActions()" title="Actions groupées">
                                        Actions
                                        <span class="count-badge">${selectedCount}</span>
                                    </button>
                                </div>
                            ` : ''}
                            
                            <!-- Import/Export Excel -->
                            <button class="btn-action btn-import" onclick="window.tasksView.showImportModal()" title="Importer depuis Excel">
                                <i class="fas fa-file-import"></i>
                                Importer
                            </button>
                            
                            <button class="btn-action btn-export" onclick="window.tasksView.exportToExcel()" title="Exporter vers Excel">
                                <i class="fas fa-file-export"></i>
                                Exporter
                            </button>
                            
                            <!-- Bouton Sélectionner tout -->
                            <button class="btn-action btn-select-all" onclick="window.tasksView.selectAllVisible()" title="Sélectionner toutes les tâches visibles">
                                <i class="fas fa-check-square"></i>
                                Tout sélectionner
                            </button>

                            <!-- Actions standard -->
                            <button class="btn-action btn-refresh" onclick="window.tasksView.refreshTasks()" title="Actualiser">
                                <i class="fas fa-sync-alt"></i>
                                Actualiser
                            </button>
                            
                            <button class="btn-action btn-new" onclick="window.tasksView.showCreateModal()" title="Nouvelle tâche">
                                <i class="fas fa-plus"></i>
                                Nouvelle
                            </button>
                            
                            <button class="btn-action btn-filters ${this.showAdvancedFilters ? 'active' : ''}" 
                                    onclick="window.tasksView.toggleAdvancedFilters()" 
                                    title="Afficher/Masquer les filtres avancés">
                                <i class="fas fa-filter"></i>
                                Filtres
                                <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Ligne 2 : Modes de vue + Filtres de statut -->
                    <div class="views-filters-line">
                        <!-- Modes de vue -->
                        <div class="view-modes">
                            <button class="view-mode ${this.currentViewMode === 'minimal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('minimal')"
                                    title="Vue minimaliste">
                                Minimal
                            </button>
                            <button class="view-mode ${this.currentViewMode === 'normal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('normal')"
                                    title="Vue normale">
                                Normal
                            </button>
                            <button class="view-mode ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('detailed')"
                                    title="Vue détaillée">
                                Détaillé
                            </button>
                        </div>
                        
                        <!-- Filtres de statut -->
                        <div class="status-filters">
                            ${this.buildStatusPills(stats)}
                        </div>
                    </div>
                </div>

                <!-- Filtres avancés -->
                <div class="advanced-filters-panel ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                    <div class="advanced-filters-grid">
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-flag"></i> Priorité
                            </label>
                            <select class="filter-select" id="priorityFilter" 
                                    onchange="window.tasksView.updateFilter('priority', this.value)">
                                <option value="all" ${this.currentFilters.priority === 'all' ? 'selected' : ''}>Toutes</option>
                                <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                                <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-building"></i> Client
                            </label>
                            <select class="filter-select" id="clientFilter" 
                                    onchange="window.tasksView.updateFilter('client', this.value)">
                                ${this.buildClientFilterOptions()}
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-sort"></i> Trier par
                            </label>
                            <select class="filter-select" id="sortByFilter" 
                                    onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Date création</option>
                                <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                                <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Date échéance</option>
                                <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                                <option value="client" ${this.currentFilters.sortBy === 'client' ? 'selected' : ''}>Client</option>
                            </select>
                        </div>

                        <div class="filter-actions">
                            <button class="btn-action btn-reset" onclick="window.tasksView.resetAllFilters()">
                                <i class="fas fa-undo"></i>
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tasks-container" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addWarmStyles();
        this.setupEventListeners();
        console.log('[TasksView] Interface chaleureuse rendue avec Excel I/O');
    }

    buildStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Tous', icon: '📋', count: stats.total },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.completed }
        ];

        return pills.map(pill => `
            <button class="status-pill ${this.isFilterActive(pill.id) ? 'active' : ''}" 
                    data-filter="${pill.id}"
                    onclick="window.tasksView.quickFilter('${pill.id}')"
                    title="${pill.name}: ${pill.count} tâche(s)">
                <span class="pill-icon">${pill.icon}</span>
                <span class="pill-text">${pill.name}</span>
                <span class="pill-count">${pill.count}</span>
            </button>
        `).join('');
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'minimal':
                return this.renderMinimalView(filteredTasks);
            case 'detailed':
                return this.renderDetailedView(filteredTasks);
            case 'normal':
            default:
                return this.renderNormalView(filteredTasks);
        }
    }

    renderMinimalView(tasks) {
        return `
            <div class="tasks-minimal-list">
                ${tasks.map(task => this.renderMinimalTaskItem(task)).join('')}
            </div>
        `;
    }

    renderMinimalTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-minimal ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <div class="task-content-line">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="task-info">
                        <span class="task-title">${this.escapeHtml(task.title)}</span>
                        <span class="task-client">${this.escapeHtml(task.client === 'Externe' ? (task.emailFromName || task.emailFrom || 'Société') : task.client)}</span>
                    </div>
                    
                    <div class="task-meta">
                        <span class="task-deadline ${dueDateInfo.className}">
                            ${dueDateInfo.text || 'Pas d\'échéance'}
                        </span>
                    </div>
                    
                    <div class="task-actions">
                        ${this.renderTaskActions(task)}
                    </div>
                </div>
            </div>
        `;
    }

    renderNormalView(tasks) {
        return `
            <div class="tasks-normal-list">
                ${tasks.map(task => this.renderNormalTaskItem(task)).join('')}
            </div>
        `;
    }

    renderNormalTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusIcon = this.getStatusIcon(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-normal ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <div class="task-content-line">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="priority-bar" style="background-color: ${this.getPriorityColor(task.priority)}"></div>
                    
                    <div class="task-main">
                        <div class="task-header">
                            <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        </div>
                        
                        <div class="task-details">
                            <span class="task-client">
                                ${this.escapeHtml(task.client === 'Externe' ? (task.emailFromName || task.emailFrom || 'Société') : task.client)}
                            </span>
                            <span class="task-deadline ${dueDateInfo.className}">
                                ${dueDateInfo.text || 'Pas d\'échéance'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="task-actions">
                        ${this.renderTaskActions(task)}
                    </div>
                </div>
            </div>
        `;
    }

    renderDetailedView(tasks) {
        return `
            <div class="tasks-detailed-grid">
                ${tasks.map(task => this.renderDetailedTaskItem(task)).join('')}
            </div>
        `;
    }

    renderDetailedTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-detailed ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                
                <div class="task-detailed-header">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                </div>
                
                <div class="task-detailed-content">
                    <h3 class="task-title" onclick="window.tasksView.showTaskDetails('${task.id}')">${this.escapeHtml(task.title)}</h3>
                    <p class="task-description">${this.escapeHtml(task.description.substring(0, 150))}${task.description.length > 150 ? '...' : ''}</p>
                    
                    <div class="task-meta-grid">
                        <div class="meta-item">
                            <span>${this.escapeHtml(task.client === 'Externe' ? (task.emailFromName || task.emailFrom || 'Société') : task.client)}</span>
                        </div>
                        <div class="meta-item deadline-centered ${dueDateInfo.className}">
                            <span>${dueDateInfo.text || 'Pas d\'échéance'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="task-detailed-actions">
                    ${this.renderDetailedActions(task)}
                </div>
            </div>
        `;
    }

    renderTaskActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${task.id}')"
                    title="Modifier la tâche">
                <i class="fas fa-edit"></i>
            </button>
        `);
        
        actions.push(`
            <button class="action-btn details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        if (task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0) {
            actions.push(`
                <button class="action-btn reply" 
                        onclick="event.stopPropagation(); window.tasksView.showSuggestedReplies('${task.id}')"
                        title="Suggestions de réponse">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        return actions.join('');
    }

    renderDetailedActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="btn-detailed complete" 
                        onclick="window.tasksView.markComplete('${task.id}')">
                    <i class="fas fa-check"></i>
                    Terminé
                </button>
            `);
        }
        
        actions.push(`
            <button class="btn-detailed edit" 
                    onclick="window.tasksView.showEditModal('${task.id}')">
                <i class="fas fa-edit"></i>
                Modifier
            </button>
        `);
        
        actions.push(`
            <button class="btn-detailed details" 
                    onclick="window.tasksView.showTaskDetails('${task.id}')">
                <i class="fas fa-eye"></i>
                Détails
            </button>
        `);
        
        return actions.join('');
    }

    // ================================================
    // EXPORT/IMPORT EXCEL - NOUVEAU
    // ================================================

    async exportToExcel() {
        try {
            this.showToast('Export Excel en cours...', 'info');
            const result = await window.taskManager.exportToExcel();
            
            if (result.success) {
                this.showToast(result.message, 'success');
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('[TasksView] Export error:', error);
            this.showToast('Erreur lors de l\'export Excel', 'error');
        }
    }

    showImportModal() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'import_excel_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-file-import"></i> Importer depuis Excel</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="import-instructions">
                            <div class="instruction-item">
                                <i class="fas fa-info-circle"></i>
                                <div>
                                    <strong>Format attendu:</strong> Fichier Excel (.xlsx) ou CSV
                                </div>
                            </div>
                            <div class="instruction-item">
                                <i class="fas fa-table"></i>
                                <div>
                                    <strong>Colonnes supportées:</strong> Titre, Description, Priorité, Statut, Client/Projet, etc.
                                </div>
                            </div>
                            <div class="instruction-item">
                                <i class="fas fa-download"></i>
                                <div>
                                    <strong>Astuce:</strong> Exportez d'abord vos tâches pour voir le format exact
                                </div>
                            </div>
                        </div>
                        
                        <div class="file-upload-zone" id="fileUploadZone">
                            <div class="upload-icon">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <div class="upload-text">
                                <p><strong>Glissez-déposez votre fichier ici</strong></p>
                                <p>ou cliquez pour sélectionner</p>
                            </div>
                            <input type="file" id="excelFileInput" accept=".xlsx,.xls,.csv" style="display: none;">
                        </div>
                        
                        <div id="importPreview" class="import-preview" style="display: none;">
                            <h4>Aperçu du fichier</h4>
                            <div id="previewContent"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Annuler
                        </button>
                        <button class="btn-modal btn-primary" id="importButton" onclick="window.tasksView.importExcelFile('${uniqueId}')" disabled>
                            <i class="fas fa-file-import"></i> Importer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        this.setupImportModal(uniqueId);
    }

    setupImportModal(modalId) {
        const fileInput = document.getElementById('excelFileInput');
        const uploadZone = document.getElementById('fileUploadZone');
        const importButton = document.getElementById('importButton');
        
        // Click to select file
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0], modalId);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0], modalId);
            }
        });
    }

    async handleFileSelection(file, modalId) {
        const uploadZone = document.getElementById('fileUploadZone');
        const preview = document.getElementById('importPreview');
        const importButton = document.getElementById('importButton');
        
        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
            this.showToast('Type de fichier non supporté. Utilisez .xlsx, .xls ou .csv', 'error');
            return;
        }
        
        try {
            // Update UI
            uploadZone.innerHTML = `
                <div class="file-selected">
                    <i class="fas fa-file-excel"></i>
                    <span>${file.name}</span>
                    <small>${this.formatFileSize(file.size)}</small>
                </div>
            `;
            
            // Store file for import
            this.selectedFile = file;
            
            // Show preview (simplified)
            preview.style.display = 'block';
            preview.innerHTML = `
                <h4>Fichier sélectionné</h4>
                <div class="file-info">
                    <div><strong>Nom:</strong> ${file.name}</div>
                    <div><strong>Taille:</strong> ${this.formatFileSize(file.size)}</div>
                    <div><strong>Type:</strong> ${file.type || 'CSV'}</div>
                </div>
                <p class="preview-note">
                    <i class="fas fa-info-circle"></i>
                    Le fichier sera traité lors de l'import. Les tâches existantes avec le même ID seront mises à jour.
                </p>
            `;
            
            importButton.disabled = false;
            
        } catch (error) {
            console.error('[TasksView] File handling error:', error);
            this.showToast('Erreur lors de la lecture du fichier', 'error');
        }
    }

    async importExcelFile(modalId) {
        if (!this.selectedFile) {
            this.showToast('Aucun fichier sélectionné', 'warning');
            return;
        }

        try {
            const importButton = document.getElementById('importButton');
            importButton.disabled = true;
            importButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Import en cours...';
            
            const result = await window.taskManager.importFromExcel(this.selectedFile);
            
            if (result.success) {
                this.showToast(result.message, 'success');
                this.closeModal(modalId);
                this.refreshView();
            } else {
                this.showToast(result.message, 'error');
                importButton.disabled = false;
                importButton.innerHTML = '<i class="fas fa-file-import"></i> Importer';
            }
            
        } catch (error) {
            console.error('[TasksView] Import error:', error);
            this.showToast('Erreur lors de l\'import', 'error');
            
            const importButton = document.getElementById('importButton');
            importButton.disabled = false;
            importButton.innerHTML = '<i class="fas fa-file-import"></i> Importer';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ================================================
    // MÉTHODES D'INTERACTION (inchangées)
    // ================================================

    selectAllVisible() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            this.showToast('Aucune tâche à sélectionner', 'info');
            return;
        }

        const allSelected = filteredTasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            filteredTasks.forEach(task => this.selectedTasks.delete(task.id));
            this.showToast('Toutes les tâches désélectionnées', 'info');
        } else {
            filteredTasks.forEach(task => this.selectedTasks.add(task.id));
            this.showToast(`${filteredTasks.length} tâche(s) sélectionnée(s)`, 'success');
        }
        
        this.refreshView();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refreshView();
        this.showToast('Sélection effacée', 'info');
    }

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refreshView();
    }

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            'Marquer comme terminé',
            'Changer la priorité',
            'Changer le statut',
            'Supprimer',
            'Exporter sélection'
        ];
        
        const action = prompt(`Actions disponibles pour ${this.selectedTasks.size} tâche(s):\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nEntrez le numéro de l'action:`);
        
        if (!action) return;
        
        const actionIndex = parseInt(action) - 1;
        
        switch (actionIndex) {
            case 0: // Marquer comme terminé
                this.selectedTasks.forEach(taskId => {
                    window.taskManager.updateTask(taskId, { 
                        status: 'completed',
                        completedAt: new Date().toISOString()
                    });
                });
                this.showToast(`${this.selectedTasks.size} tâche(s) marquée(s) comme terminée(s)`, 'success');
                this.clearSelection();
                break;
                
            case 1: // Changer la priorité
                const priority = prompt('Nouvelle priorité:\n1. Basse\n2. Normale\n3. Haute\n4. Urgente\n\nEntrez le numéro:');
                const priorities = ['', 'low', 'medium', 'high', 'urgent'];
                if (priority && priorities[parseInt(priority)]) {
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.updateTask(taskId, { priority: priorities[parseInt(priority)] });
                    });
                    this.showToast(`Priorité mise à jour pour ${this.selectedTasks.size} tâche(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 2: // Changer le statut
                const status = prompt('Nouveau statut:\n1. À faire\n2. En cours\n3. Terminé\n\nEntrez le numéro:');
                const statuses = ['', 'todo', 'in-progress', 'completed'];
                if (status && statuses[parseInt(status)]) {
                    this.selectedTasks.forEach(taskId => {
                        const updates = { status: statuses[parseInt(status)] };
                        if (updates.status === 'completed') {
                            updates.completedAt = new Date().toISOString();
                        }
                        window.taskManager.updateTask(taskId, updates);
                    });
                    this.showToast(`Statut mis à jour pour ${this.selectedTasks.size} tâche(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 3: // Supprimer
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâche(s) ?\n\nCette action est irréversible.`)) {
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.deleteTask(taskId);
                    });
                    this.showToast(`${this.selectedTasks.size} tâche(s) supprimée(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 4: // Exporter sélection
                this.exportSelectedTasks();
                break;
        }
    }

    exportSelectedTasks() {
        const tasks = Array.from(this.selectedTasks).map(id => window.taskManager.getTask(id)).filter(Boolean);
        
        const csvContent = [
            ['Titre', 'Description', 'Priorité', 'Statut', 'Échéance', 'Client', 'Créé le'].join(','),
            ...tasks.map(task => [
                `"${task.title}"`,
                `"${task.description || ''}"`,
                task.priority,
                task.status,
                task.dueDate || '',
                task.client || '',
                new Date(task.createdAt).toLocaleDateString('fr-FR')
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `taches_selection_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Export de la sélection terminé', 'success');
        this.clearSelection();
    }

    // ================================================
    // MÉTHODES UTILITAIRES (inchangées mais optimisées)
    // ================================================

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    quickFilter(filterId) {
        // Reset filters
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: this.currentFilters.search,
            sortBy: this.currentFilters.sortBy,
            overdue: false,
            needsReply: false
        };

        // Apply specific filter
        switch (filterId) {
            case 'all':
                break;
            case 'todo':
            case 'in-progress':
            case 'completed':
                this.currentFilters.status = filterId;
                break;
            case 'overdue':
                this.currentFilters.overdue = true;
                break;
            case 'needsReply':
                this.currentFilters.needsReply = true;
                break;
        }

        this.refreshView();
    }

    updateFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.refreshView();
    }

    resetAllFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: '',
            sortBy: 'created'
        };
        
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        document.querySelectorAll('.filter-select').forEach(select => {
            if (select.querySelector('option[value="all"]')) {
                select.value = 'all';
            } else if (select.id === 'sortByFilter') {
                select.value = 'created';
            }
        });
        
        this.refreshView();
        this.showToast('Filtres réinitialisés', 'info');
    }

    toggleAdvancedFilters() {
        this.showAdvancedFilters = !this.showAdvancedFilters;
        
        const panel = document.getElementById('advancedFiltersPanel');
        const toggle = document.querySelector('.btn-filters');
        
        if (panel) {
            panel.classList.toggle('show', this.showAdvancedFilters);
        }
        
        if (toggle) {
            toggle.classList.toggle('active', this.showAdvancedFilters);
            const chevron = toggle.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (chevron) {
                chevron.classList.toggle('fa-chevron-down', !this.showAdvancedFilters);
                chevron.classList.toggle('fa-chevron-up', this.showAdvancedFilters);
            }
        }
    }

    buildClientFilterOptions() {
        const tasks = window.taskManager.getAllTasks();
        const clients = new Set();
        
        tasks.forEach(task => {
            if (task.client) {
                clients.add(task.client);
            }
        });
        
        let options = `<option value="all" ${this.currentFilters.client === 'all' ? 'selected' : ''}>Tous les clients</option>`;
        
        Array.from(clients).sort().forEach(client => {
            const count = tasks.filter(t => t.client === client).length;
            options += `<option value="${client}" ${this.currentFilters.client === client ? 'selected' : ''}>${client} (${count})</option>`;
        });
        
        return options;
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        // Mettre à jour les stats dans les pills
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-filters').forEach(container => {
            container.innerHTML = this.buildStatusPills(stats);
        });
        
        // Mettre à jour l'affichage des actions de sélection
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const selectedCount = this.selectedTasks.size;
        const mainActionsDiv = document.querySelector('.main-actions');
        
        if (mainActionsDiv) {
            const existingPanel = mainActionsDiv.querySelector('.selection-panel');
            
            if (selectedCount > 0) {
                const selectionHTML = `
                    <div class="selection-panel">
                        <span class="selection-count">${selectedCount} sélectionné(s)</span>
                        <button class="btn-action btn-clear" onclick="window.tasksView.clearSelection()" title="Effacer sélection">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn-action btn-bulk" onclick="window.tasksView.bulkActions()" title="Actions groupées">
                            Actions
                            <span class="count-badge">${selectedCount}</span>
                        </button>
                    </div>
                `;
                
                if (existingPanel) {
                    existingPanel.outerHTML = selectionHTML;
                } else {
                    mainActionsDiv.insertAdjacentHTML('afterbegin', selectionHTML);
                }
            } else {
                if (existingPanel) {
                    existingPanel.remove();
                }
            }
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    handleSearch(value) {
        this.currentFilters.search = value.trim();
        this.refreshView();
    }

    handleTaskClick(event, taskId) {
        if (event.target.type === 'checkbox') {
            return;
        }
        
        if (event.target.closest('.task-actions')) {
            return;
        }
        
        const now = Date.now();
        const lastClick = this.lastTaskClick || 0;
        
        if (now - lastClick < 300) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleTaskSelection(taskId);
            this.lastTaskClick = 0;
            return;
        }
        
        this.lastTaskClick = now;
        
        setTimeout(() => {
            if (Date.now() - this.lastTaskClick >= 250) {
                this.showTaskDetails(taskId);
            }
        }, 250);
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { 
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        this.showToast('Tâche marquée comme terminée', 'success');
        this.refreshView();
    }

    refreshTasks() {
        this.refreshView();
        this.showToast('Tâches actualisées', 'success');
    }

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.currentFilters.search) {
            title = 'Aucun résultat trouvé';
            text = `Aucune tâche ne correspond à votre recherche "${this.currentFilters.search}"`;
            action = `
                <button class="btn-action btn-primary" onclick="window.tasksView.clearSearch()">
                    <i class="fas fa-undo"></i>
                    Effacer la recherche
                </button>
            `;
        } else if (this.hasActiveFilters()) {
            title = 'Aucune tâche trouvée';
            text = 'Aucune tâche ne correspond à vos critères de filtrage.';
            action = `
                <button class="btn-action btn-primary" onclick="window.tasksView.resetAllFilters()">
                    <i class="fas fa-undo"></i>
                    Réinitialiser les filtres
                </button>
            `;
        } else {
            title = 'Aucune tâche';
            text = 'Vous n\'avez aucune tâche pour le moment.';
            action = `
                <button class="btn-action btn-primary" onclick="window.tasksView.showCreateModal()">
                    <i class="fas fa-plus"></i>
                    Créer votre première tâche
                </button>
            `;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-text">${text}</p>
                ${action}
            </div>
        `;
    }

    isFilterActive(filterId) {
        switch (filterId) {
            case 'all': return this.currentFilters.status === 'all' && !this.currentFilters.overdue && !this.currentFilters.needsReply;
            case 'todo': return this.currentFilters.status === 'todo';
            case 'in-progress': return this.currentFilters.status === 'in-progress';
            case 'completed': return this.currentFilters.status === 'completed';
            case 'overdue': return this.currentFilters.overdue;
            case 'needsReply': return this.currentFilters.needsReply;
            default: return false;
        }
    }

    hasActiveFilters() {
        return this.currentFilters.status !== 'all' ||
               this.currentFilters.priority !== 'all' ||
               this.currentFilters.category !== 'all' ||
               this.currentFilters.client !== 'all' ||
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
    }

    getPriorityIcon(priority) {
        const icons = { urgent: '🚨', high: '⚡', medium: '📌', low: '📄' };
        return icons[priority] || '📌';
    }

    getPriorityColor(priority) {
        // Couleurs plus chaleureuses et professionnelles
        const colors = { 
            urgent: '#e74c3c',    // Rouge chaleureux
            high: '#f39c12',      // Orange doré
            medium: '#3498db',    // Bleu confiance
            low: '#27ae60'        // Vert nature
        };
        return colors[priority] || '#3498db';
    }

    getPriorityLabel(priority) {
        const labels = { urgent: 'Urgente', high: 'Haute', medium: 'Normale', low: 'Basse' };
        return labels[priority] || 'Normale';
    }

    getStatusIcon(status) {
        const icons = { todo: '⏳', 'in-progress': '🔄', completed: '✅' };
        return icons[status] || '⏳';
    }

    getStatusLabel(status) {
        const labels = { todo: 'À faire', 'in-progress': 'En cours', completed: 'Terminé' };
        return labels[status] || 'À faire';
    }

    formatDueDate(dateString) {
        if (!dateString) {
            return { 
                html: '', 
                text: '', 
                className: 'no-deadline' 
            };
        }
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        let className = 'deadline-normal';
        let text = '';
        
        if (diffDays < 0) {
            className = 'deadline-overdue';
            text = `En retard de ${Math.abs(diffDays)}j`;
        } else if (diffDays === 0) {
            className = 'deadline-today';
            text = 'Aujourd\'hui';
        } else if (diffDays === 1) {
            className = 'deadline-tomorrow';
            text = 'Demain';
        } else if (diffDays <= 7) {
            className = 'deadline-week';
            text = `${diffDays}j`;
        } else {
            text = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        
        return {
            html: `<span class="deadline-badge ${className}">📅 ${text}</span>`,
            text: text,
            className: className
        };
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    // ================================================
    // MODALES COMPLÈTES (méthodes existantes...)
    // ================================================

    showCreateModal() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'create_task_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus"></i> Créer une nouvelle tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildCreateForm()}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Annuler
                        </button>
                        <button class="btn-modal btn-primary" onclick="window.tasksView.createNewTask('${uniqueId}')">
                            <i class="fas fa-plus"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const titleInput = document.getElementById('new-task-title');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    buildCreateForm() {
        return `
            <div class="create-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titre de la tâche *</label>
                        <input type="text" id="new-task-title" class="form-input" 
                               placeholder="Titre de la tâche" required />
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="new-task-description" class="form-textarea" rows="4" 
                                  placeholder="Description détaillée..."></textarea>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Priorité</label>
                        <select id="new-task-priority" class="form-select">
                            <option value="low">📄 Basse</option>
                            <option value="medium" selected>📌 Normale</option>
                            <option value="high">⚡ Haute</option>
                            <option value="urgent">🚨 Urgente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date d'échéance</label>
                        <input type="date" id="new-task-duedate" class="form-input" />
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Client/Projet</label>
                        <input type="text" id="new-task-client" class="form-input" 
                               placeholder="Nom du client ou projet" value="Interne" />
                    </div>
                </div>
            </div>
        `;
    }

    createNewTask(modalId) {
        const title = document.getElementById('new-task-title')?.value?.trim();
        const description = document.getElementById('new-task-description')?.value?.trim();
        const priority = document.getElementById('new-task-priority')?.value;
        const dueDate = document.getElementById('new-task-duedate')?.value;
        const client = document.getElementById('new-task-client')?.value?.trim();

        if (!title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        const taskData = {
            title,
            description: description || '',
            priority,
            dueDate: dueDate || null,
            client: client || 'Interne',
            category: 'work',
            method: 'manual'
        };

        try {
            const task = window.taskManager.createTask(taskData);
            this.closeModal(modalId);
            
            this.showToast('Tâche créée avec succès', 'success');
            this.refreshView();
        } catch (error) {
            console.error('[TasksView] Error creating task:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    showEditModal(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'edit_task_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-edit"></i> Modifier la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildEditForm(task)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Annuler
                        </button>
                        <button class="btn-modal btn-primary" onclick="window.tasksView.saveTaskChanges('${task.id}', '${uniqueId}')">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const firstInput = document.querySelector(`#${uniqueId} input, #${uniqueId} textarea`);
            if (firstInput) firstInput.focus();
        }, 100);
    }

    buildEditForm(task) {
        return `
            <div class="edit-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titre de la tâche *</label>
                        <input type="text" id="edit-title" class="form-input" 
                               value="${this.escapeHtml(task.title)}" required />
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="edit-description" class="form-textarea" rows="4">${this.escapeHtml(task.description)}</textarea>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Priorité</label>
                        <select id="edit-priority" class="form-select">
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Statut</label>
                        <select id="edit-status" class="form-select">
                            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>⏳ À faire</option>
                            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>🔄 En cours</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>✅ Terminé</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Client/Projet</label>
                        <input type="text" id="edit-client" class="form-input" 
                               value="${this.escapeHtml(task.client)}" />
                    </div>
                    <div class="form-group">
                        <label>Date d'échéance</label>
                        <input type="date" id="edit-duedate" class="form-input" 
                               value="${task.dueDate || ''}" />
                    </div>
                </div>
                
                ${task.hasEmail ? `
                    <div class="form-section">
                        <h3><i class="fas fa-envelope"></i> Informations Email</h3>
                        <div class="email-info-readonly">
                            <div><strong>De:</strong> ${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}</div>
                            <div><strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject || 'Sans sujet')}</div>
                            <div>
                                <label>
                                    <input type="checkbox" id="edit-needs-reply" ${task.needsReply ? 'checked' : ''} />
                                    Réponse requise
                                </label>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    saveTaskChanges(taskId, modalId) {
        const title = document.getElementById('edit-title')?.value?.trim();
        const description = document.getElementById('edit-description')?.value?.trim();
        const priority = document.getElementById('edit-priority')?.value;
        const status = document.getElementById('edit-status')?.value;
        const client = document.getElementById('edit-client')?.value?.trim();
        const dueDate = document.getElementById('edit-duedate')?.value;
        const needsReply = document.getElementById('edit-needs-reply')?.checked;

        if (!title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        const updates = {
            title,
            description,
            priority,
            status,
            client: client || 'Interne',
            dueDate: dueDate || null,
            needsReply: needsReply || false
        };

        try {
            window.taskManager.updateTask(taskId, updates);
            this.closeModal(modalId);
            this.showToast('Tâche mise à jour avec succès', 'success');
            this.refreshView();
        } catch (error) {
            console.error('Error updating task:', error);
            this.showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'task_details_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-eye"></i> Détails de la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildTaskDetailsContent(task)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Fermer
                        </button>
                        ${task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                            <button class="btn-modal btn-info" onclick="window.tasksView.showSuggestedReplies('${task.id}')">
                                <i class="fas fa-reply"></i> Voir suggestions de réponse
                            </button>
                        ` : ''}
                        <button class="btn-modal btn-primary" onclick="window.tasksView.closeModal('${uniqueId}'); window.tasksView.showEditModal('${task.id}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        ${task.status !== 'completed' ? `
                            <button class="btn-modal btn-success" onclick="window.tasksView.markComplete('${task.id}'); window.tasksView.closeModal('${uniqueId}')">
                                <i class="fas fa-check"></i> Marquer terminé
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildTaskDetailsContent(task) {
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusLabel = this.getStatusLabel(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-details-content">
                <div class="details-header">
                    <h1 class="task-title-details">${this.escapeHtml(task.title)}</h1>
                    <div class="task-meta-badges">
                        <span class="priority-badge-details priority-${task.priority}">
                            ${priorityIcon} ${this.getPriorityLabel(task.priority)}
                        </span>
                        <span class="status-badge-details status-${task.status}">
                            ${this.getStatusIcon(task.status)} ${statusLabel}
                        </span>
                        <span class="deadline-badge-details ${dueDateInfo.className}">
                            <i class="fas fa-calendar"></i>
                            ${dueDateInfo.text || 'Pas d\'échéance définie'}
                        </span>
                    </div>
                </div>

                ${task.description ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="description-content">
                            ${this.formatDescription(task.description)}
                        </div>
                    </div>
                ` : ''}

                <div class="details-section">
                    <h3><i class="fas fa-info-circle"></i> Informations Générales</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Client/Projet:</strong>
                            <span>${this.escapeHtml(task.client)}</span>
                        </div>
                        <div class="info-item">
                            <strong>Créé le:</strong>
                            <span>${new Date(task.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="info-item">
                            <strong>Dernière modification:</strong>
                            <span>${new Date(task.updatedAt).toLocaleString('fr-FR')}</span>
                        </div>
                        ${task.completedAt ? `
                            <div class="info-item">
                                <strong>Terminé le:</strong>
                                <span>${new Date(task.completedAt).toLocaleString('fr-FR')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${task.hasEmail ? `
                    <div class="details-section">
                        <h3><i class="fas fa-envelope"></i> Informations Email</h3>
                        <div class="email-details-grid">
                            <div class="email-detail-item">
                                <strong>Expéditeur:</strong>
                                <span>${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}</span>
                            </div>
                            ${task.emailFrom ? `
                                <div class="email-detail-item">
                                    <strong>Email:</strong>
                                    <span>${this.escapeHtml(task.emailFrom)}</span>
                                </div>
                            ` : ''}
                            ${task.emailSubject ? `
                                <div class="email-detail-item">
                                    <strong>Sujet:</strong>
                                    <span>${this.escapeHtml(task.emailSubject)}</span>
                                </div>
                            ` : ''}
                            <div class="email-detail-item">
                                <strong>Réponse requise:</strong>
                                <span>${task.needsReply ? '✅ Oui' : '❌ Non'}</span>
                            </div>
                        </div>
                        
                        ${task.emailContent && task.emailContent.length > 100 ? `
                            <div class="email-content-section">
                                <h4>Contenu de l'email</h4>
                                <div class="email-content-box">
                                    ${task.emailHtmlContent || this.formatEmailContent(task.emailContent)}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${task.actions && task.actions.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-tasks"></i> Actions Requises</h3>
                        <div class="actions-list-details">
                            ${task.actions.map((action, idx) => `
                                <div class="action-item-details">
                                    <span class="action-number">${idx + 1}</span>
                                    <span class="action-text">${this.escapeHtml(action.text)}</span>
                                    ${action.deadline ? `
                                        <span class="action-deadline">${this.formatDeadline(action.deadline)}</span>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.keyInfo && task.keyInfo.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-lightbulb"></i> Informations Clés</h3>
                        <div class="key-info-grid">
                            ${task.keyInfo.map(info => `
                                <div class="key-info-item">
                                    <i class="fas fa-chevron-right"></i>
                                    <span>${this.escapeHtml(info)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.risks && task.risks.length > 0 ? `
                    <div class="details-section attention-section">
                        <h3><i class="fas fa-exclamation-triangle"></i> Points d'Attention</h3>
                        <div class="attention-list">
                            ${task.risks.map(risk => `
                                <div class="attention-item">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>${this.escapeHtml(risk)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    formatDescription(description) {
        if (!description) return '';
        
        if (description.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
            return `<div class="structured-description">${description.replace(/\n/g, '<br>')}</div>`;
        } else {
            return `<div class="simple-description">${this.escapeHtml(description).replace(/\n/g, '<br>')}</div>`;
        }
    }

    formatEmailContent(content) {
        if (!content) return '<p>Contenu non disponible</p>';
        
        const formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/Email de:/g, '<strong>Email de:</strong>')
            .replace(/Date:/g, '<strong>Date:</strong>')
            .replace(/Sujet:/g, '<strong>Sujet:</strong>');
            
        return `<div class="email-original-content">${formattedContent}</div>`;
    }

    formatDeadline(deadline) {
        if (!deadline) return '';
        
        try {
            const deadlineDate = new Date(deadline);
            const now = new Date();
            const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                return `Échue il y a ${Math.abs(diffDays)}j`;
            } else if (diffDays === 0) {
                return 'Aujourd\'hui';
            } else if (diffDays === 1) {
                return 'Demain';
            } else if (diffDays <= 7) {
                return `${diffDays}j`;
            } else {
                return deadlineDate.toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short' 
                });
            }
        } catch (error) {
            return deadline;
        }
    }

    showSuggestedReplies(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.suggestedReplies || task.suggestedReplies.length === 0) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'replies_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-reply-all"></i> Suggestions de Réponse</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="ai-suggestions-info">
                            <div class="ai-badge">
                                <i class="fas fa-robot"></i>
                                <span>Suggestions générées automatiquement</span>
                            </div>
                            <p>Réponses personnalisées pour l'email de <strong>${task.emailFromName || 'l\'expéditeur'}</strong></p>
                        </div>
                        
                        <div class="replies-list">
                            ${task.suggestedReplies.map((reply, idx) => `
                                <div class="reply-suggestion-card">
                                    <div class="reply-card-header">
                                        <div class="reply-tone-badge ${reply.tone}">
                                            ${this.getReplyToneIcon(reply.tone)} ${this.getReplyToneLabel(reply.tone)}
                                        </div>
                                        <div class="reply-card-actions">
                                            <button class="btn-sm btn-secondary" onclick="window.tasksView.copyReplyToClipboard(${idx}, '${taskId}')">
                                                <i class="fas fa-copy"></i> Copier
                                            </button>
                                            <button class="btn-sm btn-primary" onclick="window.tasksView.useReply('${taskId}', ${idx})">
                                                <i class="fas fa-paper-plane"></i> Utiliser
                                            </button>
                                        </div>
                                    </div>
                                    <div class="reply-subject-line">
                                        <strong>Sujet:</strong> ${this.escapeHtml(reply.subject)}
                                    </div>
                                    <div class="reply-content-preview">
                                        ${this.escapeHtml(reply.content).replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    async copyReplyToClipboard(replyIndex, taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.suggestedReplies || !task.suggestedReplies[replyIndex]) return;

        const reply = task.suggestedReplies[replyIndex];
        const text = `Sujet: ${reply.subject}\n\n${reply.content}`;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Réponse copiée dans le presse-papiers', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showToast('Erreur lors de la copie', 'error');
        }
    }

    useReply(taskId, replyIndex) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.suggestedReplies || !task.suggestedReplies[replyIndex]) return;

        const reply = task.suggestedReplies[replyIndex];
        const subject = reply.subject;
        const body = reply.content;
        const to = task.emailFrom;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink);
        
        window.taskManager.updateTask(taskId, { 
            emailReplied: true,
            needsReply: false,
            status: task.status === 'todo' ? 'in-progress' : task.status
        });
        
        this.showToast('Email de réponse ouvert dans votre client email', 'success');
        
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
        
        this.refreshView();
    }

    getReplyToneIcon(tone) {
        const icons = {
            professionnel: '👔',
            formel: '👔',
            informel: '😊',
            urgent: '🚨',
            neutre: '📝',
            amical: '🤝',
            détaillé: '📋'
        };
        return icons[tone] || '📝';
    }

    getReplyToneLabel(tone) {
        const labels = {
            professionnel: 'Professionnel',
            formel: 'Formel',
            informel: 'Informel',
            urgent: 'Urgent',
            neutre: 'Neutre',
            amical: 'Amical',
            détaillé: 'Détaillé'
        };
        return labels[tone] || 'Neutre';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = 'auto';
    }

    addWarmStyles() {
        if (document.getElementById('warmTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'warmTaskStyles';
        styles.textContent = `
            /* Variables CSS chaleureux pour TaskManager v11.0 */
            :root {
                --primary-warm: #2c3e50;      /* Bleu ardoise chaleureux */
                --primary-hover: #34495e;     /* Bleu ardoise plus sombre */
                --success-warm: #27ae60;      /* Vert émeraude */
                --warning-warm: #f39c12;      /* Orange doré */
                --danger-warm: #e74c3c;       /* Rouge chaleureux */
                --info-warm: #3498db;         /* Bleu ciel */
                
                /* Couleurs de texte chaleureuses */
                --text-primary-warm: #2c3e50;    /* Bleu ardoise profond */
                --text-secondary-warm: #7f8c8d;  /* Gris ardoise moyen */
                --text-muted-warm: #95a5a6;      /* Gris clair chaleureux */
                
                /* Arrière-plans chaleureux */
                --bg-primary-warm: #ffffff;
                --bg-secondary-warm: #ecf0f1;    /* Gris très clair */
                --bg-accent-warm: #f8f9fa;       /* Blanc cassé */
                
                /* Couleurs d'accentuation chaleureuses */
                --accent-coral: #ff6b6b;         /* Corail */
                --accent-mint: #51cf66;          /* Menthe */
                --accent-lavender: #9775fa;      /* Lavande */
                --accent-peach: #ffa726;         /* Pêche */
                
                /* Bordures et ombres */
                --border-warm: #bdc3c7;
                --shadow-warm: 0 2px 8px rgba(44, 62, 80, 0.1);
                --shadow-hover: 0 4px 16px rgba(44, 62, 80, 0.15);
                
                --border-radius: 12px;
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .tasks-page-warm {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 20px;
                font-size: 14px;
                color: var(--text-primary-warm);
            }

            /* PANNEAU DE CONTRÔLE CHALEUREUX */
            .controls-section-warm {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(189, 195, 199, 0.3);
                border-radius: var(--border-radius);
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: var(--shadow-warm);
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            /* LIGNE 1 : Recherche + Actions principales */
            .main-controls-line {
                display: flex;
                align-items: center;
                gap: 24px;
                width: 100%;
            }

            .search-section {
                flex: 1;
                max-width: 450px;
            }

            .search-box-warm {
                position: relative;
                display: flex;
                align-items: center;
                height: 48px;
            }

            .search-input-warm {
                width: 100%;
                height: 48px;
                padding: 0 20px 0 50px;
                border: 2px solid var(--border-warm);
                border-radius: var(--border-radius);
                font-size: 15px;
                background: white;
                transition: var(--transition);
                outline: none;
                color: var(--text-primary-warm);
                font-weight: 500;
            }

            .search-input-warm:focus {
                border-color: var(--primary-warm);
                box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
                transform: translateY(-1px);
            }

            .search-input-warm::placeholder {
                color: var(--text-secondary-warm);
                font-weight: 400;
            }

            .search-icon {
                position: absolute;
                left: 18px;
                color: var(--text-secondary-warm);
                pointer-events: none;
                z-index: 1;
                font-size: 16px;
            }

            .search-clear {
                position: absolute;
                right: 15px;
                background: var(--danger-warm);
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: var(--transition);
            }

            .search-clear:hover {
                background: #c0392b;
                transform: scale(1.1);
            }

            .main-actions {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }

            .selection-panel {
                display: flex;
                align-items: center;
                gap: 10px;
                background: linear-gradient(135deg, #e8f4fd 0%, #d6eafc 100%);
                border: 1px solid var(--info-warm);
                border-radius: 10px;
                padding: 10px 16px;
                color: var(--primary-warm);
                font-weight: 700;
                font-size: 13px;
                box-shadow: var(--shadow-warm);
            }

            .selection-count {
                white-space: nowrap;
            }

            .btn-action {
                height: 48px;
                padding: 0 20px;
                border: 2px solid var(--border-warm);
                border-radius: 10px;
                background: white;
                color: var(--text-primary-warm);
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                white-space: nowrap;
                position: relative;
                box-shadow: var(--shadow-warm);
            }

            .btn-action:hover {
                background: var(--bg-secondary-warm);
                border-color: var(--primary-warm);
                transform: translateY(-2px);
                box-shadow: var(--shadow-hover);
            }

            .btn-action.btn-new {
                background: linear-gradient(135deg, var(--primary-warm) 0%, #34495e 100%);
                color: white;
                border-color: transparent;
            }

            .btn-action.btn-new:hover {
                background: linear-gradient(135deg, var(--primary-hover) 0%, #2c3e50 100%);
                transform: translateY(-2px) scale(1.02);
            }

            .btn-action.btn-export {
                background: linear-gradient(135deg, var(--success-warm) 0%, #2ecc71 100%);
                color: white;
                border-color: transparent;
            }

            .btn-action.btn-export:hover {
                background: linear-gradient(135deg, #229954 0%, var(--success-warm) 100%);
                transform: translateY(-2px) scale(1.02);
            }

            .btn-action.btn-import {
                background: linear-gradient(135deg, var(--info-warm) 0%, #5dade2 100%);
                color: white;
                border-color: transparent;
            }

            .btn-action.btn-import:hover {
                background: linear-gradient(135deg, #2e86ab 0%, var(--info-warm) 100%);
                transform: translateY(-2px) scale(1.02);
            }

            .btn-action.btn-bulk {
                background: var(--accent-coral);
                color: white;
                border-color: transparent;
            }

            .btn-action.btn-bulk:hover {
                background: #ff5252;
                transform: translateY(-2px) scale(1.02);
            }

            .btn-action.btn-clear {
                width: 48px;
                padding: 0;
                background: var(--bg-secondary-warm);
                color: var(--text-secondary-warm);
            }

            .btn-action.btn-clear:hover {
                background: var(--danger-warm);
                color: white;
                transform: translateY(-2px) scale(1.05);
            }

            .btn-action.btn-filters.active {
                background: #f8f9fa;
                color: var(--primary-warm);
                border-color: var(--primary-warm);
                box-shadow: inset 0 2px 4px rgba(44, 62, 80, 0.1);
            }

            .count-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: var(--danger-warm);
                color: white;
                font-size: 11px;
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 12px;
                min-width: 20px;
                text-align: center;
                border: 2px solid white;
                box-shadow: var(--shadow-warm);
            }

            /* LIGNE 2 : Modes de vue + Filtres de statut */
            .views-filters-line {
                display: flex;
                align-items: center;
                gap: 24px;
                width: 100%;
            }

            .view-modes {
                display: flex;
                background: var(--bg-secondary-warm);
                border: 2px solid var(--border-warm);
                border-radius: 10px;
                padding: 4px;
                gap: 4px;
                flex-shrink: 0;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .view-mode {
                padding: 10px 18px;
                border: none;
                background: transparent;
                color: var(--text-secondary-warm);
                border-radius: 8px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
            }

            .view-mode:hover {
                background: rgba(255, 255, 255, 0.8);
                color: var(--text-primary-warm);
                transform: translateY(-1px);
            }

            .view-mode.active {
                background: white;
                color: var(--text-primary-warm);
                box-shadow: var(--shadow-warm);
                transform: translateY(-1px);
            }

            .status-filters {
                display: flex;
                gap: 10px;
                flex: 1;
                flex-wrap: wrap;
                justify-content: center;
            }

            .status-pill {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: white;
                border: 2px solid var(--border-warm);
                border-radius: 10px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 13px;
                font-weight: 600;
                color: var(--text-primary-warm);
                min-width: 110px;
                justify-content: space-between;
                box-shadow: var(--shadow-warm);
            }

            .status-pill:hover {
                border-color: var(--primary-warm);
                background: var(--bg-accent-warm);
                transform: translateY(-2px);
                box-shadow: var(--shadow-hover);
            }

            .status-pill.active {
                background: linear-gradient(135deg, var(--primary-warm) 0%, #34495e 100%);
                color: white;
                border-color: var(--primary-warm);
                box-shadow: var(--shadow-hover);
                transform: translateY(-1px);
            }

            .status-pill.active .pill-count {
                background: rgba(255, 255, 255, 0.25);
                color: white;
            }

            .pill-icon {
                font-size: 16px;
            }

            .pill-text {
                flex: 1;
                text-align: center;
                font-size: 12px;
                font-weight: 700;
            }

            .pill-count {
                background: var(--bg-secondary-warm);
                padding: 3px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                min-width: 24px;
                text-align: center;
                color: var(--text-primary-warm);
            }

            /* FILTRES AVANCÉS */
            .advanced-filters-panel {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 2px solid var(--border-warm);
                border-radius: var(--border-radius);
                margin-bottom: 20px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                opacity: 0;
                box-shadow: var(--shadow-warm);
            }

            .advanced-filters-panel.show {
                max-height: 250px;
                opacity: 1;
                padding: 24px;
            }

            .advanced-filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 20px;
                align-items: end;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .filter-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 700;
                font-size: 13px;
                color: var(--text-primary-warm);
            }

            .filter-select {
                height: 48px;
                padding: 0 16px;
                border: 2px solid var(--border-warm);
                border-radius: 10px;
                background: white;
                font-size: 14px;
                color: var(--text-primary-warm);
                cursor: pointer;
                transition: var(--transition);
                font-weight: 500;
            }

            .filter-select:focus {
                outline: none;
                border-color: var(--primary-warm);
                box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
                transform: translateY(-1px);
            }

            .filter-actions {
                display: flex;
                align-items: end;
            }

            .btn-reset {
                background: var(--bg-secondary-warm);
                color: var(--text-secondary-warm);
            }

            .btn-reset:hover {
                background: var(--border-warm);
                color: var(--text-primary-warm);
            }

            /* CONTENEUR DES TÂCHES */
            .tasks-container {
                background: transparent;
            }

            /* VUE MINIMALISTE CHALEUREUSE */
            .tasks-minimal-list {
                display: flex;
                flex-direction: column;
                gap: 3px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: var(--shadow-warm);
            }

            .task-minimal {
                background: white;
                border-bottom: 1px solid #ecf0f1;
                cursor: pointer;
                transition: var(--transition);
            }

            .task-minimal:last-child {
                border-bottom: none;
            }

            .task-minimal:hover {
                background: var(--bg-accent-warm);
                transform: translateX(4px);
                box-shadow: var(--shadow-hover);
            }

            .task-minimal.selected {
                background: linear-gradient(135deg, #e8f4fd 0%, #d6eafc 100%);
                border-left: 4px solid var(--primary-warm);
                box-shadow: inset 4px 0 0 var(--primary-warm);
            }

            .task-minimal.completed {
                opacity: 0.7;
                background: linear-gradient(135deg, #d5f4e6 0%, #c8e6c9 100%);
            }

            .task-minimal.completed .task-title {
                text-decoration: line-through;
                color: var(--text-secondary-warm);
            }

            .task-content-line {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                gap: 16px;
                min-height: 60px;
            }

            .task-checkbox {
                width: 20px;
                height: 20px;
                cursor: pointer;
                flex-shrink: 0;
                accent-color: var(--primary-warm);
            }

            .task-info {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 20px;
                min-width: 0;
            }

            .task-title {
                font-weight: 700;
                color: var(--text-primary-warm);
                font-size: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 2;
                line-height: 1.4;
            }

            .task-client {
                font-size: 13px;
                color: var(--text-secondary-warm);
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            }

            .task-meta {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .task-deadline {
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
                text-align: center;
                padding: 4px 8px;
                border-radius: 6px;
            }

            .task-deadline.deadline-overdue {
                color: white;
                background: var(--danger-warm);
                font-weight: 700;
            }

            .task-deadline.deadline-today {
                color: white;
                background: var(--warning-warm);
                font-weight: 700;
            }

            .task-deadline.deadline-tomorrow {
                color: var(--warning-warm);
                background: #fef3c7;
                font-weight: 600;
            }

            .task-deadline.deadline-week {
                color: var(--info-warm);
                background: #eff6ff;
                font-weight: 600;
            }

            .task-deadline.deadline-normal {
                color: var(--text-secondary-warm);
                background: var(--bg-secondary-warm);
            }

            .task-deadline.no-deadline {
                color: var(--text-muted-warm);
                background: transparent;
                font-style: italic;
            }

            .task-actions {
                display: flex;
                gap: 6px;
                flex-shrink: 0;
            }

            .action-btn {
                width: 36px;
                height: 36px;
                border: 2px solid var(--border-warm);
                border-radius: 8px;
                background: white;
                color: var(--text-secondary-warm);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
                font-size: 13px;
            }

            .action-btn:hover {
                background: var(--bg-secondary-warm);
                border-color: var(--text-secondary-warm);
                transform: translateY(-2px);
                box-shadow: var(--shadow-warm);
            }

            .action-btn.complete:hover {
                background: var(--success-warm);
                border-color: var(--success-warm);
                color: white;
            }

            .action-btn.edit:hover {
                background: var(--warning-warm);
                border-color: var(--warning-warm);
                color: white;
            }

            .action-btn.details:hover {
                background: var(--accent-lavender);
                border-color: var(--accent-lavender);
                color: white;
            }

            .action-btn.reply:hover {
                background: var(--info-warm);
                border-color: var(--info-warm);
                color: white;
            }

            /* VUE NORMALE CHALEUREUSE */
            .tasks-normal-list {
                display: flex;
                flex-direction: column;
                gap: 0;
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: var(--shadow-warm);
            }

            .task-normal {
                background: rgba(255, 255, 255, 0.95);
                border-bottom: 1px solid var(--border-warm);
                cursor: pointer;
                transition: var(--transition);
            }

            .task-normal:first-child {
                border-top-left-radius: var(--border-radius);
                border-top-right-radius: var(--border-radius);
            }

            .task-normal:last-child {
                border-bottom-left-radius: var(--border-radius);
                border-bottom-right-radius: var(--border-radius);
                border-bottom: none;
            }

            .task-normal:hover {
                background: white;
                transform: translateY(-2px);
                box-shadow: var(--shadow-hover);
                border-color: rgba(44, 62, 80, 0.2);
                z-index: 1;
                position: relative;
            }

            .task-normal.selected {
                background: linear-gradient(135deg, #e8f4fd 0%, #d6eafc 100%);
                border-left: 4px solid var(--primary-warm);
                z-index: 2;
                position: relative;
                box-shadow: var(--shadow-hover);
            }

            .task-normal.completed {
                opacity: 0.8;
                background: linear-gradient(135deg, #d5f4e6 0%, #c8e6c9 100%);
            }

            .task-normal.completed .task-title {
                text-decoration: line-through;
                color: var(--text-secondary-warm);
            }

            .task-normal .task-content-line {
                padding: 20px;
                min-height: 80px;
            }

            .priority-bar {
                width: 5px;
                height: 56px;
                border-radius: 3px;
                margin-right: 16px;
                flex-shrink: 0;
            }

            .task-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 10px;
                min-width: 0;
            }

            .task-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
            }

            .task-normal .task-title {
                font-size: 16px;
                font-weight: 700;
                color: var(--text-primary-warm);
                margin: 0;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }

            .task-details {
                display: flex;
                align-items: center;
                gap: 20px;
                font-size: 13px;
                color: var(--text-secondary-warm);
                font-weight: 600;
            }

            .task-client,
            .task-normal .task-deadline {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            /* VUE DÉTAILLÉE CHALEUREUSE */
            .tasks-detailed-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                gap: 20px;
            }

            .task-detailed {
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid rgba(189, 195, 199, 0.3);
                border-radius: var(--border-radius);
                padding: 20px;
                transition: var(--transition);
                box-shadow: var(--shadow-warm);
                display: flex;
                flex-direction: column;
                min-height: 220px;
            }

            .task-detailed:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-hover);
                border-color: rgba(44, 62, 80, 0.3);
            }

            .task-detailed.selected {
                background: linear-gradient(135deg, #e8f4fd 0%, #d6eafc 100%);
                border-color: var(--primary-warm);
                box-shadow: var(--shadow-hover);
            }

            .task-detailed.completed {
                opacity: 0.85;
                background: linear-gradient(135deg, #d5f4e6 0%, #c8e6c9 100%);
            }

            .task-detailed-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 16px;
            }

            .task-detailed-content {
                flex: 1;
                margin-bottom: 16px;
            }

            .task-detailed .task-title {
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary-warm);
                margin: 0 0 10px 0;
                line-height: 1.3;
                cursor: pointer;
                transition: color 0.3s ease;
            }

            .task-detailed .task-title:hover {
                color: var(--primary-warm);
            }

            .task-description {
                font-size: 14px;
                color: var(--text-secondary-warm);
                line-height: 1.6;
                margin: 0 0 16px 0;
                font-weight: 500;
            }

            .task-meta-grid {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
            }

            .meta-item.deadline-centered {
                flex: 1;
                text-align: center;
                justify-content: center;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                font-weight: 600;
                color: var(--text-primary-warm);
            }

            .task-detailed-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .btn-detailed {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                border: 2px solid;
                white-space: nowrap;
            }

            .btn-detailed.complete {
                background: var(--success-warm);
                color: white;
                border-color: var(--success-warm);
            }

            .btn-detailed.complete:hover {
                background: #229954;
                border-color: #229954;
                transform: translateY(-2px);
            }

            .btn-detailed.edit {
                background: var(--primary-warm);
                color: white;
                border-color: var(--primary-warm);
            }

            .btn-detailed.edit:hover {
                background: var(--primary-hover);
                border-color: var(--primary-hover);
                transform: translateY(-2px);
            }

            .btn-detailed.details {
                background: var(--bg-secondary-warm);
                color: var(--text-primary-warm);
                border-color: var(--border-warm);
            }

            .btn-detailed.details:hover {
                background: var(--border-warm);
                border-color: var(--text-secondary-warm);
                transform: translateY(-2px);
            }

            /* ÉTAT VIDE CHALEUREUX */
            .empty-state {
                text-align: center;
                padding: 80px 40px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 20px;
                box-shadow: var(--shadow-warm);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .empty-state-icon {
                font-size: 64px;
                margin-bottom: 24px;
                color: var(--text-muted-warm);
            }

            .empty-state-title {
                font-size: 24px;
                font-weight: 700;
                color: var(--text-primary-warm);
                margin-bottom: 16px;
            }

            .empty-state-text {
                font-size: 16px;
                margin-bottom: 32px;
                max-width: 500px;
                line-height: 1.6;
                color: var(--text-secondary-warm);
                font-weight: 500;
            }

            /* MODALES CHALEUREUSES */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(44, 62, 80, 0.8);
                z-index: 99999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                backdrop-filter: blur(8px);
            }
            
            .modal-container {
                background: white;
                border-radius: 20px;
                max-width: 850px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(44, 62, 80, 0.3);
                border: 2px solid var(--border-warm);
            }
            
            .modal-container.modal-large {
                max-width: 1100px;
            }
            
            .modal-header {
                padding: 28px;
                border-bottom: 2px solid var(--border-warm);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--bg-accent-warm);
                border-radius: 18px 18px 0 0;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                color: var(--text-primary-warm);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 22px;
                cursor: pointer;
                color: var(--text-secondary-warm);
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
            }
            
            .modal-close:hover {
                background: var(--bg-secondary-warm);
                color: var(--text-primary-warm);
                transform: scale(1.1);
            }
            
            .modal-content {
                padding: 28px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 28px;
                border-top: 2px solid var(--border-warm);
                display: flex;
                justify-content: flex-end;
                gap: 16px;
                background: var(--bg-accent-warm);
                border-radius: 0 0 18px 18px;
            }
            
            .btn-modal {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 14px 24px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                border: 2px solid;
                white-space: nowrap;
            }
            
            .btn-modal.btn-primary {
                background: var(--primary-warm);
                color: white;
                border-color: var(--primary-warm);
            }
            
            .btn-modal.btn-primary:hover {
                background: var(--primary-hover);
                border-color: var(--primary-hover);
                transform: translateY(-2px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-modal.btn-secondary {
                background: var(--bg-secondary-warm);
                color: var(--text-primary-warm);
                border-color: var(--border-warm);
            }
            
            .btn-modal.btn-secondary:hover {
                background: var(--border-warm);
                border-color: var(--text-secondary-warm);
                transform: translateY(-2px);
            }
            
            .btn-modal.btn-success {
                background: var(--success-warm);
                color: white;
                border-color: var(--success-warm);
            }
            
            .btn-modal.btn-success:hover {
                background: #229954;
                border-color: #229954;
                transform: translateY(-2px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-modal.btn-info {
                background: var(--info-warm);
                color: white;
                border-color: var(--info-warm);
            }
            
            .btn-modal.btn-info:hover {
                background: #2e86ab;
                border-color: #2e86ab;
                transform: translateY(-2px);
                box-shadow: var(--shadow-hover);
            }

            /* FORMULAIRES CHALEUREUX */
            .edit-form,
            .create-form {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .form-row .form-group:only-child {
                grid-column: 1 / -1;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-group label {
                font-weight: 700;
                color: var(--text-primary-warm);
                font-size: 15px;
            }
            
            .form-input,
            .form-select,
            .form-textarea {
                padding: 14px 18px;
                border: 2px solid var(--border-warm);
                border-radius: 10px;
                font-size: 15px;
                background: white;
                transition: border-color 0.3s ease, transform 0.2s ease;
                font-family: inherit;
                color: var(--text-primary-warm);
                font-weight: 500;
            }
            
            .form-input:focus,
            .form-select:focus,
            .form-textarea:focus {
                outline: none;
                border-color: var(--primary-warm);
                box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
                transform: translateY(-1px);
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 100px;
                font-family: inherit;
                line-height: 1.6;
            }
            
            .form-section {
                margin-top: 28px;
                padding-top: 24px;
                border-top: 2px solid var(--border-warm);
            }
            
            .form-section h3 {
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary-warm);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .email-info-readonly {
                background: var(--bg-accent-warm);
                border: 2px solid var(--border-warm);
                border-radius: 10px;
                padding: 20px;
                font-size: 15px;
                color: var(--text-primary-warm);
            }
            
            .email-info-readonly > div {
                margin-bottom: 12px;
                font-weight: 500;
            }
            
            .email-info-readonly > div:last-child {
                margin-bottom: 0;
            }

            /* IMPORT/EXPORT STYLES */
            .import-instructions {
                background: var(--bg-accent-warm);
                border: 2px solid var(--border-warm);
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 24px;
            }

            .instruction-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 16px;
                font-size: 14px;
                line-height: 1.5;
            }

            .instruction-item:last-child {
                margin-bottom: 0;
            }

            .instruction-item i {
                color: var(--primary-warm);
                font-size: 16px;
                margin-top: 2px;
            }

            .file-upload-zone {
                border: 3px dashed var(--border-warm);
                border-radius: var(--border-radius);
                padding: 40px 20px;
                text-align: center;
                cursor: pointer;
                transition: var(--transition);
                background: var(--bg-accent-warm);
            }

            .file-upload-zone:hover {
                border-color: var(--primary-warm);
                background: #f8f9fa;
                transform: translateY(-2px);
            }

            .file-upload-zone.dragover {
                border-color: var(--success-warm);
                background: #d5f4e6;
                transform: scale(1.02);
            }

            .upload-icon {
                font-size: 48px;
                color: var(--primary-warm);
                margin-bottom: 16px;
            }

            .upload-text p {
                margin: 8px 0;
                color: var(--text-primary-warm);
                font-weight: 600;
            }

            .upload-text p:first-child {
                font-size: 16px;
                font-weight: 700;
            }

            .upload-text p:last-child {
                color: var(--text-secondary-warm);
                font-size: 14px;
            }

            .file-selected {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 20px;
                background: var(--success-warm);
                color: white;
                border-radius: 10px;
            }

            .file-selected i {
                font-size: 32px;
                margin-bottom: 8px;
            }

            .file-selected span {
                font-weight: 700;
                font-size: 16px;
            }

            .file-selected small {
                opacity: 0.9;
                font-size: 12px;
            }

            .import-preview {
                background: var(--bg-accent-warm);
                border: 2px solid var(--border-warm);
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
            }

            .import-preview h4 {
                margin: 0 0 16px 0;
                color: var(--text-primary-warm);
                font-weight: 700;
            }

            .file-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 16px;
            }

            .file-info div {
                font-size: 14px;
                color: var(--text-primary-warm);
                font-weight: 500;
            }

            .preview-note {
                background: #e8f4fd;
                color: var(--primary-warm);
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 13px;
                margin: 0;
                display: flex;
                align-items: flex-start;
                gap: 8px;
                line-height: 1.5;
            }

            .preview-note i {
                margin-top: 2px;
                flex-shrink: 0;
            }

            /* RESPONSIVE CHALEUREUX */
            @media (max-width: 1024px) {
                .main-controls-line {
                    flex-direction: column;
                    gap: 16px;
                    align-items: stretch;
                }

                .search-section {
                    max-width: none;
                }

                .main-actions {
                    justify-content: center;
                    width: 100%;
                }

                .views-filters-line {
                    flex-direction: column;
                    gap: 16px;
                    align-items: stretch;
                }

                .view-modes {
                    align-self: center;
                }

                .status-filters {
                    justify-content: center;
                }

                .status-pill {
                    min-width: 100px;
                }

                .tasks-detailed-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .controls-section-warm {
                    padding: 20px;
                }

                .task-content-line {
                    padding: 16px;
                    min-height: 60px;
                }

                .task-info {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                }

                .task-normal .task-content-line {
                    min-height: 80px;
                }

                .task-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .main-actions {
                    flex-direction: column;
                    gap: 10px;
                }

                .selection-panel {
                    justify-content: center;
                }

                .status-filters {
                    flex-direction: column;
                    gap: 8px;
                }

                .status-pill {
                    min-width: auto;
                    width: 100%;
                    justify-content: space-between;
                }
            }

            @media (max-width: 480px) {
                .tasks-page-warm {
                    padding: 12px;
                }

                .controls-section-warm {
                    padding: 16px;
                    gap: 16px;
                }

                .btn-action {
                    height: 44px;
                    font-size: 13px;
                    padding: 0 16px;
                }

                .task-content-line {
                    padding: 12px;
                    gap: 10px;
                }

                .task-actions {
                    flex-direction: column;
                    gap: 4px;
                }

                .action-btn {
                    width: 32px;
                    height: 32px;
                    font-size: 12px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION
// =====================================

function initializeTaskManagerV11Warm() {
    console.log('[TaskManager] Initializing v11.0 - Design chaleureux & Excel I/O...');
    
    if (!window.taskManager || !window.taskManager.initialized) {
        window.taskManager = new TaskManager();
    }
    
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
    // Bind methods pour éviter les erreurs de contexte
    Object.getOwnPropertyNames(TaskManager.prototype).forEach(name => {
        if (name !== 'constructor' && typeof window.taskManager[name] === 'function') {
            window.taskManager[name] = window.taskManager[name].bind(window.taskManager);
        }
    });

    Object.getOwnPropertyNames(TasksView.prototype).forEach(name => {
        if (name !== 'constructor' && typeof window.tasksView[name] === 'function') {
            window.tasksView[name] = window.tasksView[name].bind(window.tasksView);
        }
    });
    
    console.log('✅ TaskManager v11.0 loaded - Design chaleureux & Excel Import/Export');
}

// Initialisation immédiate ET sur DOMContentLoaded
initializeTaskManagerV11Warm();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TaskManager] DOM ready, ensuring initialization...');
    initializeTaskManagerV11Warm();
});

// Fallback sur window.load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TaskManager] Fallback initialization...');
            initializeTaskManagerV11Warm();
        }
    }, 1000);
});
