addHarmonizedEmailStyles() {
    if (document.getElementById('harmonizedEmailStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'harmonizedEmailStyles';
    styles.textContent = `
        /* Variables CSS */
        :root {
            --btn-height: 44px;
            --btn-padding-horizontal: 16px;
            --btn-font-size: 13px;
            --btn-border-radius: 10px;
            --btn-font-weight: 600;
            --btn-gap: 8px;
            --card-height: 76px;
            --card-padding: 14px;
            --card-border-radius: 12px;
            --action-btn-size: 36px;
            --gap-small: 8px;
            --gap-medium: 12px;
            --gap-large: 16px;
            --transition-speed: 0.2s;
            --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
            --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
            --preselect-color: #8b5cf6;
            --preselect-color-light: #a78bfa;
            --preselect-color-dark: #7c3aed;
        }
        
        .tasks-page-modern {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: var(--gap-large);
            font-size: var(--btn-font-size);
        }

        .explanation-text-harmonized {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: var(--card-border-radius);
            padding: var(--gap-medium);
            margin-bottom: var(--gap-medium);
            display: flex;
            align-items: center;
            gap: var(--gap-medium);
            color: #1e40af;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.5;
            backdrop-filter: blur(10px);
            position: relative;
        }

        .explanation-text-harmonized i {
            font-size: 16px;
            color: #3b82f6;
            flex-shrink: 0;
        }
        
        .explanation-close-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        
        .explanation-close-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: scale(1.1);
        }
        
        /* Barre de contrôles */
        .controls-bar-harmonized {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--gap-large);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--card-border-radius);
            padding: var(--gap-medium);
            margin-bottom: var(--gap-medium);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            min-height: calc(var(--btn-height) + var(--gap-medium) * 2);
        }
        
        .search-section-harmonized {
            flex: 0 0 300px;
            height: var(--btn-height);
        }
        
        .search-box-harmonized {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
        }
        
        .search-input-harmonized {
            width: 100%;
            height: var(--btn-height);
            padding: 0 var(--gap-medium) 0 44px;
            border: 1px solid #d1d5db;
            border-radius: var(--btn-border-radius);
            font-size: var(--btn-font-size);
            background: #f9fafb;
            transition: all var(--transition-speed) ease;
            outline: none;
        }
        
        .search-input-harmonized:focus {
            border-color: #3b82f6;
            background: white;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-icon-harmonized {
            position: absolute;
            left: var(--gap-medium);
            color: #9ca3af;
            pointer-events: none;
        }
        
        .search-clear-harmonized {
            position: absolute;
            right: var(--gap-small);
            background: #ef4444;
            color: white;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            transition: all var(--transition-speed) ease;
        }
        
        .search-clear-harmonized:hover {
            background: #dc2626;
            transform: scale(1.1);
        }
        
        .view-modes-harmonized {
            display: flex;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: var(--btn-border-radius);
            padding: 4px;
            gap: 2px;
            height: var(--btn-height);
        }
        
        .view-mode-harmonized {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--btn-gap);
            padding: 0 var(--btn-padding-horizontal);
            height: calc(var(--btn-height) - 8px);
            border: none;
            background: transparent;
            color: #6b7280;
            border-radius: calc(var(--btn-border-radius) - 2px);
            cursor: pointer;
            transition: all var(--transition-speed) ease;
            font-size: var(--btn-font-size);
            font-weight: var(--btn-font-weight);
            min-width: 120px;
        }
        
        .view-mode-harmonized:hover {
            background: rgba(255, 255, 255, 0.8);
            color: #374151;
        }
        
        .view-mode-harmonized.active {
            background: white;
            color: #1f2937;
            box-shadow: var(--shadow-base);
            font-weight: 700;
        }
        
        .action-buttons-harmonized {
            display: flex;
            align-items: center;
            gap: var(--gap-small);
            height: var(--btn-height);
            flex-shrink: 0;
        }
        
        .btn-harmonized {
            height: var(--btn-height);
            background: white;
            color: #374151;
            border: 1px solid #e5e7eb;
            border-radius: var(--btn-border-radius);
            padding: 0 var(--btn-padding-horizontal);
            font-size: var(--btn-font-size);
            font-weight: var(--btn-font-weight);
            cursor: pointer;
            transition: all var(--transition-speed) ease;
            display: flex;
            align-items: center;
            gap: var(--btn-gap);
            box-shadow: var(--shadow-base);
            position: relative;
        }
        
        .btn-harmonized:hover {
            background: #f9fafb;
            border-color: #6366f1;
            color: #1f2937;
            transform: translateY(-1px);
            box-shadow: var(--shadow-hover);
        }
        
        /* Boutons désactivés */
        .btn-harmonized.disabled {
            opacity: 0.5;
            cursor: not-allowed !important;
            pointer-events: none;
        }
        
        .btn-harmonized.disabled:hover {
            transform: none !important;
            box-shadow: var(--shadow-base) !important;
            background: white !important;
            border-color: #e5e7eb !important;
        }
        
        .btn-harmonized.btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        
        .btn-harmonized.btn-primary:hover {
            background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
        }
        
        .btn-harmonized.btn-primary.disabled {
            background: #e5e7eb !important;
            color: #9ca3af !important;
            box-shadow: var(--shadow-base) !important;
        }
        
        .btn-harmonized.btn-secondary {
            background: #f8fafc;
            color: #475569;
            border-color: #e2e8f0;
        }
        
        .btn-harmonized.btn-secondary:hover {
            background: #f1f5f9;
            color: #334155;
            border-color: #cbd5e1;
        }
        
        .btn-harmonized.btn-selection-toggle {
            background: #f0f9ff;
            color: #0369a1;
            border-color: #0ea5e9;
        }
        
        .btn-harmonized.btn-selection-toggle:hover {
            background: #e0f2fe;
            color: #0c4a6e;
            border-color: #0284c7;
        }
        
        .count-badge-small {
            background: #0ea5e9;
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 5px;
            border-radius: 6px;
            margin-left: 4px;
            min-width: 16px;
            text-align: center;
        }
        
        .btn-harmonized.btn-clear-selection {
            background: #f3f4f6;
            color: #6b7280;
            border: none;
            width: var(--btn-height);
            min-width: var(--btn-height);
            padding: 0;
        }
        
        .btn-harmonized.btn-clear-selection:hover {
            background: #e5e7eb;
            color: #374151;
        }
        
        .selection-info-harmonized {
            height: var(--btn-height);
            padding: 0 var(--btn-padding-horizontal);
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-radius: var(--btn-border-radius);
            font-size: var(--btn-font-size);
            font-weight: var(--btn-font-weight);
            color: #1e40af;
            display: flex;
            align-items: center;
            gap: var(--btn-gap);
        }
        
        .count-badge-harmonized {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ef4444;
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 3px 6px;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
            border: 2px solid white;
        }
        
        /* Dropdown actions */
        .dropdown-action-harmonized {
            position: relative;
            display: inline-block;
        }
        
        .dropdown-menu-harmonized {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: var(--btn-border-radius);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            min-width: 200px;
            z-index: 1000;
            padding: 8px 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.2s ease;
        }
        
        .dropdown-menu-harmonized.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .dropdown-item-harmonized {
            display: flex;
            align-items: center;
            gap: var(--gap-small);
            padding: 10px 16px;
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            color: #374151;
            font-size: var(--btn-font-size);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .dropdown-item-harmonized:hover {
            background: #f8fafc;
            color: #1f2937;
        }
        
        .dropdown-item-harmonized.danger {
            color: #dc2626;
        }
        
        .dropdown-item-harmonized.danger:hover {
            background: #fef2f2;
            color: #b91c1c;
        }
        
        .dropdown-divider {
            height: 1px;
            background: #e5e7eb;
            margin: 8px 0;
        }
        
        /* ===== FILTRES DE CATÉGORIES AVEC ÉTOILE FIXE ===== */
        .status-filters-harmonized-twolines {
            display: flex;
            gap: var(--gap-small);
            margin-bottom: var(--gap-medium);
            flex-wrap: wrap;
            width: 100%;
        }
        
        .status-pill-harmonized-twolines {
            height: 60px;
            padding: var(--gap-small);
            font-size: 12px;
            font-weight: 700;
            flex: 0 1 calc(16.666% - var(--gap-small));
            min-width: 120px;
            max-width: 180px;
            border-radius: var(--btn-border-radius);
            box-shadow: var(--shadow-base);
            transition: all var(--transition-speed) ease;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: white;
            color: #374151;
            border: 1px solid #e5e7eb;
            cursor: pointer;
            position: relative;
            overflow: visible !important; /* Important pour l'étoile */
        }
        
        /* Style pour les catégories pré-sélectionnées */
        .status-pill-harmonized-twolines.preselected-category {
            animation: pulsePreselected 3s ease-in-out infinite;
            border-width: 2px;
        }
        
        .status-pill-harmonized-twolines.preselected-category::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            border-radius: inherit;
            background: linear-gradient(45deg, var(--preselect-color), var(--preselect-color-light), var(--preselect-color));
            background-size: 300% 300%;
            animation: gradientShift 4s ease infinite;
            z-index: -1;
            opacity: 0.3;
        }
        
        @keyframes pulsePreselected {
            0%, 100% { 
                transform: scale(1);
            }
            50% { 
                transform: scale(1.03);
            }
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .pill-content-twolines {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            width: 100%;
            height: 100%;
            justify-content: center;
        }
        
        .pill-first-line-twolines {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .pill-icon-twolines {
            font-size: 16px;
        }
        
        .pill-count-twolines {
            background: rgba(0, 0, 0, 0.1);
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            min-width: 18px;
            text-align: center;
        }
        
        /* Étoile de pré-sélection TOUJOURS VISIBLE */
        .preselected-star {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            background: var(--preselect-color);
            color: white;
            border-radius: 50%;
            display: flex !important;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
            animation: starPulse 2s ease-in-out infinite;
            z-index: 10;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        @keyframes starPulse {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
            }
            50% { 
                transform: scale(1.15);
                box-shadow: 0 3px 8px rgba(139, 92, 246, 0.6);
            }
        }
        
        .pill-text-twolines {
            font-weight: 700;
            font-size: 12px;
            line-height: 1.2;
            text-align: center;
        }
        
        .status-pill-harmonized-twolines:hover {
            border-color: #3b82f6;
            background: #f0f9ff;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
        }
        
        .status-pill-harmonized-twolines.active {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border-color: #3b82f6;
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
            transform: translateY(-2px);
        }
        
        /* Catégorie active ET pré-sélectionnée */
        .status-pill-harmonized-twolines.active.preselected-category {
            background: linear-gradient(135deg, var(--preselect-color) 0%, var(--preselect-color-dark) 100%);
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        }
        
        .status-pill-harmonized-twolines.active .pill-count-twolines {
            background: rgba(255, 255, 255, 0.3);
            color: white;
        }
        
        /* Container des emails */
        .tasks-container-harmonized {
            background: transparent;
        }
        
        .tasks-harmonized-list {
            display: flex;
            flex-direction: column;
            gap: 0;
        }
        
        /* ===== CARTES D'EMAILS AVEC PRÉ-SÉLECTION ===== */
        .task-harmonized-card {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 0;
            padding: var(--card-padding);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            min-height: var(--card-height);
            max-height: var(--card-height);
            border-bottom: 1px solid #e5e7eb;
        }
        
        .task-harmonized-card:first-child {
            border-top-left-radius: var(--card-border-radius);
            border-top-right-radius: var(--card-border-radius);
            border-top: 1px solid #e5e7eb;
        }
        
        .task-harmonized-card:last-child {
            border-bottom-left-radius: var(--card-border-radius);
            border-bottom-right-radius: var(--card-border-radius);
            border-bottom: 1px solid #e5e7eb;
        }
        
        .task-harmonized-card:hover {
            background: white;
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            border-color: rgba(99, 102, 241, 0.2);
            border-left: 3px solid #6366f1;
            z-index: 1;
        }
        
        .task-harmonized-card.selected {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-left: 4px solid #3b82f6;
            border-color: #3b82f6;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
            z-index: 2;
        }
        
        .task-harmonized-card.has-task {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-left: 3px solid #22c55e;
        }
        
        /* Email pré-sélectionné pour tâche */
        .task-harmonized-card.preselected-task {
            background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
            border-left: 3px solid var(--preselect-color);
            border-color: rgba(139, 92, 246, 0.3);
        }
        
        .task-harmonized-card.preselected-task:hover {
            border-left: 4px solid var(--preselect-color);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.4);
        }
        
        .task-harmonized-card.preselected-task.selected {
            background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
            border-left: 4px solid var(--preselect-color);
            border-color: var(--preselect-color);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
        }
        
        .task-checkbox-harmonized {
            margin-right: var(--gap-medium);
            cursor: pointer;
            width: 20px;
            height: 20px;
            border-radius: 6px;
            border: 2px solid #d1d5db;
            background: white;
            transition: all var(--transition-speed) ease;
            flex-shrink: 0;
            appearance: none;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .task-checkbox-harmonized:checked {
            background: #6366f1;
            border-color: #6366f1;
        }
        
        .task-harmonized-card.preselected-task .task-checkbox-harmonized:checked {
            background: var(--preselect-color);
            border-color: var(--preselect-color);
        }
        
        .task-checkbox-harmonized:checked::after {
            content: '✓';
            color: white;
            font-size: 12px;
            font-weight: 700;
        }
        
        .priority-bar-harmonized {
            width: 4px;
            height: 56px;
            border-radius: 2px;
            margin-right: var(--gap-medium);
            transition: all 0.3s ease;
            flex-shrink: 0;
        }
        
        .task-main-content-harmonized {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
            height: 100%;
        }
        
        .task-header-harmonized {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: var(--gap-medium);
            margin-bottom: 4px;
        }
        
        .task-title-harmonized {
            font-weight: 700;
            color: #1f2937;
            font-size: 15px;
            margin: 0;
            line-height: 1.3;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .task-meta-harmonized {
            display: flex;
            align-items: center;
            gap: var(--gap-small);
            flex-shrink: 0;
        }
        
        .task-type-badge-harmonized,
        .deadline-badge-harmonized,
        .confidence-badge-harmonized {
            display: flex;
            align-items: center;
            gap: 3px;
            background: #f8fafc;
            color: #64748b;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid #e2e8f0;
            white-space: nowrap;
        }
        
        .confidence-badge-harmonized {
            background: #f0fdf4;
            color: #16a34a;
            border-color: #bbf7d0;
        }
        
        /* Badge pré-sélectionné amélioré */
        .preselected-badge-harmonized {
            display: flex;
            align-items: center;
            gap: 3px;
            background: linear-gradient(135deg, var(--preselect-color) 0%, var(--preselect-color-dark) 100%);
            color: white !important;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700 !important;
            border: none !important;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
            animation: badgePulse 2s ease-in-out infinite;
        }
        
        @keyframes badgePulse {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
            }
            50% { 
                transform: scale(1.05);
                box-shadow: 0 3px 8px rgba(139, 92, 246, 0.5);
            }
        }
        
        .task-recipient-harmonized {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #6b7280;
            font-size: 12px;
            font-weight: 500;
            line-height: 1.2;
        }
        
        .recipient-name-harmonized {
            font-weight: 600;
            color: #374151;
        }
        
        .reply-indicator-harmonized {
            color: #dc2626;
            font-weight: 600;
            font-size: 10px;
        }
        
        .category-indicator-harmonized {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 3px;
            transition: all 0.2s ease;
        }
        
        /* Indicateur de catégorie pour emails pré-sélectionnés */
        .task-harmonized-card.preselected-task .category-indicator-harmonized {
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
            animation: categoryGlow 2s ease-in-out infinite;
        }
        
        @keyframes categoryGlow {
            0%, 100% { 
                box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
            }
            50% { 
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5);
            }
        }
        
        .task-actions-harmonized {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: var(--gap-medium);
            flex-shrink: 0;
        }
        
        .action-btn-harmonized {
            width: var(--action-btn-size);
            height: var(--action-btn-size);
            border: 2px solid transparent;
            border-radius: var(--btn-border-radius);
            background: rgba(255, 255, 255, 0.9);
            color: #6b7280;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 13px;
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
        
        .action-btn-harmonized:hover {
            background: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .action-btn-harmonized.create-task {
            color: #3b82f6;
        }
        
        .action-btn-harmonized.create-task:hover {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-color: #3b82f6;
            color: #2563eb;
        }
        
        /* Bouton créer tâche pour emails pré-sélectionnés */
        .task-harmonized-card.preselected-task .action-btn-harmonized.create-task {
            color: var(--preselect-color);
            background: rgba(139, 92, 246, 0.1);
        }
        
        .task-harmonized-card.preselected-task .action-btn-harmonized.create-task:hover {
            background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
            border-color: var(--preselect-color);
            color: var(--preselect-color-dark);
        }
        
        .action-btn-harmonized.view-task {
            color: #16a34a;
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        }
        
        .action-btn-harmonized.view-task:hover {
            background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
            border-color: #16a34a;
            color: #15803d;
        }
        
        .action-btn-harmonized.details {
            color: #8b5cf6;
        }
        
        .action-btn-harmonized.details:hover {
            background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
            border-color: #8b5cf6;
            color: #7c3aed;
        }
        
        /* Vue groupée */
        .tasks-grouped-harmonized {
            display: flex;
            flex-direction: column;
            gap: 0;
        }
        
        .task-group-harmonized {
            background: transparent;
            border: none;
            border-radius: 0;
            overflow: visible;
            margin: 0;
            padding: 0;
        }
        
        .group-header-harmonized {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 0;
            padding: var(--card-padding);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            min-height: var(--card-height);
            max-height: var(--card-height);
            border-bottom: 1px solid #e5e7eb;
            gap: var(--gap-medium);
        }
        
        .task-group-harmonized:first-child .group-header-harmonized {
            border-top-left-radius: var(--card-border-radius);
            border-top-right-radius: var(--card-border-radius);
            border-top: 1px solid #e5e7eb;
        }
        
        .task-group-harmonized:last-child .group-header-harmonized:not(.expanded-header) {
            border-bottom-left-radius: var(--card-border-radius);
            border-bottom-right-radius: var(--card-border-radius);
            border-bottom: 1px solid #e5e7eb;
        }
        
        .group-header-harmonized:hover {
            background: white;
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            border-color: rgba(99, 102, 241, 0.2);
            border-left: 3px solid #6366f1;
            z-index: 1;
        }
        
        .task-group-harmonized.expanded .group-header-harmonized {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-left: 4px solid #3b82f6;
            border-color: #3b82f6;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
            z-index: 2;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }
        
        .group-avatar-harmonized {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 16px;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        
        .group-info-harmonized {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
            height: 100%;
        }
        
        .group-name-harmonized {
            font-weight: 700;
            color: #1f2937;
            font-size: 15px;
            margin: 0;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .group-meta-harmonized {
            color: #6b7280;
            font-size: 12px;
            font-weight: 500;
            line-height: 1.2;
        }
        
        .group-expand-harmonized {
            width: var(--action-btn-size);
            height: var(--action-btn-size);
            border: 2px solid transparent;
            border-radius: var(--btn-border-radius);
            background: rgba(255, 255, 255, 0.9);
            color: #6b7280;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 13px;
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
        }
        
        .group-expand-harmonized:hover {
            background: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            color: #374151;
        }
        
        .task-group-harmonized.expanded .group-expand-harmonized {
            transform: rotate(180deg) translateY(-1px);
            color: #3b82f6;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-color: #3b82f6;
        }
        
        .group-content-harmonized {
            background: transparent;
            margin: 0;
            padding: 0;
            display: none;
        }
        
        .task-group-harmonized.expanded .group-content-harmonized {
            display: block;
        }
        
        .group-content-harmonized .task-harmonized-card {
            border-radius: 0;
            margin: 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .group-content-harmonized .task-harmonized-card:last-child {
            border-bottom-left-radius: var(--card-border-radius);
            border-bottom-right-radius: var(--card-border-radius);
            border-bottom: 1px solid #e5e7eb;
        }
        
        /* État vide */
        .empty-state-harmonized {
            text-align: center;
            padding: 60px 30px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .empty-state-icon-harmonized {
            font-size: 48px;
            margin-bottom: 20px;
            color: #d1d5db;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .empty-state-title-harmonized {
            font-size: 22px;
            font-weight: 700;
            color: #374151;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .empty-state-text-harmonized {
            font-size: 15px;
            margin-bottom: 24px;
            max-width: 400px;
            line-height: 1.6;
            color: #6b7280;
            font-weight: 500;
        }
        
        /* RESPONSIVE */
        @media (max-width: 1200px) {
            :root {
                --btn-height: 42px;
                --card-height: 84px;
                --action-btn-size: 34px;
            }
            
            .status-filters-harmonized-twolines .status-pill-harmonized-twolines {
                flex: 0 1 calc(20% - var(--gap-small));
                min-width: 100px;
                max-width: 160px;
                height: 56px;
            }
        }
        
        @media (max-width: 1024px) {
            .controls-bar-harmonized {
                flex-direction: column;
                gap: var(--gap-medium);
                align-items: stretch;
                padding: var(--gap-large);
            }
            
            .search-section-harmonized {
                flex: none;
                width: 100%;
                order: 1;
            }
            
            .view-modes-harmonized {
                width: 100%;
                justify-content: space-around;
                order: 2;
            }
            
            .action-buttons-harmonized {
                width: 100%;
                justify-content: center;
                flex-wrap: wrap;
                order: 3;
            }
            
            .dropdown-menu-harmonized {
                right: auto;
                left: 0;
            }
            
            .status-filters-harmonized-twolines .status-pill-harmonized-twolines {
                flex: 0 1 calc(25% - var(--gap-small));
                min-width: 80px;
                max-width: 140px;
                height: 52px;
            }
        }
        
        @media (max-width: 768px) {
            .status-filters-harmonized-twolines {
                justify-content: center;
            }
            
            .status-filters-harmonized-twolines .status-pill-harmonized-twolines {
                flex: 0 1 calc(33.333% - var(--gap-small));
                min-width: 70px;
                max-width: 120px;
                height: 48px;
            }
            
            .view-mode-harmonized span,
            .btn-harmonized span {
                display: none;
            }
            
            .action-buttons-harmonized {
                gap: 4px;
            }
            
            .dropdown-menu-harmonized {
                min-width: 150px;
            }
            
            .preselected-star {
                width: 16px;
                height: 16px;
                font-size: 9px;
                top: -6px;
                right: -6px;
            }
        }
        
        @media (max-width: 480px) {
            .status-filters-harmonized-twolines .status-pill-harmonized-twolines {
                flex: 0 1 calc(50% - 4px);
                min-width: 60px;
                max-width: 110px;
                height: 44px;
            }
            
            .action-buttons-harmonized {
                flex-direction: column;
                gap: 4px;
                align-items: stretch;
            }
            
            .action-buttons-harmonized > * {
                width: 100%;
                justify-content: center;
            }
            
            .dropdown-menu-harmonized {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90vw;
                max-width: 300px;
            }
            
            .explanation-text-harmonized {
                font-size: 12px;
                padding: var(--gap-small);
            }
            
            .task-harmonized-card {
                padding: 10px;
                min-height: 70px;
                max-height: 70px;
            }
            
            .task-title-harmonized {
                font-size: 14px;
            }
            
            .task-meta-harmonized {
                display: none;
            }
            
            .preselected-badge-harmonized {
                font-size: 10px;
                padding: 2px 4px;
            }
        }
    `;
    
    document.head.appendChild(styles);
}
