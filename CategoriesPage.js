addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Styles principaux pour CategoriesPage */
            .settings-page-compact {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            }

            .page-header-compact {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid #e5e7eb;
            }

            .page-header-compact h1 {
                margin: 0 0 12px 0;
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
            }

            /* Onglets */
            .settings-tabs-compact {
                display: flex;
                background: #ffffff;
                border-radius: 12px;
                padding: 4px;
                margin-bottom: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                gap: 4px;
            }

            .tab-button-compact {
                flex: 1;
                padding: 12px 16px;
                background: transparent;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .tab-button-compact:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .tab-button-compact.active {
                background: #3b82f6;
                color: white;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
            }

            /* Cartes de paramètres */
            .settings-card-compact {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }

            .settings-card-compact.full-width {
                width: 100%;
            }

            .card-header-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid #f3f4f6;
            }

            .card-header-compact i {
                color: #3b82f6;
                font-size: 18px;
            }

            .card-header-compact h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                flex: 1;
            }

            /* Formulaires */
            .form-row-compact {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
            }

            .form-group-compact {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-label-compact {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }

            .form-select-compact {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                color: #374151;
            }

            .form-select-compact:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            /* Switches */
            .switch-container-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .switch-container-compact:hover {
                background: #f8fafc;
                border-color: #3b82f6;
            }

            .switch-container-compact input[type="checkbox"] {
                display: none;
            }

            .switch-slider-compact {
                position: relative;
                width: 44px;
                height: 24px;
                background: #d1d5db;
                border-radius: 12px;
                transition: all 0.2s ease;
                cursor: pointer;
                flex-shrink: 0;
            }

            .switch-slider-compact::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .switch-container-compact input:checked + .switch-slider-compact {
                background: #3b82f6;
            }

            .switch-container-compact input:checked + .switch-slider-compact::before {
                transform: translateX(20px);
            }

            .switch-labels-compact {
                flex: 1;
            }

            .switch-title-compact {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 2px;
            }

            .switch-description-compact {
                display: block;
                font-size: 12px;
                color: #6b7280;
            }

            /* Boutons */
            .btn-compact {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border: 1px solid;
                text-decoration: none;
            }

            .btn-compact.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-compact.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
                transform: translateY(-1px);
            }

            .btn-compact.btn-secondary {
                background: white;
                color: #374151;
                border-color: #d1d5db;
            }

            .btn-compact.btn-secondary:hover {
                background: #f9fafb;
                border-color: #9ca3af;
                transform: translateY(-1px);
            }

            /* Actions rapides */
            .quick-actions-grid-compact {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
            }

            .btn-quick-action-compact {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 16px 12px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #374151;
                text-decoration: none;
            }

            .btn-quick-action-compact:hover {
                background: #f0f9ff;
                border-color: #3b82f6;
                color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .btn-quick-action-compact i {
                font-size: 18px;
            }

            .btn-quick-action-compact span {
                font-size: 12px;
                font-weight: 600;
            }

            /* Automatisation */
            .automation-focused-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .task-automation-section {
                margin: 20px 0;
            }

            .task-automation-section h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .categories-selection-grid-automation {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 12px;
            }

            .category-checkbox-item-enhanced {
                display: flex;
                align-items: center;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: white;
            }

            .category-checkbox-item-enhanced:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .category-checkbox-item-enhanced input[type="checkbox"] {
                margin-right: 12px;
                width: 18px;
                height: 18px;
                cursor: pointer;
            }

            .category-checkbox-content-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }

            .cat-icon-automation {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }

            .cat-name-automation {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                flex: 1;
            }

            .selected-indicator {
                background: #10b981 !important;
                color: white !important;
                padding: 2px 8px !important;
                border-radius: 6px !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                margin-left: auto !important;
            }

            .custom-badge {
                background: #f59e0b;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }

            .automation-options-enhanced {
                margin: 20px 0;
            }

            .automation-options-enhanced h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .automation-options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }

            .checkbox-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .checkbox-enhanced:hover {
                background: #f8fafc;
                border-color: #3b82f6;
            }

            .checkbox-enhanced input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }

            .checkbox-content {
                flex: 1;
            }

            .checkbox-title {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 2px;
            }

            .checkbox-description {
                display: block;
                font-size: 12px;
                color: #6b7280;
            }

            .automation-stats {
                margin: 20px 0;
            }

            .automation-stats h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
            }

            .stat-item {
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px 12px;
                text-align: center;
                transition: all 0.2s ease;
            }

            .stat-item:hover {
                background: #f0f9ff;
                border-color: #3b82f6;
                transform: translateY(-1px);
            }

            .stat-number {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .stat-label {
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: #6b7280;
            }

            /* Gestion des catégories */
            .categories-management-layout {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .categories-grid-management {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 16px;
                margin-top: 16px;
            }

            .category-card-management {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                transition: all 0.3s ease;
                position: relative;
            }

            .category-card-management:hover {
                border-color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            }

            .category-card-management.preselected {
                border-color: #8b5cf6;
                background: #fdf4ff;
            }

            .category-card-header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 12px;
            }

            .category-icon-display {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }

            .category-info {
                flex: 1;
                min-width: 0;
            }

            .category-name {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }

            .category-description {
                margin: 0;
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
            }

            .preselected-badge-small {
                position: absolute;
                top: 8px;
                right: 8px;
                background: #8b5cf6;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }

            .category-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                font-size: 12px;
            }

            .category-priority {
                color: #6b7280;
                font-weight: 500;
            }

            .custom-badge-small,
            .system-badge-small {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }

            .custom-badge-small {
                background: #f59e0b;
                color: white;
            }

            .system-badge-small {
                background: #10b981;
                color: white;
            }

            .category-actions {
                display: flex;
                gap: 6px;
                justify-content: flex-end;
            }

            .btn-category-action {
                width: 32px;
                height: 32px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 14px;
            }

            .btn-category-action:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
                color: #374151;
            }

            .btn-category-action.edit:hover {
                background: #dbeafe;
                border-color: #3b82f6;
                color: #3b82f6;
            }

            .btn-category-action.delete:hover {
                background: #fee2e2;
                border-color: #ef4444;
                color: #ef4444;
            }

            .category-count-badge {
                background: #f3f4f6;
                color: #6b7280;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                margin-left: auto;
            }

            /* État vide */
            .empty-categories-state {
                text-align: center;
                padding: 40px 20px;
                background: #f8fafc;
                border-radius: 12px;
                border: 2px dashed #d1d5db;
            }

            .empty-categories-state .empty-icon {
                font-size: 48px;
                color: #d1d5db;
                margin-bottom: 16px;
            }

            .empty-categories-state h4 {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 600;
                color: #374151;
            }

            .empty-categories-state p {
                margin: 0 0 20px 0;
                color: #6b7280;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }

            /* Actions avancées */
            .advanced-actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .btn-advanced-action {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }

            .btn-advanced-action:hover {
                background: #f8fafc;
                border-color: #3b82f6;
                transform: translateY(-1px);
            }

            .btn-advanced-action i {
                font-size: 20px;
                color: #3b82f6;
                flex-shrink: 0;
            }

            .action-content {
                flex: 1;
            }

            .action-title {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 2px;
            }

            .action-description {
                display: block;
                font-size: 12px;
                color: #6b7280;
            }

            /* Formulaire de catégorie */
            .category-form-content {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .form-section {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
            }

            .form-section h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .form-section h4 i {
                color: #3b82f6;
            }

            .section-help {
                margin: 0 0 16px 0;
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .form-label-required::after {
                content: ' *';
                color: #ef4444;
            }

            .form-input-compact,
            .form-select-compact,
            .form-textarea-compact {
                padding: 10px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s ease;
            }

            .form-input-compact:focus,
            .form-select-compact:focus,
            .form-textarea-compact:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-input-compact.error {
                border-color: #ef4444;
            }

            .field-help {
                font-size: 12px;
                color: #6b7280;
                margin-top: 4px;
            }

            .field-error {
                font-size: 12px;
                color: #ef4444;
                margin-top: 4px;
                font-weight: 500;
            }

            /* Sélecteurs spéciaux */
            .icon-selector {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .icon-input {
                flex: 1;
            }

            .icon-preview {
                width: 40px;
                height: 40px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                background: #f8fafc;
            }

            .btn-icon-picker {
                width: 40px;
                height: 40px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .btn-icon-picker:hover {
                background: #f3f4f6;
                border-color: #3b82f6;
                color: #3b82f6;
            }

            .color-selector {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .color-input {
                width: 100%;
                height: 40px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                cursor: pointer;
            }

            .color-presets {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }

            .color-preset {
                width: 24px;
                height: 24px;
                border: 2px solid #e5e7eb;
                border-radius: 4px;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .color-preset:hover {
                transform: scale(1.1);
                border-color: #374151;
            }

            /* Mots-clés */
            .keywords-form-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .keyword-type-section {
                border-left: 4px solid #e5e7eb;
                padding-left: 12px;
            }

            .keyword-type-label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .keywords-textarea {
                width: 100%;
                padding: 10px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                font-size: 13px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                resize: vertical;
                transition: border-color 0.2s ease;
            }

            .keywords-textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .keyword-help {
                font-size: 11px;
                color: #6b7280;
                margin-top: 4px;
                font-style: italic;
            }

            /* Aperçu */
            .category-preview {
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
            }

            .preview-card {
                display: flex;
                align-items: center;
                gap: 12px;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
            }

            .preview-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .preview-content {
                flex: 1;
            }

            .preview-name {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 2px;
            }

            .preview-description {
                font-size: 12px;
                color: #6b7280;
            }

            .preview-priority {
                font-size: 11px;
                color: #9ca3af;
                font-weight: 500;
            }

            /* Affichage des mots-clés */
            .keywords-display-content {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .category-header-display {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
            }

            .category-icon-large {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                flex-shrink: 0;
            }

            .keywords-sections {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .keyword-section h4 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .keywords-list {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .keyword-tag {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                border: 1px solid;
            }

            .keyword-tag.absolute {
                background: #fef3c7;
                color: #92400e;
                border-color: #f59e0b;
            }

            .keyword-tag.strong {
                background: #dbeafe;
                color: #1e40af;
                border-color: #3b82f6;
            }

            .keyword-tag.weak {
                background: #f3f4f6;
                color: #4b5563;
                border-color: #9ca3af;
            }

            .keyword-tag.exclusion {
                background: #fee2e2;
                color: #991b1b;
                border-color: #ef4444;
            }

            .no-keywords-message {
                text-align: center;
                padding: 40px 20px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px dashed #d1d5db;
            }

            .no-keywords-message i {
                font-size: 32px;
                color: #d1d5db;
                margin-bottom: 12px;
                display: block;
            }

            .keywords-actions {
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
            }

            /* Modales */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal-overlay.visible {
                opacity: 1;
            }

            .modal-container {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }

            .modal-overlay.visible .modal-container {
                transform: translateY(0);
            }

            .modal-small {
                width: 100%;
                max-width: 400px;
            }

            .modal-medium {
                width: 100%;
                max-width: 600px;
            }

            .modal-large {
                width: 100%;
                max-width: 900px;
            }

            .modal-xlarge {
                width: 100%;
                max-width: 1200px;
            }

            .modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
                background: #f8fafc;
            }

            .modal-title {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
            }

            .modal-close-btn {
                width: 32px;
                height: 32px;
                border: none;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .modal-close-btn:hover {
                background: rgba(0, 0, 0, 0.2);
                color: #374151;
            }

            .modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
            }

            .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 20px 24px;
                border-top: 1px solid #e5e7eb;
                background: #f8fafc;
            }

            .btn-danger {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger:hover {
                background: #dc2626;
                border-color: #dc2626;
            }

            .btn-danger:disabled {
                background: #9ca3af;
                border-color: #9ca3af;
                cursor: not-allowed;
                transform: none;
            }

            .btn-danger.enabled {
                background: #ef4444;
                border-color: #ef4444;
                cursor: pointer;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .settings-page-compact {
                    padding: 12px;
                }

                .form-row-compact {
                    grid-template-columns: 1fr;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }

                .automation-options-grid,
                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .categories-selection-grid-automation {
                    grid-template-columns: 1fr;
                }

                .categories-grid-management {
                    grid-template-columns: 1fr;
                }

                .advanced-actions-grid {
                    grid-template-columns: 1fr;
                }

                .quick-actions-grid-compact {
                    grid-template-columns: repeat(2, 1fr);
                }

                .modal-container {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }

                .modal-small,
                .modal-medium,
                .modal-large,
                .modal-xlarge {
                    width: 100%;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    renderErrorState(error) {
        return `
            <div class="error-display" style="padding: 20px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                <h2>Erreur de chargement des paramètres</h2>
                <p>Une erreur est survenue: ${error.message}</p>
                <button onclick="window.categoriesPage.forceUpdateUI()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Réessayer
                </button>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recharger la page
                </button>
            </div>
        `;
    }

    renderModuleStatusBar(status) {
        const totalModules = Object.keys(status).length;
        const availableModules = Object.values(status).filter(Boolean).length;
        const statusColor = availableModules === totalModules ? '#10b981' : 
                           availableModules > totalModules / 2 ? '#f59e0b' : '#ef4444';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas fa-plug"></i> 
                Modules disponibles: ${availableModules}/${totalModules}
                ${availableModules < totalModules ? ' - Certaines fonctionnalités peuvent être limitées' : ' - Tous les modules chargés'}
            </div>
        `;
    }

    renderSyncStatusBar(syncStatus) {
        const statusColor = syncStatus.isSync ? '#10b981' : '#f59e0b';
        const statusIcon = syncStatus.isSync ? 'fa-check-circle' : 'fa-exclamation-triangle';
        const statusText = syncStatus.isSync ? 
            `Synchronisé - ${syncStatus.expectedCategories.length} catégorie(s) pré-sélectionnée(s)` :
            'Désynchronisation détectée';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas ${statusIcon}"></i> 
                État synchronisation: ${statusText}
                ${!syncStatus.isSync ? `
                    <button onclick="window.categoriesPage.forceSynchronization()" 
                            style="margin-left: 12px; padding: 2px 8px; background: ${statusColor}; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">
                        Corriger
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderAutomationSyncIndicator(preselectedCategories) {
        const syncStatus = this.checkSyncStatus({ taskPreselectedCategories: preselectedCategories });
        
        if (syncStatus.isSync) {
            return `
                <div class="sync-indicator sync-ok">
                    <i class="fas fa-check-circle"></i>
                    <span>Synchronisation OK - ${preselectedCategories.length} catégorie(s) active(s)</span>
                </div>
            `;
        } else {
            return `
                <div class="sync-indicator sync-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Désynchronisation détectée - Correction automatique en cours</span>
                    <button class="btn-fix-sync-small" onclick="window.categoriesPage.forceSynchronization()">
                        <i class="fas fa-sync"></i> Corriger
                    </button>
                </div>
            `;
        }
    }

    renderTabContent(settings, moduleStatus) {
        switch (this.currentTab) {
            case 'general':
                return this.renderGeneralTab(settings, moduleStatus);
            case 'automation':
                return this.renderAutomationTab(settings, moduleStatus);
            case 'keywords':
                return this.renderKeywordsTab(settings, moduleStatus);
            default:
                return this.renderGeneralTab(settings, moduleStatus);
        }
    }

    renderGeneralTab(settings, moduleStatus) {
        try {
            return `
                <div class="general-tab-layout">
                    <!-- Préférences d'affichage -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-eye"></i>
                            <h3>Préférences d'affichage</h3>
                        </div>
                        <div class="settings-grid-compact">
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="darkMode" 
                                       ${settings.preferences?.darkMode ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Mode sombre</span>
                                    <span class="switch-description-compact">Interface sombre pour vos yeux</span>
                                </div>
                            </label>
                            
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="compactView" 
                                       ${settings.preferences?.compactView ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Vue compacte</span>
                                    <span class="switch-description-compact">Affichage condensé des emails</span>
                                </div>
                            </label>
                            
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="showNotifications" 
                                       ${settings.preferences?.showNotifications !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Notifications</span>
                                    <span class="switch-description-compact">Alertes et confirmations</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Paramètres de scan -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-search"></i>
                            <h3>Paramètres de scan</h3>
                        </div>
                        <div class="form-row-compact">
                            <div class="form-group-compact">
                                <label class="form-label-compact">Période par défaut</label>
                                <select id="defaultScanPeriod" 
                                        class="form-select-compact"
                                        onchange="window.categoriesPage.saveScanSettings()">
                                    <option value="1" ${settings.scanSettings?.defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                    <option value="3" ${settings.scanSettings?.defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                    <option value="7" ${settings.scanSettings?.defaultPeriod === 7 ? 'selected' : ''}>7 jours</option>
                                    <option value="15" ${settings.scanSettings?.defaultPeriod === 15 ? 'selected' : ''}>15 jours</option>
                                    <option value="30" ${settings.scanSettings?.defaultPeriod === 30 ? 'selected' : ''}>30 jours</option>
                                </select>
                            </div>
                            
                            <div class="form-group-compact">
                                <label class="form-label-compact">Dossier par défaut</label>
                                <select id="defaultFolder" 
                                        class="form-select-compact"
                                        onchange="window.categoriesPage.saveScanSettings()">
                                    <option value="inbox" ${settings.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                    <option value="sent" ${settings.scanSettings?.defaultFolder === 'sent' ? 'selected' : ''}>Éléments envoyés</option>
                                    <option value="archive" ${settings.scanSettings?.defaultFolder === 'archive' ? 'selected' : ''}>Archive</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="settings-grid-compact">
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="autoAnalyze" 
                                       ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.saveScanSettings()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Analyse automatique</span>
                                    <span class="switch-description-compact">Analyser les emails automatiquement</span>
                                </div>
                            </label>
                            
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="autoCategrize" 
                                       ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.saveScanSettings()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Catégorisation automatique</span>
                                    <span class="switch-description-compact">Classer les emails par catégorie</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Paramètres de filtrage -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-filter"></i>
                            <h3>Filtrage des emails</h3>
                        </div>
                        <div class="settings-grid-compact">
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="excludeSpam" 
                                       ${settings.preferences?.excludeSpam !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Exclure les spams</span>
                                    <span class="switch-description-compact">Ignorer les emails indésirables</span>
                                </div>
                            </label>
                            
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="detectCC" 
                                       ${settings.preferences?.detectCC !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Détecter les CC</span>
                                    <span class="switch-description-compact">Identifier les emails en copie</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Actions rapides -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-tools"></i>
                            <h3>Actions rapides</h3>
                        </div>
                        <div class="quick-actions-grid-compact">
                            <button class="btn-quick-action-compact" onclick="window.categoriesPage.exportSettings()">
                                <i class="fas fa-download"></i>
                                <span>Exporter</span>
                            </button>
                            <button class="btn-quick-action-compact" onclick="window.categoriesPage.importSettings()">
                                <i class="fas fa-upload"></i>
                                <span>Importer</span>
                            </button>
                            <button class="btn-quick-action-compact" onclick="window.categoriesPage.debugSettings()">
                                <i class="fas fa-bug"></i>
                                <span>Debug</span>
                            </button>
                            <button class="btn-quick-action-compact" onclick="window.categoriesPage.forceSynchronization()">
                                <i class="fas fa-sync"></i>
                                <span>Sync</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderGeneralTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet général</div>';
        }
    }

    renderAutomationTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            console.log('[CategoriesPage] 🎯 Rendu automatisation:');
            console.log('  - Catégories disponibles:', Object.keys(categories));
            console.log('  - Catégories pré-sélectionnées:', preselectedCategories);
            
            return `
                <div class="automation-focused-layout">
                    <div class="settings-card-compact full-width">
                        <div class="card-header-compact">
                            <i class="fas fa-check-square"></i>
                            <h3>Conversion automatique en tâches</h3>
                            ${moduleStatus.aiTaskAnalyzer ? 
                                '<span class="status-badge status-ok">✓ IA Disponible</span>' : 
                                '<span class="status-badge status-warning">⚠ IA Limitée</span>'
                            }
                        </div>
                        <p>Sélectionnez les catégories d'emails qui seront automatiquement proposées pour la création de tâches et configurez le comportement de l'automatisation.</p>
                        
                        <!-- Indicateur de synchronisation temps réel -->
                        <div id="automation-sync-indicator" class="automation-sync-indicator">
                            ${this.renderAutomationSyncIndicator(preselectedCategories)}
                        </div>
                        
                        <!-- Sélection des catégories -->
                        <div class="task-automation-section">
                            <h4><i class="fas fa-tags"></i> Catégories pré-sélectionnées</h4>
                            <div class="categories-selection-grid-automation" id="categoriesSelectionGrid">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = preselectedCategories.includes(id);
                                    console.log(`[CategoriesPage] 📋 Catégorie ${id} (${category.name}): ${isPreselected ? 'SÉLECTIONNÉE' : 'non sélectionnée'}`);
                                    return `
                                        <label class="category-checkbox-item-enhanced" data-category-id="${id}">
                                            <input type="checkbox" 
                                                   class="category-preselect-checkbox"
                                                   value="${id}"
                                                   data-category-name="${category.name}"
                                                   ${isPreselected ? 'checked' : ''}
                                                   onchange="window.categoriesPage.updateTaskPreselectedCategories()">
                                            <div class="category-checkbox-content-enhanced">
                                                <span class="cat-icon-automation" style="background: ${category.color}20; color: ${category.color}">
                                                    ${category.icon}
                                                </span>
                                                <span class="cat-name-automation">${category.name}</span>
                                                ${category.isCustom ? '<span class="custom-badge">Personnalisée</span>' : ''}
                                                ${isPreselected ? '<span class="selected-indicator">✓ Sélectionné</span>' : ''}
                                            </div>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- Options d'automatisation -->
                        <div class="automation-options-enhanced">
                            <h4><i class="fas fa-cog"></i> Options d'automatisation</h4>
                            <div class="automation-options-grid">
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoCreateTasks" 
                                           ${settings.automationSettings?.autoCreateTasks ? 'checked' : ''}
                                           ${moduleStatus.aiTaskAnalyzer ? '' : 'disabled'}
                                           onchange="window.categoriesPage.saveAutomationSettings()">
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Création automatique</span>
                                        <span class="checkbox-description">Créer automatiquement les tâches sans confirmation</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="groupTasksByDomain" 
                                           ${settings.automationSettings?.groupTasksByDomain ? 'checked' : ''}
                                           onchange="window.categoriesPage.saveAutomationSettings()">
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Regroupement par domaine</span>
                                        <span class="checkbox-description">Regrouper les tâches par domaine d'expéditeur</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="skipDuplicates" 
                                           ${settings.automationSettings?.skipDuplicates !== false ? 'checked' : ''}
                                           onchange="window.categoriesPage.saveAutomationSettings()">
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Ignorer les doublons</span>
                                        <span class="checkbox-description">Éviter de créer des tâches en double</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoAssignPriority" 
                                           ${settings.automationSettings?.autoAssignPriority ? 'checked' : ''}
                                           onchange="window.categoriesPage.saveAutomationSettings()">
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Priorité automatique</span>
                                        <span class="checkbox-description">Assigner automatiquement la priorité selon l'expéditeur</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Statistiques avec état synchronisation -->
                        <div class="automation-stats">
                            <h4><i class="fas fa-chart-bar"></i> Statistiques</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-categories">${preselectedCategories.length}</span>
                                    <span class="stat-label">Catégories actives</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-exclusions">${(settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0)}</span>
                                    <span class="stat-label">Règles d'exclusion</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-automation">${Object.values(settings.automationSettings || {}).filter(Boolean).length}</span>
                                    <span class="stat-label">Options activées</span>
                                </div>
                                <div class="stat-item sync-stat">
                                    <span class="stat-number" id="stat-sync">${this.checkSyncStatus(settings).isSync ? '✅' : '⚠️'}</span>
                                    <span class="stat-label">Synchronisation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderAutomationTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet automatisation</div>';
        }
    }
}

// Styles CSS supplémentaires pour la gestion des catégories
const categoryManagementStyles = `
    .settings-grid-compact {
        display: grid;
        gap: 16px;
    }

    /* Indicateurs de synchronisation */
    .automation-sync-indicator {
        margin: 16px 0;
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
    }

    .sync-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
    }

    .sync-indicator.sync-ok {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #10b981;
    }

    .sync-indicator.sync-warning {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #f59e0b;
    }

    .btn-fix-sync-small {
        background: rgba(0, 0, 0, 0.1);
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
        transition: all 0.2s ease;
    }

    .btn-fix-sync-small:hover {
        background: rgba(0, 0, 0, 0.2);
        transform: translateY(-1px);
    }

    /* Badges de statut */
    .status-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
        margin-left: 8px;
    }

    .status-badge.status-ok {
        background: #dcfce7;
        color: #166534;
    }

    .status-badge.status-warning {
        background: #fef3c7;
        color: #92400e;
    }

    .status-badge.status-error {
        background: #fee2e2;
        color: #991b1b;
    }

    .general-tab-layout {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
`;

// Créer l'instance globale avec nettoyage préalable
try {
    if (window.categoriesPage) {
        window.categoriesPage.destroy?.();
    }

    window.categoriesPage = new CategoriesPage();

    // Export pour PageManager avec une méthode renderSettings
    if (window.pageManager && window.pageManager.pages) {
        delete window.pageManager.pages.categories;
        delete window.pageManager.pages.keywords;
        
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur rendu paramètres:', error);
                container.innerHTML = window.categoriesPage.renderErrorState(error);
            }
        };
        
        console.log('✅ CategoriesPage v9.0 intégrée au PageManager');
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique initialisation:', error);
}

console.log('✅ CategoriesPage v9.0 loaded - Gestion complète des catégories avec CRUD');// CategoriesPage.js - Version 9.0 - Gestion complète des catégories avec CRUD

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.eventListenersSetup = false;
        this.lastNotificationTime = 0;
        
        // NOUVEAU: État pour l'édition de catégories
        this.editingCategory = null;
        this.categoryFormMode = 'create'; // 'create' | 'edit'
        
        // Gestion de synchronisation renforcée
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 9.0 - Gestion complète des catégories avec CRUD');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal', 'hideExplanationMessage',
            'debugSettings', 'testCategorySelection', 'forceUpdateUI', 'forceSynchronization',
            // NOUVEAU: Méthodes CRUD catégories
            'showCreateCategoryModal', 'showEditCategoryModal', 'showDeleteCategoryModal',
            'showCategoryKeywordsModal', 'createNewCategory', 'editCustomCategory', 
            'deleteCustomCategory', 'saveCategoryForm', 'validateCategoryForm',
            'generateCategoryId', 'getCategoryPreview', 'resetCategoryForm'
        ];
        
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // ================================================
    // ONGLET CATÉGORIES - COMPLET AVEC CRUD
    // ================================================
    renderKeywordsTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = Object.entries(categories).filter(([id, cat]) => cat.isCustom);
            const systemCategories = Object.entries(categories).filter(([id, cat]) => !cat.isCustom);
            
            return `
                <div class="categories-management-layout">
                    <!-- Création de nouvelle catégorie -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-plus-circle"></i>
                            <h3>Gestion des catégories</h3>
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                                <i class="fas fa-plus"></i>
                                Nouvelle catégorie
                            </button>
                        </div>
                        <p>Créez et gérez vos catégories personnalisées pour classifier vos emails selon vos besoins spécifiques.</p>
                    </div>

                    <!-- Catégories système -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-cogs"></i>
                            <h3>Catégories système</h3>
                            <span class="category-count-badge">${systemCategories.length} catégories</span>
                        </div>
                        <div class="categories-grid-management">
                            ${systemCategories.map(([id, category]) => this.renderCategoryCard(id, category, false)).join('')}
                        </div>
                    </div>

                    <!-- Catégories personnalisées -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-user-cog"></i>
                            <h3>Catégories personnalisées</h3>
                            <span class="category-count-badge">${customCategories.length} catégories</span>
                        </div>
                        ${customCategories.length > 0 ? `
                            <div class="categories-grid-management">
                                ${customCategories.map(([id, category]) => this.renderCategoryCard(id, category, true)).join('')}
                            </div>
                        ` : `
                            <div class="empty-categories-state">
                                <div class="empty-icon">
                                    <i class="fas fa-folder-plus"></i>
                                </div>
                                <h4>Aucune catégorie personnalisée</h4>
                                <p>Créez votre première catégorie personnalisée pour organiser vos emails selon vos besoins.</p>
                                <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                                    <i class="fas fa-plus"></i>
                                    Créer ma première catégorie
                                </button>
                            </div>
                        `}
                    </div>

                    <!-- Actions globales -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-tools"></i>
                            <h3>Actions avancées</h3>
                        </div>
                        <div class="advanced-actions-grid">
                            <button class="btn-advanced-action" onclick="window.categoriesPage.exportCategories()">
                                <i class="fas fa-download"></i>
                                <div class="action-content">
                                    <span class="action-title">Exporter catégories</span>
                                    <span class="action-description">Sauvegarder toutes vos catégories</span>
                                </div>
                            </button>
                            <button class="btn-advanced-action" onclick="window.categoriesPage.importCategories()">
                                <i class="fas fa-upload"></i>
                                <div class="action-content">
                                    <span class="action-title">Importer catégories</span>
                                    <span class="action-description">Restaurer des catégories sauvegardées</span>
                                </div>
                            </button>
                            <button class="btn-advanced-action" onclick="window.categoriesPage.resetCategories()">
                                <i class="fas fa-undo"></i>
                                <div class="action-content">
                                    <span class="action-title">Réinitialiser</span>
                                    <span class="action-description">Restaurer les paramètres par défaut</span>
                                </div>
                            </button>
                            <button class="btn-advanced-action" onclick="window.categoriesPage.testAllCategories()">
                                <i class="fas fa-vial"></i>
                                <div class="action-content">
                                    <span class="action-title">Tester catégories</span>
                                    <span class="action-description">Vérifier le fonctionnement</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderKeywordsTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet catégories</div>';
        }
    }

    renderCategoryCard(categoryId, category, isEditable = false) {
        const isPreselected = this.getTaskPreselectedCategories().includes(categoryId);
        const priority = category.priority || 50;
        
        return `
            <div class="category-card-management ${isPreselected ? 'preselected' : ''}" data-category-id="${categoryId}">
                <div class="category-card-header">
                    <div class="category-icon-display" style="background: ${category.color}20; color: ${category.color};">
                        ${category.icon}
                    </div>
                    <div class="category-info">
                        <h5 class="category-name">${category.name}</h5>
                        <p class="category-description">${category.description || 'Aucune description'}</p>
                    </div>
                    ${isPreselected ? '<span class="preselected-badge-small">⭐ Pré-sélectionné</span>' : ''}
                </div>
                
                <div class="category-meta">
                    <span class="category-priority">Priorité: ${priority}</span>
                    ${category.isCustom ? '<span class="custom-badge-small">Personnalisée</span>' : '<span class="system-badge-small">Système</span>'}
                </div>
                
                <div class="category-actions">
                    <button class="btn-category-action" onclick="window.categoriesPage.showCategoryKeywordsModal('${categoryId}')" title="Voir mots-clés">
                        <i class="fas fa-key"></i>
                    </button>
                    ${isEditable ? `
                        <button class="btn-category-action edit" onclick="window.categoriesPage.showEditCategoryModal('${categoryId}')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-category-action delete" onclick="window.categoriesPage.showDeleteCategoryModal('${categoryId}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <button class="btn-category-action" onclick="window.categoriesPage.showCategoryKeywordsModal('${categoryId}')" title="Informations">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    // ================================================
    // MODALES CRUD CATÉGORIES
    // ================================================
    showCreateCategoryModal() {
        this.categoryFormMode = 'create';
        this.editingCategory = null;
        
        const modalContent = this.renderCategoryFormModal();
        this.showModal('Créer une nouvelle catégorie', modalContent, 'large');
        
        setTimeout(() => {
            this.initializeCategoryForm();
        }, 100);
    }

    showEditCategoryModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category || !category.isCustom) {
            this.showToast('Seules les catégories personnalisées peuvent être modifiées', 'warning');
            return;
        }
        
        this.categoryFormMode = 'edit';
        this.editingCategory = { id: categoryId, ...category };
        
        const modalContent = this.renderCategoryFormModal();
        this.showModal('Modifier la catégorie', modalContent, 'large');
        
        setTimeout(() => {
            this.initializeCategoryForm();
            this.populateCategoryForm(this.editingCategory);
        }, 100);
    }

    showDeleteCategoryModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category || !category.isCustom) {
            this.showToast('Seules les catégories personnalisées peuvent être supprimées', 'warning');
            return;
        }
        
        const modalContent = `
            <div class="delete-confirmation-content">
                <div class="delete-warning-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h4>Confirmer la suppression</h4>
                <p>Êtes-vous sûr de vouloir supprimer la catégorie <strong>"${category.name}"</strong> ?</p>
                <div class="delete-details">
                    <div class="category-preview-delete">
                        <span class="category-icon-preview" style="background: ${category.color}20; color: ${category.color};">
                            ${category.icon}
                        </span>
                        <div>
                            <div class="category-name-preview">${category.name}</div>
                            <div class="category-desc-preview">${category.description || 'Aucune description'}</div>
                        </div>
                    </div>
                </div>
                <div class="delete-warning">
                    <i class="fas fa-info-circle"></i>
                    <span>Cette action est irréversible. Les emails déjà classés dans cette catégorie seront reclassés automatiquement.</span>
                </div>
                <div class="confirmation-input-section">
                    <label for="deleteConfirmInput">Tapez <strong>"SUPPRIMER"</strong> pour confirmer :</label>
                    <input type="text" id="deleteConfirmInput" class="form-input-compact" placeholder="SUPPRIMER" autocomplete="off">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-compact btn-secondary" onclick="window.categoriesPage.closeModal()">
                    Annuler
                </button>
                <button class="btn-compact btn-danger" id="confirmDeleteButton" disabled onclick="window.categoriesPage.confirmDeleteCategory('${categoryId}')">
                    <i class="fas fa-trash"></i>
                    Supprimer définitivement
                </button>
            </div>
        `;
        
        this.showModal('Supprimer la catégorie', modalContent, 'medium');
        
        setTimeout(() => {
            const input = document.getElementById('deleteConfirmInput');
            const button = document.getElementById('confirmDeleteButton');
            
            if (input && button) {
                input.addEventListener('input', () => {
                    button.disabled = input.value !== 'SUPPRIMER';
                    button.classList.toggle('enabled', input.value === 'SUPPRIMER');
                });
            }
        }, 100);
    }

    showCategoryKeywordsModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        const keywords = window.categoryManager?.weightedKeywords?.[categoryId];
        
        const modalContent = `
            <div class="keywords-display-content">
                <div class="category-header-display">
                    <div class="category-icon-large" style="background: ${category.color}20; color: ${category.color};">
                        ${category.icon}
                    </div>
                    <div>
                        <h3>${category.name}</h3>
                        <p>${category.description || 'Aucune description'}</p>
                        ${category.isCustom ? '<span class="custom-badge">Personnalisée</span>' : '<span class="system-badge">Système</span>'}
                    </div>
                </div>
                
                ${keywords ? `
                    <div class="keywords-sections">
                        ${keywords.absolute?.length > 0 ? `
                            <div class="keyword-section">
                                <h4><i class="fas fa-star"></i> Mots-clés absolus (100 points)</h4>
                                <div class="keywords-list">
                                    ${keywords.absolute.map(kw => `<span class="keyword-tag absolute">${kw}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${keywords.strong?.length > 0 ? `
                            <div class="keyword-section">
                                <h4><i class="fas fa-bolt"></i> Mots-clés forts (30 points)</h4>
                                <div class="keywords-list">
                                    ${keywords.strong.map(kw => `<span class="keyword-tag strong">${kw}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${keywords.weak?.length > 0 ? `
                            <div class="keyword-section">
                                <h4><i class="fas fa-feather"></i> Mots-clés faibles (10 points)</h4>
                                <div class="keywords-list">
                                    ${keywords.weak.map(kw => `<span class="keyword-tag weak">${kw}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${keywords.exclusions?.length > 0 ? `
                            <div class="keyword-section">
                                <h4><i class="fas fa-ban"></i> Exclusions</h4>
                                <div class="keywords-list">
                                    ${keywords.exclusions.map(kw => `<span class="keyword-tag exclusion">${kw}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-keywords-message">
                        <i class="fas fa-info-circle"></i>
                        <p>Cette catégorie n'a pas de mots-clés configurés ou ils ne sont pas disponibles.</p>
                    </div>
                `}
                
                ${category.isCustom ? `
                    <div class="keywords-actions">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.showEditCategoryModal('${categoryId}')">
                            <i class="fas fa-edit"></i>
                            Modifier cette catégorie
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.showModal(`Mots-clés : ${category.name}`, modalContent, 'large');
    }

    renderCategoryFormModal() {
        const isEdit = this.categoryFormMode === 'edit';
        const title = isEdit ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie';
        
        return `
            <div class="category-form-content">
                <div class="form-section">
                    <h4><i class="fas fa-info-circle"></i> Informations de base</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="categoryName" class="form-label-required">Nom de la catégorie</label>
                            <input type="text" id="categoryName" class="form-input-compact" 
                                   placeholder="Ex: Projets client" maxlength="50" required>
                            <div class="field-help">Le nom affiché pour cette catégorie</div>
                        </div>
                        <div class="form-group">
                            <label for="categoryIcon" class="form-label-required">Icône</label>
                            <div class="icon-selector">
                                <input type="text" id="categoryIcon" class="form-input-compact icon-input" 
                                       placeholder="📁" maxlength="2" required>
                                <div class="icon-preview" id="iconPreview">📁</div>
                                <button type="button" class="btn-icon-picker" onclick="window.categoriesPage.showIconPicker()">
                                    <i class="fas fa-palette"></i>
                                </button>
                            </div>
                            <div class="field-help">Emoji ou icône pour identifier cette catégorie</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="categoryColor" class="form-label-required">Couleur</label>
                            <div class="color-selector">
                                <input type="color" id="categoryColor" class="color-input" value="#3b82f6" required>
                                <div class="color-presets">
                                    ${this.renderColorPresets()}
                                </div>
                            </div>
                            <div class="field-help">Couleur pour les badges et indicateurs</div>
                        </div>
                        <div class="form-group">
                            <label for="categoryPriority" class="form-label">Priorité</label>
                            <select id="categoryPriority" class="form-select-compact">
                                <option value="100">Maximale (100)</option>
                                <option value="90">Très haute (90)</option>
                                <option value="75">Haute (75)</option>
                                <option value="50" selected>Normale (50)</option>
                                <option value="25">Basse (25)</option>
                                <option value="10">Très basse (10)</option>
                            </select>
                            <div class="field-help">Plus la priorité est élevée, plus la catégorie sera préférée</div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="categoryDescription" class="form-label">Description</label>
                        <textarea id="categoryDescription" class="form-textarea-compact" 
                                  placeholder="Description de cette catégorie..." rows="3" maxlength="200"></textarea>
                        <div class="field-help">Description optionnelle pour expliquer l'usage de cette catégorie</div>
                    </div>
                </div>

                <div class="form-section">
                    <h4><i class="fas fa-key"></i> Mots-clés de détection</h4>
                    <p class="section-help">Configurez les mots-clés qui permettront de détecter automatiquement cette catégorie dans les emails.</p>
                    
                    <div class="keywords-form-section">
                        <div class="keyword-type-section">
                            <label class="keyword-type-label">
                                <i class="fas fa-star"></i>
                                Mots-clés absolus (100 points)
                            </label>
                            <textarea id="keywordsAbsolute" class="keywords-textarea" 
                                      placeholder="Entrez un mot-clé par ligne. Ex:&#10;facture&#10;invoice&#10;paiement requis" 
                                      rows="4"></textarea>
                            <div class="keyword-help">Mots-clés qui garantissent la classification dans cette catégorie</div>
                        </div>
                        
                        <div class="keyword-type-section">
                            <label class="keyword-type-label">
                                <i class="fas fa-bolt"></i>
                                Mots-clés forts (30 points)
                            </label>
                            <textarea id="keywordsStrong" class="keywords-textarea" 
                                      placeholder="Entrez un mot-clé par ligne. Ex:&#10;urgent&#10;important&#10;priorité" 
                                      rows="3"></textarea>
                            <div class="keyword-help">Mots-clés importants mais pas absolus</div>
                        </div>
                        
                        <div class="keyword-type-section">
                            <label class="keyword-type-label">
                                <i class="fas fa-feather"></i>
                                Mots-clés faibles (10 points)
                            </label>
                            <textarea id="keywordsWeak" class="keywords-textarea" 
                                      placeholder="Entrez un mot-clé par ligne. Ex:&#10;merci&#10;cordialement&#10;information" 
                                      rows="3"></textarea>
                            <div class="keyword-help">Mots-clés qui renforcent légèrement la détection</div>
                        </div>
                        
                        <div class="keyword-type-section">
                            <label class="keyword-type-label">
                                <i class="fas fa-ban"></i>
                                Exclusions
                            </label>
                            <textarea id="keywordsExclusions" class="keywords-textarea" 
                                      placeholder="Entrez un mot-clé par ligne. Ex:&#10;newsletter&#10;publicité&#10;spam" 
                                      rows="3"></textarea>
                            <div class="keyword-help">Mots-clés qui empêchent la classification dans cette catégorie</div>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h4><i class="fas fa-eye"></i> Aperçu en temps réel</h4>
                    <div class="category-preview" id="categoryPreview">
                        ${this.renderCategoryPreview()}
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-compact btn-secondary" onclick="window.categoriesPage.closeModal()">
                    Annuler
                </button>
                <button class="btn-compact btn-primary" onclick="window.categoriesPage.saveCategoryForm()">
                    <i class="fas fa-save"></i>
                    ${isEdit ? 'Modifier' : 'Créer'} la catégorie
                </button>
            </div>
        `;
    }

    renderColorPresets() {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
        ];
        
        return colors.map(color => 
            `<button type="button" class="color-preset" style="background: ${color}" 
                     onclick="document.getElementById('categoryColor').value='${color}'; window.categoriesPage.updateCategoryPreview()"></button>`
        ).join('');
    }

    renderCategoryPreview() {
        return `
            <div class="preview-card">
                <div class="preview-icon" id="previewIcon">📁</div>
                <div class="preview-content">
                    <div class="preview-name" id="previewName">Nouvelle catégorie</div>
                    <div class="preview-description" id="previewDescription">Description de la catégorie</div>
                </div>
                <div class="preview-priority" id="previewPriority">Priorité: 50</div>
            </div>
        `;
    }

    // ================================================
    // GESTION DU FORMULAIRE DE CATÉGORIE
    // ================================================
    initializeCategoryForm() {
        // Événements pour mise à jour en temps réel
        const fieldsToWatch = ['categoryName', 'categoryIcon', 'categoryColor', 'categoryDescription', 'categoryPriority'];
        
        fieldsToWatch.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.updateCategoryPreview());
                field.addEventListener('change', () => this.updateCategoryPreview());
            }
        });
        
        // Validation en temps réel
        const nameField = document.getElementById('categoryName');
        if (nameField) {
            nameField.addEventListener('input', () => this.validateCategoryForm());
        }
        
        // Mise à jour initiale de l'aperçu
        this.updateCategoryPreview();
    }

    populateCategoryForm(category) {
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryIcon').value = category.icon || '';
        document.getElementById('categoryColor').value = category.color || '#3b82f6';
        document.getElementById('categoryPriority').value = category.priority || 50;
        document.getElementById('categoryDescription').value = category.description || '';
        
        // Peupler les mots-clés si disponibles
        const keywords = window.categoryManager?.weightedKeywords?.[category.id];
        if (keywords) {
            document.getElementById('keywordsAbsolute').value = (keywords.absolute || []).join('\n');
            document.getElementById('keywordsStrong').value = (keywords.strong || []).join('\n');
            document.getElementById('keywordsWeak').value = (keywords.weak || []).join('\n');
            document.getElementById('keywordsExclusions').value = (keywords.exclusions || []).join('\n');
        }
        
        this.updateCategoryPreview();
    }

    updateCategoryPreview() {
        const name = document.getElementById('categoryName')?.value || 'Nouvelle catégorie';
        const icon = document.getElementById('categoryIcon')?.value || '📁';
        const color = document.getElementById('categoryColor')?.value || '#3b82f6';
        const description = document.getElementById('categoryDescription')?.value || 'Description de la catégorie';
        const priority = document.getElementById('categoryPriority')?.value || 50;
        
        // Mettre à jour l'aperçu de l'icône dans le sélecteur
        const iconPreview = document.getElementById('iconPreview');
        if (iconPreview) {
            iconPreview.textContent = icon;
        }
        
        // Mettre à jour l'aperçu complet
        const previewIcon = document.getElementById('previewIcon');
        const previewName = document.getElementById('previewName');
        const previewDescription = document.getElementById('previewDescription');
        const previewPriority = document.getElementById('previewPriority');
        const previewCard = document.querySelector('.preview-card');
        
        if (previewIcon) previewIcon.textContent = icon;
        if (previewName) previewName.textContent = name;
        if (previewDescription) previewDescription.textContent = description;
        if (previewPriority) previewPriority.textContent = `Priorité: ${priority}`;
        if (previewCard) {
            previewCard.style.borderColor = color;
            previewIcon.style.background = `${color}20`;
            previewIcon.style.color = color;
        }
    }

    validateCategoryForm() {
        const name = document.getElementById('categoryName')?.value.trim();
        const icon = document.getElementById('categoryIcon')?.value.trim();
        const color = document.getElementById('categoryColor')?.value;
        
        const isValid = name && name.length >= 2 && icon && icon.length >= 1 && color;
        
        // Vérifier que le nom n'est pas déjà utilisé
        if (name && this.categoryFormMode === 'create') {
            const categories = window.categoryManager?.getCategories() || {};
            const nameExists = Object.values(categories).some(cat => 
                cat.name.toLowerCase() === name.toLowerCase()
            );
            
            if (nameExists) {
                this.showFieldError('categoryName', 'Ce nom de catégorie existe déjà');
                return false;
            }
        }
        
        return isValid;
    }

    saveCategoryForm() {
        if (!this.validateCategoryForm()) {
            this.showToast('Veuillez corriger les erreurs du formulaire', 'error');
            return;
        }
        
        const formData = this.getCategoryFormData();
        
        try {
            if (this.categoryFormMode === 'create') {
                this.createNewCategory(formData);
            } else {
                this.editCustomCategory(this.editingCategory.id, formData);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde catégorie:', error);
            this.showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    getCategoryFormData() {
        // Récupérer les données du formulaire
        const name = document.getElementById('categoryName').value.trim();
        const icon = document.getElementById('categoryIcon').value.trim();
        const color = document.getElementById('categoryColor').value;
        const priority = parseInt(document.getElementById('categoryPriority').value);
        const description = document.getElementById('categoryDescription').value.trim();
        
        // Récupérer les mots-clés
        const keywordsAbsolute = this.parseKeywords(document.getElementById('keywordsAbsolute').value);
        const keywordsStrong = this.parseKeywords(document.getElementById('keywordsStrong').value);
        const keywordsWeak = this.parseKeywords(document.getElementById('keywordsWeak').value);
        const keywordsExclusions = this.parseKeywords(document.getElementById('keywordsExclusions').value);
        
        return {
            name,
            icon,
            color,
            priority,
            description,
            keywords: {
                absolute: keywordsAbsolute,
                strong: keywordsStrong,
                weak: keywordsWeak,
                exclusions: keywordsExclusions
            }
        };
    }

    parseKeywords(text) {
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }

    // ================================================
    // ACTIONS CRUD
    // ================================================
    createNewCategory(formData) {
        if (!window.categoryManager) {
            this.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        try {
            const categoryData = {
                ...formData,
                isCustom: true,
                createdAt: new Date().toISOString()
            };
            
            const newCategory = window.categoryManager.createCustomCategory(categoryData);
            
            if (newCategory) {
                this.showToast(`Catégorie "${formData.name}" créée avec succès`, 'success');
                this.closeModal();
                this.refreshCurrentTab();
                this.forceSynchronization();
            } else {
                throw new Error('Échec de création de la catégorie');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur création catégorie:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    editCustomCategory(categoryId, formData) {
        if (!window.categoryManager) {
            this.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        try {
            const success = window.categoryManager.updateCustomCategory(categoryId, {
                ...formData,
                updatedAt: new Date().toISOString()
            });
            
            if (success) {
                this.showToast(`Catégorie "${formData.name}" modifiée avec succès`, 'success');
                this.closeModal();
                this.refreshCurrentTab();
                this.forceSynchronization();
            } else {
                throw new Error('Échec de modification de la catégorie');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur modification catégorie:', error);
            this.showToast('Erreur lors de la modification', 'error');
        }
    }

    confirmDeleteCategory(categoryId) {
        const input = document.getElementById('deleteConfirmInput');
        if (!input || input.value !== 'SUPPRIMER') {
            this.showToast('Veuillez taper "SUPPRIMER" pour confirmer', 'warning');
            return;
        }
        
        if (!window.categoryManager) {
            this.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        try {
            const category = window.categoryManager.getCategory(categoryId);
            const success = window.categoryManager.deleteCustomCategory(categoryId);
            
            if (success) {
                this.showToast(`Catégorie "${category.name}" supprimée avec succès`, 'success');
                this.closeModal();
                this.refreshCurrentTab();
                this.forceSynchronization();
            } else {
                throw new Error('Échec de suppression de la catégorie');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur suppression catégorie:', error);
            this.showToast('Erreur lors de la suppression', 'error');
        }
    }

    // ================================================
    // ACTIONS AVANCÉES
    // ================================================
    exportCategories() {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = Object.entries(categories)
                .filter(([id, cat]) => cat.isCustom)
                .reduce((acc, [id, cat]) => {
                    acc[id] = cat;
                    return acc;
                }, {});
            
            const exportData = {
                categories: customCategories,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `categories-custom-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showToast(`${Object.keys(customCategories).length} catégories exportées`, 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur export catégories:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }

    importCategories() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (!importData.categories) {
                        throw new Error('Format de fichier invalide');
                    }
                    
                    let imported = 0;
                    Object.entries(importData.categories).forEach(([id, categoryData]) => {
                        try {
                            if (window.categoryManager?.createCustomCategory(categoryData)) {
                                imported++;
                            }
                        } catch (error) {
                            console.warn('Échec import catégorie:', categoryData.name, error);
                        }
                    });
                    
                    if (imported > 0) {
                        this.showToast(`${imported} catégorie(s) importée(s) avec succès`, 'success');
                        this.refreshCurrentTab();
                        this.forceSynchronization();
                    } else {
                        this.showToast('Aucune catégorie n\'a pu être importée', 'warning');
                    }
                } catch (error) {
                    console.error('[CategoriesPage] Erreur import catégories:', error);
                    this.showToast('Erreur lors de l\'import : ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    resetCategories() {
        const confirmReset = confirm('Êtes-vous sûr de vouloir supprimer TOUTES les catégories personnalisées ? Cette action est irréversible.');
        
        if (!confirmReset) return;
        
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = Object.entries(categories).filter(([id, cat]) => cat.isCustom);
            
            let deleted = 0;
            customCategories.forEach(([id, cat]) => {
                if (window.categoryManager?.deleteCustomCategory(id)) {
                    deleted++;
                }
            });
            
            this.showToast(`${deleted} catégorie(s) personnalisée(s) supprimée(s)`, 'success');
            this.refreshCurrentTab();
            this.forceSynchronization();
        } catch (error) {
            console.error('[CategoriesPage] Erreur reset catégories:', error);
            this.showToast('Erreur lors de la réinitialisation', 'error');
        }
    }

    testAllCategories() {
        console.log('[CategoriesPage] === TEST TOUTES LES CATÉGORIES ===');
        
        const categories = window.categoryManager?.getCategories() || {};
        const testResults = [];
        
        Object.entries(categories).forEach(([id, category]) => {
            const testResult = {
                id,
                name: category.name,
                isCustom: category.isCustom || false,
                hasKeywords: !!(window.categoryManager?.weightedKeywords?.[id]),
                priority: category.priority || 50,
                color: category.color,
                icon: category.icon
            };
            
            testResults.push(testResult);
        });
        
        console.table(testResults);
        this.showToast(`Test terminé pour ${testResults.length} catégories - voir console`, 'info');
        
        return testResults;
    }

    // ================================================
    // UTILITAIRES POUR FORMULAIRES
    // ================================================
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Supprimer l'ancien message d'erreur
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Ajouter le nouveau message d'erreur
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        field.classList.add('error');
        
        // Supprimer l'erreur après 5 secondes
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
            field.classList.remove('error');
        }, 5000);
    }

    generateCategoryId() {
        return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    showIconPicker() {
        const commonIcons = [
            '📁', '📂', '📋', '📊', '📈', '📉', '📌', '📍', '📎', '📏',
            '🔍', '🔧', '🔨', '🔩', '🔪', '🔫', '🔬', '🔭', '🔮', '🔯',
            '💼', '💰', '💳', '💴', '💵', '💶', '💷', '💸', '💹', '💺',
            '⚡', '⚙️', '⚠️', '⚡', '⭐', '✅', '❌', '❗', '❓', '❔',
            '🎯', '🎨', '🎪', '🎫', '🎬', '🎭', '🎮', '🎯', '🎲', '🎳'
        ];
        
        const iconGrid = commonIcons.map(icon => 
            `<button type="button" class="icon-option" onclick="window.categoriesPage.selectIcon('${icon}')">${icon}</button>`
        ).join('');
        
        this.showModal('Choisir une icône', `
            <div class="icon-picker-grid">
                ${iconGrid}
            </div>
            <div style="margin-top: 16px; text-align: center;">
                <input type="text" placeholder="Ou tapez votre propre emoji..." id="customIconInput" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <button type="button" onclick="window.categoriesPage.selectIcon(document.getElementById('customIconInput').value)" style="margin-left: 8px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Utiliser</button>
            </div>
        `, 'medium');
    }

    selectIcon(icon) {
        if (!icon || icon.trim() === '') return;
        
        const iconField = document.getElementById('categoryIcon');
        if (iconField) {
            iconField.value = icon.trim();
            this.updateCategoryPreview();
        }
        
        this.closeModal();
    }

    // ================================================
    // MODAL UTILITIES AMÉLIORÉES
    // ================================================
    showModal(title, content, size = 'medium') {
        // Fermer les modales existantes
        this.closeModal();
        
        const sizeClass = {
            small: 'modal-small',
            medium: 'modal-medium', 
            large: 'modal-large',
            xlarge: 'modal-xlarge'
        }[size] || 'modal-medium';
        
        const modalHtml = `
            <div class="modal-overlay" id="currentModal">
                <div class="modal-container ${sizeClass}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close-btn" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée
        setTimeout(() => {
            const modal = document.getElementById('currentModal');
            if (modal) {
                modal.classList.add('visible');
            }
        }, 10);
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.remove('visible');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        });
        document.body.style.overflow = 'auto';
        
        // Reset form state
        this.editingCategory = null;
        this.categoryFormMode = 'create';
    }

    // ================================================
    // MÉTHODES MANQUANTES DE LA VERSION ORIGINALE
    // ================================================

    loadSettings() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            const settings = window.categoryManager.getSettings();
            console.log('[CategoriesPage] 📊 Settings chargés depuis CategoryManager:', settings);
            return settings;
        }
        
        // Fallback si CategoryManager n'est pas disponible
        try {
            const saved = localStorage.getItem('categorySettings');
            const settings = saved ? JSON.parse(saved) : this.getDefaultSettings();
            console.log('[CategoriesPage] 📊 Settings chargés depuis localStorage:', settings);
            return settings;
        } catch (error) {
            console.error('[CategoriesPage] Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(newSettings) {
        console.log('[CategoriesPage] 💾 === DÉBUT SAUVEGARDE SETTINGS ===');
        console.log('[CategoriesPage] 📥 Nouveaux settings à sauvegarder:', newSettings);
        
        if (window.categoryManager && typeof window.categoryManager.updateSettings === 'function') {
            console.log('[CategoriesPage] 🎯 Sauvegarde via CategoryManager');
            window.categoryManager.updateSettings(newSettings);
        } else {
            console.log('[CategoriesPage] 🔄 Fallback sauvegarde localStorage');
            // Fallback
            try {
                localStorage.setItem('categorySettings', JSON.stringify(newSettings));
                
                // Dispatch manual event si CategoryManager n'est pas disponible
                setTimeout(() => {
                    this.dispatchEvent('categorySettingsChanged', { settings: newSettings });
                }, 10);
            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde paramètres:', error);
            }
        }
        
        // NOUVEAU: Forcer la synchronisation après sauvegarde
        setTimeout(() => {
            this.forceSynchronization();
        }, 50);
        
        console.log('[CategoriesPage] ✅ === FIN SAUVEGARDE SETTINGS ===');
    }

    // ================================================
    // SYNCHRONISATION FORCÉE - NOUVELLE MÉTHODE
    // ================================================
    forceSynchronization() {
        if (this.syncInProgress) {
            console.log('[CategoriesPage] 🔄 Synchronisation déjà en cours, ajout à la queue');
            this.pendingSync = true;
            return;
        }
        
        this.syncInProgress = true;
        console.log('[CategoriesPage] 🚀 === DÉBUT SYNCHRONISATION FORCÉE ===');
        
        try {
            // 1. Charger les paramètres actuels
            const currentSettings = this.loadSettings();
            console.log('[CategoriesPage] 📊 Settings actuels:', currentSettings);
            
            // 2. Forcer la synchronisation de tous les modules
            this.syncAllModules(currentSettings);
            
            // 3. Dispatcher l'événement de synchronisation globale
            setTimeout(() => {
                this.dispatchEvent('forceSynchronization', {
                    settings: currentSettings,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                });
            }, 10);
            
            console.log('[CategoriesPage] ✅ Synchronisation forcée terminée');
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur synchronisation forcée:', error);
        } finally {
            this.syncInProgress = false;
            
            // Traiter la synchronisation en attente
            if (this.pendingSync) {
                this.pendingSync = false;
                setTimeout(() => {
                    this.forceSynchronization();
                }, 100);
            }
        }
    }

    syncAllModules(settings) {
        console.log('[CategoriesPage] 🔄 Synchronisation de tous les modules...');
        
        // Synchroniser EmailScanner
        if (window.emailScanner) {
            console.log('[CategoriesPage] 📧 Synchronisation EmailScanner');
            
            if (typeof window.emailScanner.updateSettings === 'function') {
                window.emailScanner.updateSettings(settings);
            }
            
            if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                window.emailScanner.updateTaskPreselectedCategories(settings.taskPreselectedCategories || []);
            }
            
            if (typeof window.emailScanner.forceSettingsReload === 'function') {
                window.emailScanner.forceSettingsReload();
            }
        }
        
        // Synchroniser AITaskAnalyzer
        if (window.aiTaskAnalyzer) {
            console.log('[CategoriesPage] 🤖 Synchronisation AITaskAnalyzer');
            
            if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                window.aiTaskAnalyzer.updatePreselectedCategories(settings.taskPreselectedCategories || []);
            }
            
            if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                window.aiTaskAnalyzer.updateAutomationSettings(settings.automationSettings || {});
            }
        }
        
        // Synchroniser PageManager
        if (window.pageManager) {
            console.log('[CategoriesPage] 📄 Notification PageManager');
            
            // Le PageManager sera notifié via l'événement forceSynchronization
            // Pas besoin d'appel direct pour éviter les boucles
        }
        
        console.log('[CategoriesPage] ✅ Synchronisation modules terminée');
    }

    // ================================================
    // NOTIFICATION DES CHANGEMENTS - OPTIMISÉE
    // ================================================
    notifySettingsChange(settingType, value) {
        const now = Date.now();
        
        // Éviter les notifications en boucle (max 1 par seconde par type)
        const notificationKey = `${settingType}_${JSON.stringify(value)}`;
        if (this.lastNotification === notificationKey && (now - this.lastNotificationTime) < 1000) {
            console.log(`[CategoriesPage] 🔄 Notification ignorée (trop récente): ${settingType}`);
            return;
        }
        
        this.lastNotification = notificationKey;
        this.lastNotificationTime = now;
        
        console.log(`[CategoriesPage] 📢 === NOTIFICATION CHANGEMENT ===`);
        console.log(`[CategoriesPage] 🎯 Type: ${settingType}`);
        console.log(`[CategoriesPage] 📊 Valeur:`, value);
        
        // Dispatching d'événement global avec délai pour éviter les conflits
        setTimeout(() => {
            this.dispatchEvent('settingsChanged', {
                type: settingType, 
                value: value,
                source: 'CategoriesPage',
                timestamp: now
            });
        }, 10);
        
        // NOUVEAU: Notifications spécialisées pour les modules avec vérification
        this.notifySpecificModules(settingType, value);
        
        // NOUVEAU: Forcer la synchronisation après notification
        setTimeout(() => {
            this.forceSynchronization();
        }, 100);
    }

    notifySpecificModules(settingType, value) {
        console.log(`[CategoriesPage] 🎯 Notification spécialisée pour: ${settingType}`);
        
        // EmailScanner
        if (window.emailScanner) {
            switch (settingType) {
                case 'taskPreselectedCategories':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - catégories pré-sélectionnées');
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    break;
                case 'scanSettings':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - scan settings');
                    if (typeof window.emailScanner.applyScanSettings === 'function') {
                        window.emailScanner.applyScanSettings(value);
                    }
                    break;
                case 'preferences':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - préférences');
                    if (typeof window.emailScanner.updatePreferences === 'function') {
                        window.emailScanner.updatePreferences(value);
                    }
                    break;
            }
        }
        
        // AITaskAnalyzer
        if (window.aiTaskAnalyzer) {
            if (settingType === 'taskPreselectedCategories') {
                console.log('[CategoriesPage] 🤖 Mise à jour AITaskAnalyzer - catégories pré-sélectionnées');
                if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
            }
            
            if (settingType === 'automationSettings') {
                console.log('[CategoriesPage] 🤖 Mise à jour AITaskAnalyzer - automation settings');
                if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                    window.aiTaskAnalyzer.updateAutomationSettings(value);
                }
            }
        }
        
        // PageManager - synchronisation forcée pour les emails
        if (window.pageManager && settingType === 'taskPreselectedCategories') {
            console.log('[CategoriesPage] 📄 Notification PageManager - mise à jour emails');
            setTimeout(() => {
                if (window.pageManager.currentPage === 'emails') {
                    window.pageManager.refreshEmailsView?.();
                }
            }, 200);
        }
        
        console.log('[CategoriesPage] ✅ Notifications spécialisées envoyées');
    }

    // ================================================
    // MISE À JOUR DES CATÉGORIES PRÉ-SÉLECTIONNÉES - ULTRA RENFORCÉE
    // ================================================
    updateTaskPreselectedCategories() {
        try {
            console.log('[CategoriesPage] 🎯 === DÉBUT updateTaskPreselectedCategories ===');
            
            const settings = this.loadSettings();
            const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
            
            console.log(`[CategoriesPage] 🔍 Trouvé ${checkboxes.length} checkboxes avec classe .category-preselect-checkbox`);
            
            const selectedCategories = [];
            const selectionDetails = [];
            
            checkboxes.forEach((checkbox, index) => {
                const details = {
                    index: index,
                    value: checkbox.value,
                    checked: checkbox.checked,
                    name: checkbox.dataset.categoryName,
                    element: checkbox
                };
                
                selectionDetails.push(details);
                
                console.log(`[CategoriesPage] 📋 Checkbox ${index}:`);
                console.log(`  - Value: "${checkbox.value}"`);
                console.log(`  - Checked: ${checkbox.checked}`);
                console.log(`  - Data name: "${checkbox.dataset.categoryName}"`);
                
                if (checkbox.checked && checkbox.value) {
                    selectedCategories.push(checkbox.value);
                    console.log(`  - ✅ AJOUTÉ à la sélection: ${checkbox.value}`);
                } else {
                    console.log(`  - ❌ PAS sélectionné`);
                }
            });
            
            console.log('[CategoriesPage] 🎯 Nouvelles catégories sélectionnées:', selectedCategories);
            console.log('[CategoriesPage] 📊 Anciennes catégories:', settings.taskPreselectedCategories);
            
            // Vérifier si il y a vraiment un changement
            const oldCategories = settings.taskPreselectedCategories || [];
            const hasChanged = JSON.stringify([...selectedCategories].sort()) !== JSON.stringify([...oldCategories].sort());
            
            if (!hasChanged) {
                console.log('[CategoriesPage] 🔄 Aucun changement détecté, skip mise à jour');
                return;
            }
            
            console.log('[CategoriesPage] 📝 Changement détecté, mise à jour en cours...');
            
            // Mettre à jour les settings
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            
            console.log('[CategoriesPage] 💾 Paramètres sauvegardés avec nouvelles catégories');
            
            // NOUVEAU: Notification immédiate et forcée
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            
            // NOUVEAU: Mise à jour immédiate de l'interface
            this.updateSelectionIndicators(selectedCategories);
            
            // NOUVEAU: Toast avec détails
            const categoryNames = selectedCategories.map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? category.name : catId;
            });
            
            this.showToast(`✅ ${selectedCategories.length} catégorie(s) pré-sélectionnée(s): ${categoryNames.join(', ')}`, 'success', 4000);
            this.updateAutomationStats();
            
            console.log('[CategoriesPage] 🎯 === FIN updateTaskPreselectedCategories ===');
            
            // NOUVEAU: Vérification de synchronisation après 1 seconde
            setTimeout(() => {
                this.verifySynchronization(selectedCategories);
            }, 1000);
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur updateTaskPreselectedCategories:', error);
            this.showToast('Erreur de mise à jour des catégories', 'error');
        }
    }

    // ================================================
    // VÉRIFICATION DE SYNCHRONISATION - NOUVELLE
    // ================================================
    verifySynchronization(expectedCategories) {
        console.log('[CategoriesPage] 🔍 Vérification de synchronisation...');
        
        try {
            // Vérifier EmailScanner
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            const emailScannerSync = JSON.stringify([...emailScannerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            // Vérifier CategoryManager
            const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
            const categoryManagerSync = JSON.stringify([...categoryManagerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            console.log('[CategoriesPage] 📊 État de synchronisation:');
            console.log('  - Attendu:', expectedCategories);
            console.log('  - EmailScanner:', emailScannerCategories, emailScannerSync ? '✅' : '❌');
            console.log('  - CategoryManager:', categoryManagerCategories, categoryManagerSync ? '✅' : '❌');
            
            if (!emailScannerSync || !categoryManagerSync) {
                console.log('[CategoriesPage] ⚠️ Désynchronisation détectée, re-synchronisation...');
                this.forceSynchronization();
                
                // Montrer un indicateur visuel
                this.showSyncStatus(false);
                
                // Re-vérifier après 2 secondes
                setTimeout(() => {
                    this.verifySynchronization(expectedCategories);
                }, 2000);
            } else {
                console.log('[CategoriesPage] ✅ Synchronisation confirmée');
                this.showSyncStatus(true);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur vérification synchronisation:', error);
        }
    }

    // ================================================
    // INDICATEURS VISUELS DE SYNCHRONISATION - NOUVEAUX
    // ================================================
    updateSelectionIndicators(selectedCategories) {
        // Mettre à jour les badges "Sélectionné" en temps réel
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        
        checkboxes.forEach(checkbox => {
            const container = checkbox.closest('.category-checkbox-item-enhanced');
            const existingIndicator = container?.querySelector('.selected-indicator');
            
            if (checkbox.checked && selectedCategories.includes(checkbox.value)) {
                if (!existingIndicator) {
                    const indicator = document.createElement('span');
                    indicator.className = 'selected-indicator';
                    indicator.textContent = '✓ Sélectionné';
                    
                    const content = container.querySelector('.category-checkbox-content-enhanced');
                    if (content) {
                        content.appendChild(indicator);
                    }
                }
            } else {
                if (existingIndicator) {
                    existingIndicator.remove();
                }
            }
        });
        
        console.log('[CategoriesPage] ✅ Indicateurs de sélection mis à jour');
    }

    showSyncStatus(isSync) {
        // Créer ou mettre à jour l'indicateur de synchronisation
        let indicator = document.getElementById('sync-status-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'sync-status-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                z-index: 10000;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(indicator);
        }
        
        if (isSync) {
            indicator.style.background = '#d1fae5';
            indicator.style.color = '#065f46';
            indicator.style.border = '1px solid #10b981';
            indicator.innerHTML = '<i class="fas fa-check-circle"></i> Synchronisé';
            
            // Masquer après 3 secondes
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
            }, 3000);
        } else {
            indicator.style.background = '#fef3c7';
            indicator.style.color = '#92400e';
            indicator.style.border = '1px solid #f59e0b';
            indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i> Synchronisation...';
        }
    }

    // ================================================
    // MÉTHODES DE SAUVEGARDE - AVEC SYNCHRONISATION FORCÉE
    // ================================================
    savePreferences() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE PRÉFÉRENCES ===');
            
            const settings = this.loadSettings();
            
            const preferences = {
                darkMode: document.getElementById('darkMode')?.checked || false,
                compactView: document.getElementById('compactView')?.checked || false,
                showNotifications: document.getElementById('showNotifications')?.checked !== false,
                excludeSpam: document.getElementById('excludeSpam')?.checked !== false,
                detectCC: document.getElementById('detectCC')?.checked !== false
            };
            
            console.log('[CategoriesPage] 📊 Nouvelles préférences:', preferences);
            
            settings.preferences = preferences;
            this.saveSettings(settings);
            
            this.notifySettingsChange('preferences', preferences);
            this.showToast('Préférences sauvegardées', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur savePreferences:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveScanSettings() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE SCAN SETTINGS ===');
            
            const settings = this.loadSettings();
            
            const scanSettings = {
                defaultPeriod: parseInt(document.getElementById('defaultScanPeriod')?.value || 7),
                defaultFolder: document.getElementById('defaultFolder')?.value || 'inbox',
                autoAnalyze: document.getElementById('autoAnalyze')?.checked !== false,
                autoCategrize: document.getElementById('autoCategrize')?.checked !== false
            };
            
            console.log('[CategoriesPage] 📊 Nouveaux scan settings:', scanSettings);
            
            settings.scanSettings = scanSettings;
            this.saveSettings(settings);
            
            this.notifySettingsChange('scanSettings', scanSettings);
            this.showToast('Paramètres de scan sauvegardés', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveScanSettings:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveAutomationSettings() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE AUTOMATION SETTINGS ===');
            
            const settings = this.loadSettings();
            
            const automationSettings = {
                autoCreateTasks: document.getElementById('autoCreateTasks')?.checked || false,
                groupTasksByDomain: document.getElementById('groupTasksByDomain')?.checked || false,
                skipDuplicates: document.getElementById('skipDuplicates')?.checked !== false,
                autoAssignPriority: document.getElementById('autoAssignPriority')?.checked || false
            };
            
            console.log('[CategoriesPage] 📊 Nouveaux automation settings:', automationSettings);
            
            settings.automationSettings = automationSettings;
            this.saveSettings(settings);
            
            this.notifySettingsChange('automationSettings', automationSettings);
            this.showToast('Paramètres d\'automatisation sauvegardés', 'success');
            this.updateAutomationStats();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveAutomationSettings:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    // ================================================
    // MÉTHODES PUBLIQUES POUR INTÉGRATION
    // ================================================
    getScanSettings() {
        return this.loadSettings().scanSettings || this.getDefaultSettings().scanSettings;
    }
    
    getAutomationSettings() {
        return this.loadSettings().automationSettings || this.getDefaultSettings().automationSettings;
    }
    
    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        const categories = settings.taskPreselectedCategories || [];
        console.log('[CategoriesPage] 📊 getTaskPreselectedCategories appelé:', categories);
        return categories;
    }
    
    shouldExcludeSpam() {
        return this.loadSettings().preferences?.excludeSpam !== false;
    }
    
    shouldDetectCC() {
        return this.loadSettings().preferences?.detectCC !== false;
    }

    switchTab(tab) {
        try {
            console.log(`[CategoriesPage] 🔄 Changement onglet vers: ${tab}`);
            
            this.currentTab = tab;
            const tabContent = document.getElementById('tabContent');
            
            if (!tabContent) {
                console.error('[CategoriesPage] Element tabContent non trouvé');
                return;
            }

            const moduleStatus = this.checkModuleAvailability();
            const settings = this.loadSettings();
            
            // Mettre à jour les boutons d'onglet
            document.querySelectorAll('.tab-button-compact').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeButton = document.querySelector(`.tab-button-compact[onclick*="${tab}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            // Mettre à jour le contenu
            tabContent.innerHTML = this.renderTabContent(settings, moduleStatus);
            
            setTimeout(() => {
                this.initializeEventListeners();
                
                // Si on va sur l'onglet automatisation, vérifier immédiatement la synchronisation
                if (tab === 'automation') {
                    setTimeout(() => {
                        const currentCategories = settings.taskPreselectedCategories || [];
                        this.verifySynchronization(currentCategories);
                    }, 200);
                }
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur changement onglet:', error);
        }
    }

    refreshCurrentTab() {
        try {
            const tabContent = document.getElementById('tabContent');
            const settings = this.loadSettings();
            const moduleStatus = this.checkModuleAvailability();
            
            if (tabContent) {
                tabContent.innerHTML = this.renderTabContent(settings, moduleStatus);
                
                // Réinitialiser les event listeners
                this.eventListenersSetup = false;
                setTimeout(() => {
                    this.initializeEventListeners();
                }, 100);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur refreshCurrentTab:', error);
        }
    }

    updateAutomationStats() {
        try {
            const settings = this.loadSettings();
            const statCategories = document.getElementById('stat-categories');
            const statExclusions = document.getElementById('stat-exclusions');
            const statAutomation = document.getElementById('stat-automation');
            const statSync = document.getElementById('stat-sync');
            
            if (statCategories) {
                statCategories.textContent = settings.taskPreselectedCategories?.length || 0;
            }
            if (statExclusions) {
                statExclusions.textContent = (settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0);
            }
            if (statAutomation) {
                statAutomation.textContent = Object.values(settings.automationSettings || {}).filter(Boolean).length;
            }
            if (statSync) {
                const syncStatus = this.checkSyncStatus(settings);
                statSync.textContent = syncStatus.isSync ? '✅' : '⚠️';
            }
            
            // Mettre à jour l'indicateur de synchronisation
            const syncIndicator = document.getElementById('automation-sync-indicator');
            if (syncIndicator) {
                syncIndicator.innerHTML = this.renderAutomationSyncIndicator(settings.taskPreselectedCategories || []);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateAutomationStats:', error);
        }
    }

    checkSyncStatus(settings) {
        try {
            const expectedCategories = settings.taskPreselectedCategories || [];
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
            
            const emailScannerSync = JSON.stringify([...emailScannerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            const categoryManagerSync = JSON.stringify([...categoryManagerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            return {
                isSync: emailScannerSync && categoryManagerSync,
                emailScannerSync,
                categoryManagerSync,
                expectedCategories,
                emailScannerCategories,
                categoryManagerCategories
            };
        } catch (error) {
            console.error('[CategoriesPage] Erreur check sync status:', error);
            return {
                isSync: false,
                emailScannerSync: false,
                categoryManagerSync: false,
                expectedCategories: [],
                emailScannerCategories: [],
                categoryManagerCategories: []
            };
        }
    }

    checkModuleAvailability() {
        return {
            categoryManager: !!window.categoryManager,
            emailScanner: !!window.emailScanner,
            aiTaskAnalyzer: !!window.aiTaskAnalyzer,
            mailService: !!window.mailService,
            uiManager: !!window.uiManager
        };
    }

    // ================================================
    // DEBUG
    // ================================================
    debugSettings() {
        const settings = this.loadSettings();
        const moduleStatus = this.checkModuleAvailability();
        const syncStatus = this.checkSyncStatus(settings);
        
        console.log('\n=== DEBUG SETTINGS COMPLET ===');
        console.log('Settings complets:', settings);
        console.log('Status des modules:', moduleStatus);
        console.log('Status synchronisation:', syncStatus);
        console.log('CategoryManager settings:', window.categoryManager?.getSettings());
        console.log('EmailScanner settings:', window.emailScanner?.settings);
        console.log('EmailScanner taskPreselectedCategories:', window.emailScanner?.getTaskPreselectedCategories());
        console.log('Task preselected categories (CategoriesPage):', settings.taskPreselectedCategories);
        console.log('Checkboxes actuelles:');
        
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        checkboxes.forEach((cb, i) => {
            console.log(`  ${i}: value=${cb.value}, checked=${cb.checked}, name=${cb.dataset.categoryName}`);
        });
        
        console.log('État de synchronisation détaillé:');
        console.log('  - isSync:', syncStatus.isSync);
        console.log('  - emailScannerSync:', syncStatus.emailScannerSync);
        console.log('  - categoryManagerSync:', syncStatus.categoryManagerSync);
        console.log('  - expectedCategories:', syncStatus.expectedCategories);
        console.log('  - emailScannerCategories:', syncStatus.emailScannerCategories);
        console.log('  - categoryManagerCategories:', syncStatus.categoryManagerCategories);
        
        console.log('========================\n');
        
        this.showToast('Voir la console pour les détails de debug', 'info');
        return { settings, moduleStatus, syncStatus };
    }
    
    testCategorySelection() {
        console.log('\n=== TEST CATEGORY SELECTION COMPLET ===');
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        console.log(`Trouvé ${checkboxes.length} checkboxes avec classe .category-preselect-checkbox`);
        
        checkboxes.forEach((checkbox, index) => {
            console.log(`Checkbox ${index}:`);
            console.log(`  - Value: ${checkbox.value}`);
            console.log(`  - Checked: ${checkbox.checked}`);
            console.log(`  - Data name: ${checkbox.dataset.categoryName}`);
            console.log(`  - Has change handler: ${!!checkbox._changeHandler}`);
            console.log(`  - Has click handler: ${!!checkbox._clickHandler}`);
        });
        
        const categories = window.categoryManager?.getCategories() || {};
        console.log('Catégories disponibles:', Object.keys(categories));
        
        const settings = this.loadSettings();
        console.log('Catégories pré-sélectionnées dans les settings:', settings.taskPreselectedCategories);
        
        const syncStatus = this.checkSyncStatus(settings);
        console.log('État de synchronisation:', syncStatus);
        console.log('================================\n');
        
        this.showToast('Test terminé - voir console', 'info');
        return { checkboxes: checkboxes.length, categories: Object.keys(categories), syncStatus };
    }
    
    forceUpdateUI() {
        console.log('[CategoriesPage] 🔄 Force update UI avec synchronisation...');
        
        // Forcer la synchronisation avant la mise à jour
        this.forceSynchronization();
        
        this.eventListenersSetup = false; // Forcer la réinitialisation
        setTimeout(() => {
            this.refreshCurrentTab();
        }, 200);
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[CategoriesPage] Erreur dispatch ${eventName}:`, error);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        if (window.uiManager && typeof window.uiManager.showToast === 'function') {
            window.uiManager.showToast(message, type, duration);
        } else {
            // Fallback simple
            console.log(`[Toast ${type.toUpperCase()}] ${message}`);
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
            categoryExclusions: {
                domains: [],
                emails: []
            },
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            automationSettings: {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            },
            preferences: {
                darkMode: false,
                compactView: false,
                showNotifications: true,
                excludeSpam: true,
                detectCC: true
            }
        };
    }

    initializeEventListeners() {
        if (this.eventListenersSetup) {
            return; // Éviter les doublons
        }

        try {
            // Préférences générales
            const preferences = ['darkMode', 'compactView', 'showNotifications', 'excludeSpam', 'detectCC'];
            preferences.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.savePreferences);
                    element.addEventListener('change', this.savePreferences);
                }
            });

            // Paramètres de scan
            const scanSettings = ['defaultScanPeriod', 'defaultFolder', 'autoAnalyze', 'autoCategrize'];
            scanSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.saveScanSettings);
                    element.addEventListener('change', this.saveScanSettings);
                }
            });

            // Paramètres d'automatisation
            const automationSettings = ['autoCreateTasks', 'groupTasksByDomain', 'skipDuplicates', 'autoAssignPriority'];
            automationSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.saveAutomationSettings);
                    element.addEventListener('change', this.saveAutomationSettings);
                }
            });

            // ULTRA RENFORCEMENT: Catégories pré-sélectionnées pour les tâches
            const categoryCheckboxes = document.querySelectorAll('.category-preselect-checkbox');
            console.log(`[CategoriesPage] 🎯 Initialisation ULTRA RENFORCÉE de ${categoryCheckboxes.length} checkboxes`);
            
            categoryCheckboxes.forEach((checkbox, index) => {
                console.log(`[CategoriesPage] 📋 Setup checkbox ${index}: value=${checkbox.value}, checked=${checkbox.checked}, name=${checkbox.dataset.categoryName}`);
                
                // Retirer TOUS les anciens listeners
                checkbox.removeEventListener('change', this.updateTaskPreselectedCategories);
                checkbox.removeEventListener('click', this.updateTaskPreselectedCategories);
                checkbox.removeEventListener('input', this.updateTaskPreselectedCategories);
                
                // Ajouter MULTIPLES listeners pour s'assurer de capturer l'événement
                const handlerChange = (event) => {
                    console.log(`[CategoriesPage] 🔔 CHANGE détecté sur checkbox: ${event.target.value}, checked: ${event.target.checked}`);
                    this.updateTaskPreselectedCategories();
                };
                
                const handlerClick = (event) => {
                    console.log(`[CategoriesPage] 🔔 CLICK détecté sur checkbox: ${event.target.value}, checked: ${event.target.checked}`);
                    // Petit délai pour que le checked soit mis à jour
                    setTimeout(() => {
                        this.updateTaskPreselectedCategories();
                    }, 10);
                };
                
                checkbox.addEventListener('change', handlerChange);
                checkbox.addEventListener('click', handlerClick);
                
                // Stocker les handlers pour le nettoyage
                checkbox._changeHandler = handlerChange;
                checkbox._clickHandler = handlerClick;
            });

            this.eventListenersSetup = true;
            console.log('[CategoriesPage] ✅ Événements initialisés avec ULTRA RENFORCEMENT des checkboxes');
            
            // NOUVEAU: Vérifier immédiatement l'état des checkboxes
            setTimeout(() => {
                this.verifyCheckboxState();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur initialisation événements:', error);
        }
    }

    verifyCheckboxState() {
        console.log('[CategoriesPage] 🔍 Vérification état des checkboxes...');
        
        const settings = this.loadSettings();
        const expectedSelected = settings.taskPreselectedCategories || [];
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        
        let mismatches = 0;
        
        checkboxes.forEach((checkbox, index) => {
            const shouldBeChecked = expectedSelected.includes(checkbox.value);
            const isChecked = checkbox.checked;
            
            if (shouldBeChecked !== isChecked) {
                console.log(`[CategoriesPage] ⚠️ Mismatch checkbox ${index}: value=${checkbox.value}, shouldBe=${shouldBeChecked}, is=${isChecked}`);
                checkbox.checked = shouldBeChecked;
                mismatches++;
            }
        });
        
        if (mismatches > 0) {
            console.log(`[CategoriesPage] 🔧 ${mismatches} checkboxes corrigées`);
            this.updateSelectionIndicators(expectedSelected);
        } else {
            console.log('[CategoriesPage] ✅ Tous les checkboxes sont dans le bon état');
        }
    }

    exportSettings() {
        try {
            const settings = this.loadSettings();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `email-settings-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showToast('Paramètres exportés avec succès', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur export:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    this.saveSettings(settings);
                    this.showToast('Paramètres importés avec succès', 'success');
                    this.forceUpdateUI();
                } catch (error) {
                    console.error('[CategoriesPage] Erreur import:', error);
                    this.showToast('Erreur lors de l\'import', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Méthodes manquantes pour openAllKeywordsModal et autres modales
    openAllKeywordsModal() {
        const categories = window.categoryManager?.getCategories() || {};
        let modalContent = '<h3>Aperçu des catégories et mots-clés</h3>';
        
        Object.entries(categories).forEach(([id, category]) => {
            modalContent += `
                <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h4 style="margin: 0 0 5px 0; color: ${category.color};">${category.icon} ${category.name}</h4>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">${category.description || 'Catégorie système'}</p>
                </div>
            `;
        });
        
        this.showModal('Catégories disponibles', modalContent);
    }

    openKeywordsModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        this.showToast(`Mots-clés pour la catégorie "${category.name}" - gérés automatiquement`, 'info');
    }

    openExclusionsModal() {
        this.showToast('Exclusions gérées automatiquement par le système', 'info');
    }

    addQuickExclusion() {
        this.showToast('Ajout d\'exclusions bientôt disponible', 'info');
    }

    toggleCategory(categoryId) {
        this.showToast('Gestion des catégories via l\'onglet Automatisation', 'info');
    }

    hideExplanationMessage() {
        this.showToast('Message d\'explication masqué', 'info');
    }

    cleanup() {
        // Nettoyer les handlers spéciaux des checkboxes
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        checkboxes.forEach(checkbox => {
            if (checkbox._changeHandler) {
                checkbox.removeEventListener('change', checkbox._changeHandler);
            }
            if (checkbox._clickHandler) {
                checkbox.removeEventListener('click', checkbox._clickHandler);
            }
        });
        
        this.eventListenersSetup = false;
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        console.log('[CategoriesPage] Nettoyage amélioré effectué');
    }

    destroy() {
        this.cleanup();
        console.log('[CategoriesPage] Instance détruite');
    }
}

// Styles CSS supplémentaires pour la gestion des catégories
const categoryManagementStyles = `
    /* Gestion des catégories */
    .categories-management-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .categories-grid-management {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
        margin-top: 16px;
    }

    .category-card-management {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        transition: all 0.3s ease;
        position: relative;
    }

    .category-card-management:hover {
        border-color: #3b82f6;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .category-card-management.preselected {
        border-color: #8b5cf6;
        background: #fdf4ff;
    }

    .category-card-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
    }

    .category-icon-display {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
    }

    .category-info {
        flex: 1;
        min-width: 0;
    }

    .category-name {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
    }

    .category-description {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
    }

    .preselected-badge-small {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #8b5cf6;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
    }

    .category-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 12px;
    }

    .category-priority {
        color: #6b7280;
        font-weight: 500;
    }

    .custom-badge-small,
    .system-badge-small {
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
    }

    .custom-badge-small {
        background: #f59e0b;
        color: white;
    }

    .system-badge-small {
        background: #10b981;
        color: white;
    }

    .category-actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
    }

    .btn-category-action {
        width: 32px;
        height: 32px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        font-size: 14px;
    }

    .btn-category-action:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
        color: #374151;
    }

    .btn-category-action.edit:hover {
        background: #dbeafe;
        border-color: #3b82f6;
        color: #3b82f6;
    }

    .btn-category-action.delete:hover {
        background: #fee2e2;
        border-color: #ef4444;
        color: #ef4444;
    }

    .category-count-badge {
        background: #f3f4f6;
        color: #6b7280;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        margin-left: auto;
    }

    /* État vide */
    .empty-categories-state {
        text-align: center;
        padding: 40px 20px;
        background: #f8fafc;
        border-radius: 12px;
        border: 2px dashed #d1d5db;
    }

    .empty-categories-state .empty-icon {
        font-size: 48px;
        color: #d1d5db;
        margin-bottom: 16px;
    }

    .empty-categories-state h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #374151;
    }

    .empty-categories-state p {
        margin: 0 0 20px 0;
        color: #6b7280;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }

    /* Actions avancées */
    .advanced-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
    }

    .btn-advanced-action {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }

    .btn-advanced-action:hover {
        background: #f8fafc;
        border-color: #3b82f6;
        transform: translateY(-1px);
    }

    .btn-advanced-action i {
        font-size: 20px;
        color: #3b82f6;
        flex-shrink: 0;
    }

    .action-content {
        flex: 1;
    }

    .action-title {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
    }

    .action-description {
        display: block;
        font-size: 12px;
        color: #6b7280;
    }

    /* Formulaire de catégorie */
    .category-form-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .form-section {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
    }

    .form-section h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .form-section h4 i {
        color: #3b82f6;
    }

    .section-help {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #6b7280;
        line-height: 1.5;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-label-required::after {
        content: ' *';
        color: #ef4444;
    }

    .form-input-compact,
    .form-select-compact,
    .form-textarea-compact {
        padding: 10px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s ease;
    }

    .form-input-compact:focus,
    .form-select-compact:focus,
    .form-textarea-compact:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input-compact.error {
        border-color: #ef4444;
    }

    .field-help {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
    }

    .field-error {
        font-size: 12px;
        color: #ef4444;
        margin-top: 4px;
        font-weight: 500;
    }

    /* Sélecteurs spéciaux */
    .icon-selector {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .icon-input {
        flex: 1;
    }

    .icon-preview {
        width: 40px;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        background: #f8fafc;
    }

    .btn-icon-picker {
        width: 40px;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        background: white;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .btn-icon-picker:hover {
        background: #f3f4f6;
        border-color: #3b82f6;
        color: #3b82f6;
    }

    .color-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .color-input {
        width: 100%;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
    }

    .color-presets {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .color-preset {
        width: 24px;
        height: 24px;
        border: 2px solid #e5e7eb;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .color-preset:hover {
        transform: scale(1.1);
        border-color: #374151;
    }

    /* Mots-clés */
    .keywords-form-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .keyword-type-section {
        border-left: 4px solid #e5e7eb;
        padding-left: 12px;
    }

    .keyword-type-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .keywords-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        resize: vertical;
        transition: border-color 0.2s ease;
    }

    .keywords-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .keyword-help {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        font-style: italic;
    }

    /* Aperçu */
    .category-preview {
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
    }

    .preview-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
    }

    .preview-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
    }

    .preview-content {
        flex: 1;
    }

    .preview-name {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
    }

    .preview-description {
        font-size: 12px;
        color: #6b7280;
    }

    .preview-priority {
        font-size: 11px;
        color: #9ca3af;
        font-weight: 500;
    }

    /* Affichage des mots-clés */
    .keywords-display-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .category-header-display {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
    }

    .category-icon-large {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
    }

    .keywords-sections {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .keyword-section h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .keywords-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .keyword-tag {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid;
    }

    .keyword-tag.absolute {
        background: #fef3c7;
        color: #92400e;
        border-color: #f59e0b;
    }

    .keyword-tag.strong {
        background: #dbeafe;
        color: #1e40af;
        border-color: #3b82f6;
    }

    .keyword-tag.weak {
        background: #f3f4f6;
        color: #4b5563;
        border-color: #9ca3af;
    }

    .keyword-tag.exclusion {
        background: #fee2e2;
        color: #991b1b;
        border-color: #ef4444;
    }

    .no-keywords-message {
        text-align: center;
        padding: 40px 20px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px dashed #d1d5db;
    }

    .no-keywords-message i {
        font-size: 32px;
        color: #d1d5db;
        margin-bottom: 12px;
        display: block;
    }

    .keywords-actions {
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
    }

    /* Confirmation de suppression */
    .delete-confirmation-content {
        text-align: center;
        padding: 20px;
    }

    .delete-warning-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #fee2e2;
        color: #dc2626;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin: 0 auto 20px auto;
    }

    .delete-confirmation-content h4 {
        margin: 0 0 12px 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
    }

    .delete-confirmation-content > p {
        margin: 0 0 20px 0;
        color: #6b7280;
        font-size: 16px;
    }

    .delete-details {
        margin: 20px 0;
    }

    .category-preview-delete {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin: 0 auto;
        max-width: 300px;
    }

    .category-icon-preview {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
    }

    .category-name-preview {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
    }

    .category-desc-preview {
        font-size: 13px;
        color: #6b7280;
    }

    .delete-warning {
        background: #fffbeb;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 12px;
        margin: 20px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #92400e;
    }

    .delete-warning i {
        color: #f59e0b;
        flex-shrink: 0;
    }

    .confirmation-input-section {
        margin: 20px 0;
        text-align: left;
    }

    .confirmation-input-section label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
    }

    /* Sélecteur d'icônes */
    .icon-picker-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 8px;
        max-height: 300px;
        overflow-y: auto;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
    }

    .icon-option {
        width: 40px;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        background: white;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-option:hover {
        border-color: #3b82f6;
        background: #f0f9ff;
        transform: scale(1.1);
    }

    /* Modales */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .modal-overlay.visible {
        opacity: 1;
    }

    .modal-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transform: translateY(20px);
        transition: transform 0.3s ease;
    }

    .modal-overlay.visible .modal-container {
        transform: translateY(0);
    }

    .modal-small {
        width: 100%;
        max-width: 400px;
    }

    .modal-medium {
        width: 100%;
        max-width: 600px;
    }

    .modal-large {
        width: 100%;
        max-width: 900px;
    }

    .modal-xlarge {
        width: 100%;
        max-width: 1200px;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        background: #f8fafc;
    }

    .modal-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
    }

    .modal-close-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .modal-close-btn:hover {
        background: rgba(0, 0, 0, 0.2);
        color: #374151;
    }

    .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
        border-top: 1px solid #e5e7eb;
        background: #f8fafc;
    }

    .btn-danger {
        background: #ef4444;
        color: white;
        border-color: #ef4444;
    }

    .btn-danger:hover {
        background: #dc2626;
        border-color: #dc2626;
    }

    .btn-danger:disabled {
        background: #9ca3af;
        border-color: #9ca3af;
        cursor: not-allowed;
        transform: none;
    }

    .btn-danger.enabled {
        background: #ef4444;
        border-color: #ef4444;
        cursor: pointer;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .categories-grid-management {
            grid-template-columns: 1fr;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .advanced-actions-grid {
            grid-template-columns: 1fr;
        }

        .modal-container {
            margin: 10px;
            max-height: calc(100vh - 20px);
        }

        .modal-small,
        .modal-medium,
        .modal-large,
        .modal-xlarge {
            width: 100%;
            max-width: none;
        }

        .icon-picker-grid {
            grid-template-columns: repeat(6, 1fr);
        }
    }

    @media (max-width: 480px) {
        .category-card-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .category-actions {
            justify-content: center;
            width: 100%;
        }

        .icon-picker-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }
`;

// Compléter la classe avec les méthodes manquantes de la version originale
window.categoriesPage = new CategoriesPage();
