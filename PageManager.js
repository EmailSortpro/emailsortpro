.emails-container-unified {
                background: white;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow);
                overflow: hidden;
            }

            .emails-list-unified {
                display: flex;
                flex-direction: column;
            }

            .email-card-unified {
                display: flex;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid #f1f5f9;
                cursor: pointer;
                transition: var(--transition);
                position: relative;
                min-height: 80px;
            }

            .email-card-unified:hover {
                background: #f8fafc;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .email-card-unified.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid var(--primary-color);
            }

            .email-card-unified.preselected {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 4px solid var(--secondary-color);
            }

            .email-card-unified.preselected.selected {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-left: 4px solid var(--secondary-color);
            }

            .email-card-unified.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 4px solid var(--success-color);
            }

            .email-checkbox-unified {
                margin-right: 16px;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                cursor: pointer;
                appearance: none;
                position: relative;
                transition: var(--transition);
            }

            .email-checkbox-unified:checked {
                background: var(--primary-color);
                border-color: var(--primary-color);
            }

            .email-card-unified.preselected .email-checkbox-unified:checked {
                background: var(--secondary-color);
                border-color: var(--secondary-color);
            }

            .email-checkbox-unified:checked::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: 700;
            }

            .priority-bar-unified {
                width: 4px;
                height: 60px;
                border-radius: 2px;
                margin-right: 16px;
                transition: var(--transition);
            }

            .priority-bar-unified.google {
                background: linear-gradient(135deg, var(--google-color), #34a853);
            }

            .priority-bar-unified.microsoft {
                background: linear-gradient(135deg, var(--microsoft-color), #00bcf2);
            }

            .email-content-unified {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .email-header-unified {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 16px;
            }

            .email-subject-unified {
                font-size: 16px;
                font-weight: 700;
                color: #1f2937;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .email-meta-unified {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .email-type-badge-unified,
            .email-date-badge-unified,
            .confidence-badge-unified,
            .preselected-badge-unified {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
            }

            .email-type-badge-unified {
                background: #f8fafc;
                color: #64748b;
                border: 1px solid #e2e8f0;
            }

            .email-type-badge-unified.google {
                background: rgba(66, 133, 244, 0.1);
                color: var(--google-color);
                border-color: rgba(66, 133, 244, 0.3);
            }

            .email-type-badge-unified.microsoft {
                background: rgba(0, 120, 215, 0.1);
                color: var(--microsoft-color);
                border-color: rgba(0, 120, 215, 0.3);
            }

            .email-date-badge-unified {
                background: #f1f5f9;
                color: #475569;
                border: 1px solid #cbd5e1;
            }

            .confidence-badge-unified {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }

            .preselected-badge-unified {
                background: linear-gradient(135deg, var(--secondary-color), #7c3aed);
                color: white;
                border: none;
                box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }

            .email-sender-unified {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }

            .sender-avatar-unified {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 14px;
                flex-shrink: 0;
            }

            .sender-info-unified {
                display: flex;
                flex-direction: column;
                min-width: 0;
                flex: 1;
            }

            .sender-name-unified {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .sender-email-unified {
                font-size: 12px;
                color: #6b7280;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .attachment-indicator-unified {
                color: #f59e0b;
                font-size: 14px;
            }

            .category-badge-unified {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid;
                white-space: nowrap;
            }

            .category-badge-unified.preselected {
                box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
                animation: glow 2s infinite;
            }

            @keyframes glow {
                0%, 100% { box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3); }
                50% { box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5); }
            }

            .email-preview-unified {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
                margin-top: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .email-actions-unified {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-left: 16px;
                flex-shrink: 0;
            }

            .action-btn-unified {
                width: 36px;
                height: 36px;
                border: 2px solid transparent;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
                font-size: 14px;
                backdrop-filter: blur(10px);
            }

            .action-btn-unified:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .action-btn-unified.create-task {
                color: var(--primary-color);
            }

            .action-btn-unified.create-task:hover {
                background: rgba(99, 102, 241, 0.1);
                border-color: var(--primary-color);
            }

            .action-btn-unified.create-task.preselected {
                color: var(--secondary-color);
                background: rgba(139, 92, 246, 0.1);
            }

            .action-btn-unified.create-task.preselected:hover {
                background: rgba(139, 92, 246, 0.2);
                border-color: var(--secondary-color);
            }

            .action-btn-unified.view-task {
                color: var(--success-color);
                background: rgba(16, 185, 129, 0.1);
            }

            .action-btn-unified.view-task:hover {
                background: rgba(16, 185, 129, 0.2);
                border-color: var(--success-color);
            }

            .action-btn-unified.details {
                color: #8b5cf6;
            }

            .action-btn-unified.details:hover {
                background: rgba(139, 92, 246, 0.1);
                border-color: #8b5cf6;
            }

            /* Vue groupée */
            .emails-grouped-unified {
                display: flex;
                flex-direction: column;
            }

            .email-group-unified {
                border-bottom: 1px solid #f1f5f9;
            }

            .group-header-unified {
                display: flex;
                align-items: center;
                padding: 16px;
                cursor: pointer;
                transition: var(--transition);
                background: #fafbfc;
                gap: 16px;
            }

            .group-header-unified:hover {
                background: #f1f5f9;
            }

            .email-group-unified.expanded .group-header-unified {
                background: #e2e8f0;
                border-bottom: 1px solid #cbd5e1;
            }

            .group-avatar-unified {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 18px;
                flex-shrink: 0;
            }

            .group-info-unified {
                flex: 1;
                min-width: 0;
            }

            .group-name-unified {
                font-size: 16px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .group-meta-unified {
                font-size: 13px;
                color: #6b7280;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .group-expand-unified {
                width: 36px;
                height: 36px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6b7280;
                transition: var(--transition);
                cursor: pointer;
            }

            .group-expand-unified:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }

            .group-content-unified {
                background: white;
            }

            /* État vide */
            .empty-state-unified {
                text-align: center;
                padding: 80px 40px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .empty-icon-unified {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #e5e7eb, #d1d5db);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #9ca3af;
                font-size: 36px;
                margin-bottom: 24px;
            }

            .empty-title-unified {
                font-size: 24px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }

            .empty-text-unified {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 32px;
                max-width: 400px;
                line-height: 1.6;
            }

            /* Menu dropdown */
            .dropdown-unified {
                position: relative;
            }

            .dropdown-menu-unified {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                min-width: 200px;
                padding: 8px 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;
                z-index: 1000;
            }

            .dropdown-menu-unified.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .dropdown-item-unified {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: none;
                border: none;
                width: 100%;
                text-align: left;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
            }

            .dropdown-item-unified:hover {
                background: #f8fafc;
                color: #1f2937;
            }

            .dropdown-item-unified.danger {
                color: var(--danger-color);
            }

            .dropdown-item-unified.danger:hover {
                background: #fef2f2;
                color: #dc2626;
            }

            .dropdown-divider-unified {
                height: 1px;
                background: #e5e7eb;
                margin: 8px 0;
            }

            /* Responsive amélioré */
            @media (max-width: 1024px) {
                .controls-bar-unified {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }

                .search-section-unified {
                    order: 1;
                    min-width: auto;
                }

                .view-modes-unified {
                    order: 2;
                    justify-content: space-around;
                }

                .actions-section-unified {
                    order: 3;
                    justify-content: center;
                }

                .filters-bar-unified {
                    gap: 4px;
                }

                .filter-tab-unified {
                    min-width: 80px;
                    padding: 8px;
                }

                .email-header-unified {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }

                .email-meta-unified {
                    align-self: stretch;
                    justify-content: flex-start;
                }
            }

            @media (max-width: 768px) {
                .emails-page-unified {
                    padding: 12px;
                }

                .btn-unified .btn-text {
                    display: none;
                }

                .view-mode-unified span {
                    display: none;
                }

                .actions-section-unified {
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .btn-unified {
                    min-width: 44px;
                    padding: 0 8px;
                    justify-content: center;
                }

                .email-card-unified {
                    padding: 12px;
                    min-height: auto;
                }

                .priority-bar-unified {
                    height: 40px;
                    margin-right: 12px;
                }

                .sender-avatar-unified {
                    width: 32px;
                    height: 32px;
                    font-size: 12px;
                }

                .email-sender-unified {
                    gap: 8px;
                }

                .email-actions-unified {
                    margin-left: 8px;
                    gap: 4px;
                }

                .action-btn-unified {
                    width: 32px;
                    height: 32px;
                    font-size: 12px;
                }
            }

            @media (max-width: 480px) {
                .email-card-unified {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }

                .email-checkbox-unified {
                    margin-right: 0;
                    margin-bottom: 8px;
                }

                .priority-bar-unified {
                    display: none;
                }

                .email-content-unified {
                    width: 100%;
                }

                .email-actions-unified {
                    margin-left: 0;
                    width: 100%;
                    justify-content: flex-end;
                }

                .empty-state-unified {
                    padding: 40px 20px;
                }

                .empty-icon-unified {
                    width: 60px;
                    height: 60px;
                    font-size: 28px;
                }

                .empty-title-unified {
                    font-size: 20px;
                }

                .empty-text-unified {
                    font-size: 14px;
                }
            }

            /* Animations améliorées */
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .email-card-unified {
                animation: slideIn 0.3s ease-out;
            }

            .email-card-unified:nth-child(even) {
                animation-delay: 0.05s;
            }

            .email-card-unified:nth-child(odd) {
                animation-delay: 0.1s;
            }

            /* Améliorations pour l'accessibilité */
            .email-card-unified:focus-within {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            .btn-unified:focus,
            .action-btn-unified:focus {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            /* États de chargement */
            .loading-skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }

            @keyframes loading {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }

            /* Indicateurs de statut */
            .status-indicator {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                z-index: 10;
            }

            .status-indicator.unread {
                background: var(--primary-color);
            }

            .status-indicator.important {
                background: var(--warning-color);
            }

            .status-indicator.urgent {
                background: var(--danger-color);
                animation: pulse 1s infinite;
            }

            /* Transitions fluides */
            * {
                scrollbar-width: thin;
                scrollbar-color: #cbd5e1 #f1f5f9;
            }

            *::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }

            *::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 3px;
            }

            *::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }

            /* Styles pour les modales unifiées */
            .modal-overlay-unified {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                backdrop-filter: blur(4px);
                animation: fadeIn 0.3s ease;
            }

            .modal-container-unified {
                background: white;
                border-radius: 16px;
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }

            .modal-container-unified.large {
                max-width: 1200px;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .modal-header-unified {
                padding: 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }

            .modal-title-section {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .modal-title {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0;
            }

            .modal-provider-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid currentColor;
            }

            .modal-close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
            }

            .modal-close-btn:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .modal-content-unified {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            .modal-footer-unified {
                padding: 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                flex-shrink: 0;
            }

            /* Styles pour le formulaire de tâche */
            .task-form-unified {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .ai-analysis-badge {
                background: #f0f9ff;
                border: 1px solid #0ea5e9;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #0c4a6e;
                font-weight: 600;
            }

            .email-source-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .source-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 18px;
                flex-shrink: 0;
            }

            .source-info {
                flex: 1;
                min-width: 0;
            }

            .source-name {
                font-size: 16px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .source-email {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 4px;
            }

            .source-subject {
                font-size: 13px;
                color: #9ca3af;
                font-style: italic;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .source-provider {
                display: flex;
                align-items: center;
                gap: 6px;
                background: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid #e5e7eb;
                flex-shrink: 0;
            }

            .form-grid-unified {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .form-field-unified {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-row-unified {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .form-label-unified {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }

            .form-input-unified,
            .form-textarea-unified,
            .form-select-unified {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: var(--transition);
                outline: none;
                font-family: inherit;
            }

            .form-input-unified:focus,
            .form-textarea-unified:focus,
            .form-select-unified:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .form-textarea-unified {
                resize: vertical;
                min-height: 100px;
            }

            .email-preview-section {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
            }

            .preview-toggle-btn {
                width: 100%;
                background: #f8fafc;
                border: none;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #475569;
                transition: var(--transition);
            }

            .preview-toggle-btn:hover {
                background: #f1f5f9;
                color: #334155;
            }

            .email-preview-content {
                background: white;
                border-top: 1px solid #e5e7eb;
            }

            .preview-header {
                padding: 16px;
                border-bottom: 1px solid #f1f5f9;
                background: #fafbfc;
                font-size: 13px;
                line-height: 1.6;
            }

            .preview-header div {
                margin-bottom: 4px;
            }

            .preview-body {
                padding: 16px;
                max-height: 300px;
                overflow-y: auto;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
            }

            /* Styles pour la modale d'email */
            .email-details-card {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .email-header-details {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            }

            .sender-section {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .sender-avatar-large {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 24px;
                flex-shrink: 0;
            }

            .sender-details {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .sender-name-large {
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
            }

            .sender-email-large {
                font-size: 14px;
                color: #6b7280;
            }

            .email-date-large {
                font-size: 13px;
                color: #9ca3af;
            }

            .email-meta-details {
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: flex-end;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
            }

            .meta-label {
                font-weight: 600;
                color: #6b7280;
                min-width: 80px;
            }

            .category-badge-large,
            .provider-badge-small,
            .attachment-badge {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
            }

            .provider-badge-small {
                border: 1px solid currentColor;
            }

            .attachment-badge {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fbbf24;
            }

            .email-subject-large {
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                line-height: 1.4;
                padding: 16px 20px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
            }

            .email-body-container {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                max-height: 500px;
                overflow-y: auto;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
            }

            /* Styles pour les autres pages */
            .page-container-unified {
                min-height: calc(100vh - 120px);
                padding: 20px;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }

            .page-header-unified {
                text-align: center;
                margin-bottom: 40px;
            }

            .page-header-unified h1 {
                font-size: 32px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
            }

            .page-header-unified p {
                font-size: 16px;
                color: #6b7280;
                margin: 0;
            }

            .scanner-fallback-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 50px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 600px;
                width: 100%;
                margin: 0 auto;
            }

            .scanner-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 25px;
                color: white;
                font-size: 32px;
            }

            .provider-status {
                background: rgba(34, 197, 94, 0.1);
                color: #16a34a;
                padding: 12px 20px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-weight: 600;
                margin-top: 20px;
            }

            .auth-required {
                margin-top: 30px;
            }

            .auth-buttons {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-top: 20px;
            }

            .categories-grid-unified {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
            }

            .category-card-unified {
                background: white;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transition: var(--transition);
                border: 1px solid #e5e7eb;
            }

            .category-card-unified:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }

            .category-icon-large {
                width: 60px;
                height: 60px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                margin-bottom: 16px;
            }

            .category-name {
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
            }

            .category-description {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 16px;
                line-height: 1.5;
            }

            .category-status {
                display: flex;
                justify-content: flex-end;
            }

            .status-badge {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
            }

            .status-badge.custom {
                background: #fef3c7;
                color: #d97706;
            }

            .status-badge.system {
                background: #dbeafe;
                color: #2563eb;
            }

            .settings-sections {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 24px;
            }

            .settings-card {
                background: white;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }

            .settings-card h3 {
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
            }

            .settings-card p {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 20px;
                line-height: 1.5;
            }

            .provider-status-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .provider-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .provider-item i {
                font-size: 18px;
                width: 24px;
                text-align: center;
            }

            .provider-item span:nth-child(2) {
                flex: 1;
                font-weight: 600;
                color: #374151;
            }

            .status.connected {
                color: #16a34a;
                font-weight: 600;
            }

            .status.disconnected {
                color: #dc2626;
                font-weight: 600;
            }

            /* Responsive pour les modales */
            @media (max-width: 768px) {
                .modal-overlay-unified {
                    padding: 12px;
                }

                .modal-container-unified {
                    max-width: 100%;
                    max-height: 95vh;
                }

                .modal-header-unified,
                .modal-content-unified,
                .modal-footer-unified {
                    padding: 16px;
                }

                .modal-title-section {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }

                .email-header-details {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;
                }

                .email-meta-details {
                    align-items: flex-start;
                    width: 100%;
                }

                .form-row-unified {
                    grid-template-columns: 1fr;
                }

                .modal-footer-unified {
                    flex-direction: column;
                    gap: 8px;
                }

                .modal-footer-unified button {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }// PageManager.js - Version 13.0 - Intégration Gmail/Outlook Unifiée et Robuste

class PageManager {
    constructor() {
        // Core state unifié
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // NOUVEAU: Gestion provider unifié
        this.currentProvider = null;
        this.providerState = {
            google: { lastUpdate: 0, isAuthenticated: false },
            microsoft: { lastUpdate: 0, isAuthenticated: false }
        };
        
        // Synchronisation renforcée avec CategoryManager
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncListeners = new Set();
        
        // Cache performance
        this.emailsCache = new Map();
        this.categoriesCache = new Map();
        this.lastCacheUpdate = 0;
        
        // Page renderers
        this.pages = {
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container),
            ranger: (container) => this.renderRanger(container)
        };
        
        this.setupEventListeners();
        this.initializeProviderMonitoring();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 13.0 - Intégration Gmail/Outlook Unifiée');
        this.loadUnifiedSettings();
        this.startProviderSync();
    }

    // ================================================
    // GESTION PROVIDER UNIFIÉ ROBUSTE
    // ================================================
    initializeProviderMonitoring() {
        // Surveiller les changements d'authentification
        setInterval(() => {
            this.checkProviderChanges();
        }, 2000);
        
        // Écouter les événements d'authentification
        this.setupProviderEventListeners();
    }

    setupProviderEventListeners() {
        // Écouter l'initialisation de MailService
        window.addEventListener('mailServiceInitialized', (event) => {
            const { provider } = event.detail;
            console.log(`[PageManager] 📧 MailService initialisé: ${provider}`);
            
            this.currentProvider = provider;
            this.updateProviderUI(provider);
            
            // Mettre à jour l'affichage si on est sur la page emails
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.refreshEmailsView();
                }, 200);
            }
        });

        // Écouter les changements de connexion
        window.addEventListener('userAuthenticated', (event) => {
            const { provider } = event.detail || {};
            console.log(`[PageManager] 🔐 Utilisateur connecté: ${provider}`);
            
            if (provider) {
                this.currentProvider = provider;
                this.providerState[provider].isAuthenticated = true;
                this.providerState[provider].lastUpdate = Date.now();
            }
            
            this.refreshCurrentPage();
        });

        window.addEventListener('userLoggedOut', (event) => {
            const { provider } = event.detail || {};
            console.log(`[PageManager] 🚪 Utilisateur déconnecté: ${provider}`);
            
            if (provider) {
                this.providerState[provider].isAuthenticated = false;
                this.providerState[provider].lastUpdate = Date.now();
            }
            
            this.clearEmailsCache();
            this.refreshCurrentPage();
        });
    }

    checkProviderChanges() {
        const previousProvider = this.currentProvider;
        const newProvider = this.detectCurrentProvider();
        
        if (newProvider !== previousProvider) {
            console.log(`[PageManager] 🔄 Changement provider: ${previousProvider} → ${newProvider}`);
            
            this.currentProvider = newProvider;
            this.clearEmailsCache();
            
            if (newProvider) {
                this.updateProviderUI(newProvider);
            }
            
            // Rafraîchir la page courante si nécessaire
            if (this.currentPage === 'emails' || this.currentPage === 'scanner') {
                this.refreshCurrentPage();
            }
        }
    }

    detectCurrentProvider() {
        // Vérifier Google en premier (priorité Gmail)
        if (window.googleAuthService && 
            typeof window.googleAuthService.isAuthenticated === 'function') {
            try {
                if (window.googleAuthService.isAuthenticated()) {
                    return 'google';
                }
            } catch (error) {
                console.warn('[PageManager] Erreur vérification Google:', error);
            }
        }
        
        // Puis Microsoft
        if (window.authService && 
            typeof window.authService.isAuthenticated === 'function') {
            try {
                if (window.authService.isAuthenticated()) {
                    return 'microsoft';
                }
            } catch (error) {
                console.warn('[PageManager] Erreur vérification Microsoft:', error);
            }
        }
        
        return null;
    }

    updateProviderUI(provider) {
        // Mettre à jour les badges de provider dans l'interface
        const providerBadges = document.querySelectorAll('.provider-badge-unified');
        
        providerBadges.forEach(badge => {
            if (provider === 'google') {
                badge.innerHTML = `
                    <i class="fab fa-google"></i>
                    <span>Gmail</span>
                `;
                badge.className = 'provider-badge-unified google';
            } else if (provider === 'microsoft') {
                badge.innerHTML = `
                    <i class="fab fa-microsoft"></i>
                    <span>Outlook</span>
                `;
                badge.className = 'provider-badge-unified microsoft';
            }
        });
        
        // Mettre à jour les textes spécifiques au provider
        const providerTexts = document.querySelectorAll('.provider-text');
        const providerName = provider === 'google' ? 'Gmail' : 'Outlook';
        
        providerTexts.forEach(text => {
            text.textContent = text.textContent.replace(/Gmail|Outlook|Google|Microsoft/g, providerName);
        });
    }

    // ================================================
    // SYNCHRONISATION SETTINGS UNIFIÉE RENFORCÉE
    // ================================================
    loadUnifiedSettings() {
        console.log('[PageManager] 📊 Chargement settings unifié...');
        
        try {
            // Priorité au CategoryManager
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                
                console.log('[PageManager] ✅ Settings depuis CategoryManager');
                console.log('[PageManager] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            } else {
                // Fallback localStorage
                const saved = localStorage.getItem('categorySettings');
                if (saved) {
                    this.settings = JSON.parse(saved);
                    this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                } else {
                    this.settings = this.getDefaultSettings();
                    this.taskPreselectedCategories = [];
                }
                
                console.log('[PageManager] 📦 Settings depuis localStorage/défaut');
            }
            
            this.lastSettingsSync = Date.now();
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur chargement settings:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: [],
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

    startProviderSync() {
        // Synchronisation périodique
        setInterval(() => {
            this.syncWithCategoryManager();
        }, 5000);
    }

    syncWithCategoryManager() {
        if (!window.categoryManager) return;
        
        try {
            const freshCategories = window.categoryManager.getTaskPreselectedCategories();
            const freshSettings = window.categoryManager.getSettings();
            
            // Vérifier les changements
            const categoriesChanged = JSON.stringify([...this.taskPreselectedCategories].sort()) !== 
                                    JSON.stringify([...freshCategories].sort());
            
            if (categoriesChanged) {
                console.log('[PageManager] 🔄 Catégories pré-sélectionnées changées');
                console.log('  - Avant:', this.taskPreselectedCategories);
                console.log('  - Après:', freshCategories);
                
                this.taskPreselectedCategories = [...freshCategories];
                this.settings = { ...this.settings, ...freshSettings };
                
                // Mettre à jour les emails si ils sont chargés
                if (this.currentPage === 'emails') {
                    this.updateEmailPreselection();
                }
            }
            
        } catch (error) {
            console.error('[PageManager] Erreur sync CategoryManager:', error);
        }
    }

    updateEmailPreselection() {
        console.log('[PageManager] 🔄 Mise à jour pré-sélection emails...');
        
        const emails = this.getAllEmails();
        let updated = 0;
        
        emails.forEach(email => {
            const shouldBePreselected = this.taskPreselectedCategories.includes(email.category);
            const wasPreselected = email.isPreselectedForTasks === true;
            
            if (shouldBePreselected !== wasPreselected) {
                email.isPreselectedForTasks = shouldBePreselected;
                updated++;
                
                if (shouldBePreselected) {
                    this.selectedEmails.add(email.id);
                } else {
                    this.selectedEmails.delete(email.id);
                }
            }
        });
        
        if (updated > 0) {
            console.log(`[PageManager] ✅ ${updated} emails mis à jour`);
            this.refreshEmailsView();
        }
    }

    // ================================================
    // GESTION CACHE EMAILS UNIFIÉE
    // ================================================
    getAllEmails() {
        // Utiliser le cache si récent
        if (this.emailsCache.has('all') && 
            (Date.now() - this.lastCacheUpdate) < 30000) {
            return this.emailsCache.get('all');
        }
        
        // Récupérer depuis EmailScanner
        const emails = window.emailScanner?.getAllEmails() || [];
        
        // Mettre à jour le cache
        this.emailsCache.set('all', emails);
        this.lastCacheUpdate = Date.now();
        
        return emails;
    }

    clearEmailsCache() {
        this.emailsCache.clear();
        this.lastCacheUpdate = 0;
        console.log('[PageManager] 🗑️ Cache emails effacé');
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX UNIFIÉS
    // ================================================
    setupEventListeners() {
        // Écouter les changements CategoryManager
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 Settings CategoryManager changés:', event.detail);
            this.handleCategoryManagerChange(event.detail);
        });

        // Écouter les changements génériques
        window.addEventListener('settingsChanged', (event) => {
            if (event.detail?.source === 'PageManager') return; // Éviter les boucles
            
            console.log('[PageManager] 📨 Settings génériques changés:', event.detail);
            this.handleGenericSettingsChange(event.detail);
        });

        // Écouter la fin des scans
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] 📧 Scan terminé:', event.detail);
            this.handleScanCompleted(event.detail);
        });

        // Écouter la recatégorisation
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] 🏷️ Emails recatégorisés');
            this.clearEmailsCache();
            
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.refreshEmailsView();
                }, 100);
            }
        });

        // Scroll pour sticky
        window.addEventListener('scroll', () => {
            this.handleScrollForSticky();
        });

        // Resize pour responsive
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleCategoryManagerChange(detail) {
        const { settings, type, value } = detail;
        
        if (type === 'taskPreselectedCategories') {
            console.log('[PageManager] 📋 Catégories pré-sélectionnées changées:', value);
            this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
            
            // Mettre à jour immédiatement
            if (this.currentPage === 'emails') {
                this.updateEmailPreselection();
            }
        }
        
        if (settings) {
            this.settings = { ...this.settings, ...settings };
        }
        
        // Déclencher re-catégorisation si nécessaire
        if (['activeCategories', 'categoryExclusions', 'preferences'].includes(type)) {
            this.triggerRecategorization();
        }
    }

    handleGenericSettingsChange(detail) {
        const { type, value } = detail;
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                this.updateEmailPreselection();
                break;
                
            case 'activeCategories':
                this.settings.activeCategories = value;
                this.triggerRecategorization();
                break;
                
            case 'preferences':
                this.settings.preferences = { ...this.settings.preferences, ...value };
                this.refreshEmailsView();
                break;
        }
    }

    handleScanCompleted(detail) {
        this.lastScanData = detail;
        this.clearEmailsCache();
        
        // Rediriger vers emails si pas déjà dessus
        if (this.currentPage !== 'emails') {
            this.loadPage('emails');
        } else {
            this.refreshEmailsView();
        }
        
        // Afficher notification avec provider
        const provider = detail.provider || this.currentProvider;
        const providerName = provider === 'google' ? 'Gmail' : 'Outlook';
        const message = detail.preselectedCount > 0 ?
            `✅ ${detail.results?.total || 0} emails ${providerName} • ⭐ ${detail.preselectedCount} pré-sélectionnés` :
            `✅ ${detail.results?.total || 0} emails ${providerName} analysés`;
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'success', 4000);
        }
    }

    triggerRecategorization() {
        if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
            console.log('[PageManager] 🔄 Déclenchement recatégorisation...');
            setTimeout(() => {
                window.emailScanner.recategorizeEmails?.();
            }, 150);
        }
    }

    handleScrollForSticky() {
        if (this.currentPage !== 'emails') return;

        const stickyContainer = document.querySelector('.sticky-controls-container');
        const originalContainer = document.querySelector('.controls-and-filters-container');
        
        if (!stickyContainer || !originalContainer) return;

        const scrollY = window.scrollY;
        const containerTop = originalContainer.offsetTop;
        
        if (scrollY > containerTop - 20) {
            stickyContainer.classList.add('sticky-active');
        } else {
            stickyContainer.classList.remove('sticky-active');
        }
    }

    handleResize() {
        // Réorganiser l'interface responsive
        if (this.currentPage === 'emails') {
            this.adjustResponsiveLayout();
        }
    }

    adjustResponsiveLayout() {
        const width = window.innerWidth;
        const controlsBar = document.querySelector('.controls-bar-single-line');
        
        if (controlsBar) {
            if (width <= 1024) {
                controlsBar.classList.add('mobile-layout');
            } else {
                controlsBar.classList.remove('mobile-layout');
            }
        }
    }

    // ================================================
    // NAVIGATION PAGES UNIFIÉE
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManager] 📄 Chargement page: ${pageName} (provider: ${this.currentProvider})`);

        // Ignorer le dashboard
        if (pageName === 'dashboard') {
            console.log('[PageManager] Dashboard ignoré - géré par index.html');
            this.updateNavigation(pageName);
            return;
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] Container de contenu non trouvé');
            return;
        }

        this.updateNavigation(pageName);
        window.uiManager?.showLoading(`Chargement ${pageName}...`);

        try {
            // Vérifier l'authentification pour certaines pages
            if (['emails', 'scanner'].includes(pageName)) {
                const provider = this.detectCurrentProvider();
                if (!provider) {
                    this.renderAuthRequired(pageContent, pageName);
                    window.uiManager?.hideLoading();
                    return;
                }
                
                this.currentProvider = provider;
            }

            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            window.uiManager?.hideLoading();

        } catch (error) {
            console.error(`[PageManager] Erreur chargement page:`, error);
            window.uiManager?.hideLoading();
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = this.renderErrorPage(error, pageName);
        }
    }

    renderAuthRequired(container, pageName) {
        const pageTitle = pageName === 'emails' ? 'Emails' : 'Scanner';
        
        container.innerHTML = `
            <div class="page-container-unified">
                <div class="auth-required-card">
                    <div class="auth-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h2 class="auth-title">Connexion requise</h2>
                    <p class="auth-subtitle">Connectez-vous pour accéder à ${pageTitle.toLowerCase()}</p>
                    
                    <div class="auth-buttons">
                        <button class="btn-auth btn-microsoft" onclick="window.authService?.login()">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter avec Microsoft</span>
                        </button>
                        
                        <button class="btn-auth btn-google" onclick="window.googleAuthService?.login()">
                            <i class="fab fa-google"></i>
                            <span>Se connecter avec Google</span>
                        </button>
                    </div>
                    
                    <div class="auth-info">
                        <i class="fas fa-shield-alt"></i>
                        <span>Connexion sécurisée - Compatible Gmail et Outlook</span>
                    </div>
                </div>
            </div>
        `;
        
        this.addAuthStyles();
    }

    renderErrorPage(error, pageName) {
        return `
            <div class="page-container-unified">
                <div class="error-card">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 class="error-title">Erreur de chargement</h2>
                    <p class="error-message">${error.message}</p>
                    
                    <div class="error-actions">
                        <button class="btn-primary" onclick="window.pageManager.loadPage('${pageName}')">
                            <i class="fas fa-redo"></i>
                            <span>Réessayer</span>
                        </button>
                        
                        <button class="btn-secondary" onclick="window.pageManager.loadPage('dashboard')">
                            <i class="fas fa-home"></i>
                            <span>Retour</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    refreshCurrentPage() {
        if (this.currentPage) {
            console.log(`[PageManager] 🔄 Rafraîchissement page: ${this.currentPage}`);
            this.loadPage(this.currentPage);
        }
    }

    // ================================================
    // RENDU PAGE EMAILS UNIFIÉ COMPLET
    // ================================================
    async renderEmails(container) {
        console.log(`[PageManager] 📧 Rendu page emails (provider: ${this.currentProvider})`);
        
        // Synchroniser les settings avant le rendu
        this.loadUnifiedSettings();
        
        const emails = this.getAllEmails();
        const categories = window.categoryManager?.getCategories() || {};
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            const providerName = this.currentProvider === 'google' ? 'Gmail' : 'Outlook';
            
            container.innerHTML = `
                <div class="emails-page-unified">
                    <!-- Badge Provider -->
                    <div class="provider-badge-unified ${this.currentProvider}">
                        <i class="fab fa-${this.currentProvider === 'google' ? 'google' : 'microsoft'}"></i>
                        <span>${providerName}</span>
                        <span class="email-count">${totalEmails} emails</span>
                    </div>

                    <!-- Texte explicatif -->
                    ${!this.hideExplanation ? `
                        <div class="explanation-text-unified">
                            <i class="fas fa-info-circle"></i>
                            <span>Sélectionnez vos emails ${providerName} pour créer des tâches automatiquement ou utiliser les actions en lot. Compatible avec votre workflow ${providerName}.</span>
                            <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}

                    <!-- Container contrôles -->
                    <div class="controls-and-filters-container">
                        ${this.renderUnifiedControls(selectedCount, totalEmails)}
                        ${this.renderUnifiedFilters(categoryCounts, totalEmails, categories)}
                    </div>

                    <!-- Container sticky (clone) -->
                    <div class="sticky-controls-container">
                        <!-- Sera copié dynamiquement -->
                    </div>

                    <!-- Contenu emails -->
                    <div class="emails-container-unified">
                        ${this.renderEmailsList()}
                    </div>
                </div>
            `;

            this.addUnifiedEmailStyles();
            this.setupEmailsEventListeners();
            this.setupStickyControls();
        };

        renderEmailsPage();
        
        // Auto-analyse pour les emails pré-sélectionnés
        if (this.autoAnalyzeEnabled && this.taskPreselectedCategories.length > 0) {
            this.scheduleAutoAnalysis(emails);
        }
    }

    renderUnifiedControls(selectedCount, totalEmails) {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        return `
            <div class="controls-bar-unified">
                <!-- Recherche -->
                <div class="search-section-unified">
                    <div class="search-box-unified">
                        <i class="fas fa-search search-icon-unified"></i>
                        <input type="text" 
                               class="search-input-unified" 
                               id="emailSearchInput"
                               placeholder="Rechercher dans ${this.currentProvider === 'google' ? 'Gmail' : 'Outlook'}..." 
                               value="${this.searchTerm}">
                        ${this.searchTerm ? `
                            <button class="search-clear-unified" onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Modes de vue -->
                <div class="view-modes-unified">
                    <button class="view-mode-unified ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                            onclick="window.pageManager.changeViewMode('grouped-domain')"
                            title="Grouper par domaine">
                        <i class="fas fa-globe"></i>
                        <span>Domaine</span>
                    </button>
                    <button class="view-mode-unified ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                            onclick="window.pageManager.changeViewMode('grouped-sender')"
                            title="Grouper par expéditeur">
                        <i class="fas fa-user"></i>
                        <span>Expéditeur</span>
                    </button>
                    <button class="view-mode-unified ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                            onclick="window.pageManager.changeViewMode('flat')"
                            title="Liste complète">
                        <i class="fas fa-list"></i>
                        <span>Liste</span>
                    </button>
                </div>
                
                <!-- Actions -->
                <div class="actions-section-unified">
                    <!-- Sélection -->
                    <button class="btn-unified btn-selection ${allSelected ? 'all-selected' : ''}" 
                            onclick="window.pageManager.toggleAllSelection()"
                            title="Sélectionner/Désélectionner tous">
                        <i class="fas fa-${allSelected ? 'square' : 'check-square'}"></i>
                        <span class="btn-text">${allSelected ? 'Désélectionner' : 'Sélectionner'} tous</span>
                        <span class="btn-count">(${visibleEmails.length})</span>
                    </button>
                    
                    <!-- Créer tâches -->
                    <button class="btn-unified btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                            onclick="window.pageManager.createTasksFromSelection()"
                            ${selectedCount === 0 ? 'disabled' : ''}>
                        <i class="fas fa-tasks"></i>
                        <span class="btn-text">Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                        ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                    </button>
                    
                    <!-- Menu actions -->
                    <div class="dropdown-unified">
                        <button class="btn-unified btn-secondary dropdown-toggle ${selectedCount === 0 ? 'disabled' : ''}" 
                                onclick="window.pageManager.toggleActionsMenu(event)"
                                ${selectedCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-ellipsis-v"></i>
                            <span class="btn-text">Actions</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="dropdown-menu-unified" id="actionsMenu">
                            ${this.renderActionsMenu()}
                        </div>
                    </div>
                    
                    <!-- Actualiser -->
                    <button class="btn-unified btn-secondary" onclick="window.pageManager.refreshEmails()">
                        <i class="fas fa-sync-alt"></i>
                        <span class="btn-text">Actualiser</span>
                    </button>
                    
                    <!-- Effacer sélection -->
                    ${selectedCount > 0 ? `
                        <button class="btn-unified btn-clear" 
                                onclick="window.pageManager.clearSelection()"
                                title="Effacer la sélection">
                            <i class="fas fa-times"></i>
                            <span class="btn-text">Effacer (${selectedCount})</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderActionsMenu() {
        return `
            <button class="dropdown-item-unified" onclick="window.pageManager.bulkMarkAsRead()">
                <i class="fas fa-eye"></i>
                <span>Marquer comme lu</span>
            </button>
            <button class="dropdown-item-unified" onclick="window.pageManager.bulkArchive()">
                <i class="fas fa-archive"></i>
                <span>Archiver</span>
            </button>
            <button class="dropdown-item-unified danger" onclick="window.pageManager.bulkDelete()">
                <i class="fas fa-trash"></i>
                <span>Supprimer</span>
            </button>
            <div class="dropdown-divider-unified"></div>
            <button class="dropdown-item-unified" onclick="window.pageManager.bulkExport()">
                <i class="fas fa-download"></i>
                <span>Exporter CSV</span>
            </button>
            <button class="dropdown-item-unified" onclick="window.pageManager.bulkAnalyze()">
                <i class="fas fa-brain"></i>
                <span>Analyser avec IA</span>
            </button>
        `;
    }

    renderUnifiedFilters(categoryCounts, totalEmails, categories) {
        const tabs = [
            { 
                id: 'all', 
                name: 'Tous', 
                icon: '📧', 
                count: totalEmails,
                isPreselected: false 
            }
        ];
        
        // Ajouter les catégories avec emails
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                const isPreselected = this.taskPreselectedCategories.includes(catId);
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count: count,
                    isPreselected: isPreselected
                });
            }
        });
        
        // Ajouter "Autre" si nécessaire
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            tabs.push({
                id: 'other',
                name: 'Non classé',
                icon: '❓',
                count: otherCount,
                isPreselected: false
            });
        }
        
        return `
            <div class="filters-bar-unified">
                ${tabs.map(tab => {
                    const isActive = this.currentCategory === tab.id;
                    const classes = [
                        'filter-tab-unified',
                        isActive ? 'active' : '',
                        tab.isPreselected ? 'preselected' : ''
                    ].filter(Boolean).join(' ');
                    
                    return `
                        <button class="${classes}" 
                                onclick="window.pageManager.filterByCategory('${tab.id}')"
                                data-category-id="${tab.id}"
                                title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée' : ''}">
                            <div class="tab-content-unified">
                                <div class="tab-header-unified">
                                    <span class="tab-icon-unified">${tab.icon}</span>
                                    <span class="tab-count-unified">${tab.count}</span>
                                </div>
                                <div class="tab-name-unified">${tab.name}</div>
                            </div>
                            ${tab.isPreselected ? '<span class="preselected-star-unified">⭐</span>' : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ================================================
    // GESTION DES EMAILS ET AFFICHAGE UNIFIÉ
    // ================================================
    
    renderEmailsList() {
        const emails = this.getAllEmails();
        let filteredEmails = this.getVisibleEmails();
        
        if (filteredEmails.length === 0) {
            return this.renderEmptyState();
        }

        // Rendu selon le mode de vue
        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatView(filteredEmails);
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedView(filteredEmails, this.currentViewMode);
            default:
                return this.renderFlatView(filteredEmails);
        }
    }

    renderFlatView(emails) {
        return `
            <div class="emails-list-unified">
                ${emails.map(email => this.renderUnifiedEmailCard(email)).join('')}
            </div>
        `;
    }

    renderUnifiedEmailCard(email) {
        const hasTask = this.createdTasks.has(email.id);
        const isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
        const isSelected = this.selectedEmails.has(email.id);
        
        // Gestion unifiée des expéditeurs Gmail/Outlook
        let senderName = 'Inconnu';
        let senderEmail = '';
        
        if (email.provider === 'google') {
            // Format Gmail
            const fromString = email.from?.emailAddress?.address || email.from || '';
            const match = fromString.match(/(.+?)\s*<(.+@.+)>/);
            if (match) {
                senderName = match[1].trim() || match[2];
                senderEmail = match[2];
            } else {
                senderName = fromString.includes('@') ? fromString : fromString;
                senderEmail = fromString.includes('@') ? fromString : '';
            }
        } else {
            // Format Microsoft Graph
            senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
            senderEmail = email.from?.emailAddress?.address || '';
        }
        
        // Classes CSS
        const cardClasses = [
            'email-card-unified',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselectedForTasks ? 'preselected' : '',
            email.provider || 'unknown'
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClasses}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 data-provider="${email.provider}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <!-- Checkbox sélection -->
                <input type="checkbox" 
                       class="email-checkbox-unified" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <!-- Barre priorité/provider -->
                <div class="priority-bar-unified ${email.provider}" 
                     style="background: ${this.getEmailPriorityColor(email, isPreselectedForTasks)}"></div>
                
                <!-- Contenu principal -->
                <div class="email-content-unified">
                    <div class="email-header-unified">
                        <h3 class="email-subject-unified">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-meta-unified">
                            <span class="email-type-badge-unified ${email.provider}">
                                <i class="fab fa-${email.provider === 'google' ? 'google' : 'microsoft'}"></i>
                                <span>${email.provider === 'google' ? 'Gmail' : 'Outlook'}</span>
                            </span>
                            <span class="email-date-badge-unified">
                                <i class="fas fa-calendar"></i>
                                <span>${this.formatEmailDate(email.receivedDateTime)}</span>
                            </span>
                            ${email.categoryScore ? `
                                <span class="confidence-badge-unified">
                                    <i class="fas fa-bullseye"></i>
                                    <span>${Math.round(email.categoryConfidence * 100)}%</span>
                                </span>
                            ` : ''}
                            ${isPreselectedForTasks ? `
                                <span class="preselected-badge-unified">
                                    <i class="fas fa-star"></i>
                                    <span>Pré-sélectionné</span>
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="email-sender-unified">
                        <div class="sender-avatar-unified" style="background: ${this.generateAvatarColor(senderName)}">
                            ${senderName.charAt(0).toUpperCase()}
                        </div>
                        <div class="sender-info-unified">
                            <span class="sender-name-unified">${this.escapeHtml(senderName)}</span>
                            <span class="sender-email-unified">${this.escapeHtml(senderEmail)}</span>
                        </div>
                        ${email.hasAttachments ? `
                            <span class="attachment-indicator-unified">
                                <i class="fas fa-paperclip"></i>
                            </span>
                        ` : ''}
                        ${this.renderCategoryBadge(email)}
                    </div>
                    
                    ${email.bodyPreview ? `
                        <div class="email-preview-unified">
                            ${this.escapeHtml(email.bodyPreview.substring(0, 120))}${email.bodyPreview.length > 120 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Actions -->
                <div class="email-actions-unified">
                    ${this.renderEmailActions(email, hasTask, isPreselectedForTasks)}
                </div>
            </div>
        `;
    }

    renderCategoryBadge(email) {
        if (!email.category || email.category === 'other') return '';
        
        const category = window.categoryManager?.getCategory(email.category);
        if (!category) return '';
        
        const isPreselected = this.taskPreselectedCategories.includes(email.category);
        
        return `
            <span class="category-badge-unified ${isPreselected ? 'preselected' : ''}" 
                  style="background: ${category.color}20; border-color: ${category.color}; color: ${category.color};">
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
                ${isPreselected ? '<i class="fas fa-star"></i>' : ''}
            </span>
        `;
    }

    renderEmailActions(email, hasTask, isPreselected) {
        const actions = [];
        
        if (!hasTask) {
            actions.push(`
                <button class="action-btn-unified create-task ${isPreselected ? 'preselected' : ''}" 
                        onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                        title="Créer une tâche">
                    <i class="fas fa-tasks"></i>
                </button>
            `);
        } else {
            actions.push(`
                <button class="action-btn-unified view-task" 
                        onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')"
                        title="Voir la tâche créée">
                    <i class="fas fa-check-circle"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-unified details" 
                    onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')"
                    title="Voir l'email complet">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    renderGroupedView(emails, groupMode) {
        const groups = this.createEmailGroups(emails, groupMode);
        
        return `
            <div class="emails-grouped-unified">
                ${groups.map(group => this.renderEmailGroup(group, groupMode)).join('')}
            </div>
        `;
    }

    renderEmailGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? `@${group.name}` : group.name;
        const avatarColor = this.generateAvatarColor(group.name);
        
        return `
            <div class="email-group-unified" data-group-key="${group.key}">
                <div class="group-header-unified" onclick="window.pageManager.toggleGroup('${group.key}', event)">
                    <div class="group-avatar-unified" style="background: ${avatarColor}">
                        ${groupType === 'grouped-domain' ? 
                            '<i class="fas fa-globe"></i>' : 
                            group.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="group-info-unified">
                        <div class="group-name-unified">${displayName}</div>
                        <div class="group-meta-unified">
                            ${group.count} email${group.count > 1 ? 's' : ''} • 
                            ${this.formatEmailDate(group.latestDate)} • 
                            ${group.provider === 'google' ? 'Gmail' : 'Outlook'}
                        </div>
                    </div>
                    <div class="group-expand-unified">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="group-content-unified" style="display: none;">
                    ${group.emails.map(email => this.renderUnifiedEmailCard(email)).join('')}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à "${this.searchTerm}"`;
            action = `
                <button class="btn-primary" onclick="window.pageManager.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.currentCategory === 'other') {
            title = 'Aucun email non classé';
            text = 'Tous vos emails ont été correctement catégorisés ! 🎉';
            action = `
                <button class="btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            const categoryName = this.getCategoryName(this.currentCategory);
            title = `Aucun email dans "${categoryName}"`;
            text = 'Cette catégorie ne contient aucun email.';
            action = `
                <button class="btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else {
            title = 'Aucun email trouvé';
            text = 'Utilisez le scanner pour analyser vos emails.';
            action = `
                <button class="btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    <span>Aller au scanner</span>
                </button>
            `;
        }
        
        return `
            <div class="empty-state-unified">
                <div class="empty-icon-unified">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-title-unified">${title}</h3>
                <p class="empty-text-unified">${text}</p>
                ${action}
            </div>
        `;
    }

    // ================================================
    // INTERACTION EMAILS UNIFIÉE
    // ================================================
    
    handleEmailClick(event, emailId) {
        // Empêcher la propagation si c'est un clic sur checkbox ou actions
        if (event.target.type === 'checkbox' || 
            event.target.closest('.email-actions-unified') ||
            event.target.closest('.group-header-unified')) {
            return;
        }
        
        // Double-clic pour sélection, simple clic pour modal
        const now = Date.now();
        const lastClick = this.lastEmailClick || 0;
        
        if (now - lastClick < 300) {
            // Double-clic = toggle sélection
            event.preventDefault();
            event.stopPropagation();
            this.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
        } else {
            this.lastEmailClick = now;
            // Simple clic = ouvrir modal après délai
            setTimeout(() => {
                if (Date.now() - this.lastEmailClick >= 250) {
                    this.showEmailModal(emailId);
                }
            }, 250);
        }
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        // Mise à jour immédiate de la checkbox
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .email-checkbox-unified`);
        if (checkbox) {
            checkbox.checked = this.selectedEmails.has(emailId);
        }
        
        // Mise à jour des contrôles
        this.updateControlsOnly();
    }

    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            // Désélectionner tous
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails désélectionnés`, 'info');
        } else {
            // Sélectionner tous
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
        }
        
        this.refreshEmailsView();
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        window.uiManager?.showToast('Sélection effacée', 'info');
    }

    // ================================================
    // FILTRES ET RECHERCHE UNIFIÉS
    // ================================================
    
    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
        
        // Mettre à jour visuellement les onglets
        document.querySelectorAll('.filter-tab-unified').forEach(tab => {
            if (tab.dataset.categoryId === categoryId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    handleSearch(term) {
        this.searchTerm = term.trim();
        this.refreshEmailsView();
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshEmailsView();
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
        
        // Mettre à jour visuellement les boutons
        document.querySelectorAll('.view-mode-unified').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.view-mode-unified[onclick*="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // ================================================
    // ACTIONS EN LOT UNIFIÉES
    // ================================================
    
    toggleActionsMenu(event) {
        event.stopPropagation();
        event.preventDefault();
        
        const menu = document.getElementById('actionsMenu');
        const button = event.currentTarget;
        
        if (!menu || !button) return;
        
        const isVisible = menu.classList.contains('show');
        
        // Fermer tous les autres menus
        document.querySelectorAll('.dropdown-menu-unified.show').forEach(m => {
            if (m !== menu) m.classList.remove('show');
        });
        
        if (isVisible) {
            menu.classList.remove('show');
            button.classList.remove('active');
        } else {
            menu.classList.add('show');
            button.classList.add('active');
            
            // Fermer en cliquant ailleurs
            const closeHandler = (e) => {
                if (!menu.contains(e.target) && !button.contains(e.target)) {
                    menu.classList.remove('show');
                    button.classList.remove('active');
                    document.removeEventListener('click', closeHandler);
                }
            };
            
            setTimeout(() => {
                document.addEventListener('click', closeHandler);
            }, 10);
        }
    }

    async bulkMarkAsRead() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        window.uiManager?.showToast(`${selectedEmails.length} emails marqués comme lus`, 'success');
        this.clearSelection();
    }

    async bulkArchive() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (confirm(`Archiver ${selectedEmails.length} email(s) ?`)) {
            window.uiManager?.showToast(`${selectedEmails.length} emails archivés`, 'success');
            this.clearSelection();
        }
    }

    async bulkDelete() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (confirm(`Supprimer ${selectedEmails.length} email(s) ?\n\nCette action est irréversible.`)) {
            window.uiManager?.showToast(`${selectedEmails.length} emails supprimés`, 'success');
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async bulkExport() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        const emails = selectedEmails.map(id => this.getEmailById(id)).filter(Boolean);
        
        // Gestion unifiée de l'export Gmail/Outlook
        const csvContent = [
            ['Provider', 'De', 'Sujet', 'Date', 'Catégorie', 'Contenu'].join(','),
            ...emails.map(email => {
                const provider = email.provider === 'google' ? 'Gmail' : 'Outlook';
                const sender = this.getUnifiedSender(email);
                
                return [
                    `"${provider}"`,
                    `"${sender}"`,
                    `"${email.subject || ''}"`,
                    email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleDateString('fr-FR') : '',
                    `"${this.getCategoryName(email.category)}"`,
                    `"${(email.bodyPreview || '').substring(0, 100)}"`
                ].join(',');
            })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `emails_${this.currentProvider}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.uiManager?.showToast('Export terminé', 'success');
        this.clearSelection();
    }

    async bulkAnalyze() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (!window.aiTaskAnalyzer) {
            window.uiManager?.showToast('IA non disponible', 'warning');
            return;
        }
        
        window.uiManager?.showLoading(`Analyse IA de ${selectedEmails.length} emails...`);
        
        let analyzed = 0;
        for (const emailId of selectedEmails) {
            const email = this.getEmailById(emailId);
            if (email && !this.aiAnalysisResults.has(emailId)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(emailId, analysis);
                    analyzed++;
                } catch (error) {
                    console.warn('[PageManager] Erreur analyse IA:', error);
                }
            }
        }
        
        window.uiManager?.hideLoading();
        window.uiManager?.showToast(`${analyzed} emails analysés par IA`, 'success');
    }

    // ================================================
    // CRÉATION DE TÂCHES UNIFIÉE
    // ================================================
    
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        const total = this.selectedEmails.size;
        window.uiManager?.showLoading(`Création de ${total} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                let analysis = this.aiAnalysisResults.get(emailId);
                if (!analysis && window.aiTaskAnalyzer) {
                    analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(emailId, analysis);
                }
                
                if (analysis && window.taskManager) {
                    const taskData = this.buildUnifiedTaskData(email, analysis);
                    const task = window.taskManager.createTaskFromEmail(taskData, email);
                    this.createdTasks.set(emailId, task.id);
                    created++;
                }
            } catch (error) {
                console.error('[PageManager] Erreur création tâche:', emailId, error);
            }
        }
        
        window.uiManager?.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks();
            const providerName = this.currentProvider === 'google' ? 'Gmail' : 'Outlook';
            window.uiManager?.showToast(
                `${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''} depuis ${providerName}`, 
                'success'
            );
            this.clearSelection();
        } else {
            window.uiManager?.showToast('Aucune tâche créée', 'warning');
        }
    }

    buildUnifiedTaskData(email, analysis) {
        const sender = this.getUnifiedSender(email);
        const senderEmail = this.getUnifiedSenderEmail(email);
        const senderDomain = senderEmail.split('@')[1] || 'unknown';
        const providerName = email.provider === 'google' ? 'Gmail' : 'Outlook';
        
        return {
            id: this.generateTaskId(),
            title: analysis.mainTask?.title || `Email ${providerName} de ${sender}`,
            description: analysis.mainTask?.description || analysis.summary || '',
            priority: analysis.mainTask?.priority || 'medium',
            dueDate: analysis.mainTask?.dueDate || null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: true,
            emailFrom: senderEmail,
            emailFromName: sender,
            emailSubject: email.subject,
            emailDomain: senderDomain,
            emailDate: email.receivedDateTime,
            emailProvider: email.provider,
            hasAttachments: email.hasAttachments || false,
            aiAnalysis: analysis,
            tags: [senderDomain, providerName, analysis.importance, ...(analysis.tags || [])].filter(Boolean),
            method: 'ai'
        };
    }

    // ================================================
    // UTILITAIRES UNIFIÉS GMAIL/OUTLOOK
    // ================================================
    
    getUnifiedSender(email) {
        if (email.provider === 'google') {
            const fromString = email.from?.emailAddress?.address || email.from || '';
            const match = fromString.match(/(.+?)\s*<(.+@.+)>/);
            if (match) {
                return match[1].trim() || match[2];
            }
            return fromString.includes('@') ? fromString : fromString;
        } else {
            return email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        }
    }

    getUnifiedSenderEmail(email) {
        if (email.provider === 'google') {
            const fromString = email.from?.emailAddress?.address || email.from || '';
            const match = fromString.match(/<(.+@.+)>/);
            return match ? match[1] : (fromString.includes('@') ? fromString : '');
        } else {
            return email.from?.emailAddress?.address || '';
        }
    }

    getEmailById(emailId) {
        const emails = this.getAllEmails();
        return emails.find(email => email.id === emailId);
    }

    createEmailGroups(emails, groupMode) {
        const groups = {};
        
        emails.forEach(email => {
            let groupKey, groupName;
            
            if (groupMode === 'grouped-domain') {
                const senderEmail = this.getUnifiedSenderEmail(email);
                const domain = senderEmail.split('@')[1] || 'unknown';
                groupKey = domain;
                groupName = domain;
            } else {
                const senderEmail = this.getUnifiedSenderEmail(email);
                const senderName = this.getUnifiedSender(email);
                groupKey = senderEmail;
                groupName = senderName;
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey,
                    name: groupName,
                    emails: [],
                    count: 0,
                    latestDate: null,
                    provider: email.provider
                };
            }
            
            groups[groupKey].emails.push(email);
            groups[groupKey].count++;
            
            const emailDate = new Date(email.receivedDateTime);
            if (!groups[groupKey].latestDate || emailDate > groups[groupKey].latestDate) {
                groups[groupKey].latestDate = emailDate;
            }
        });
        
        return Object.values(groups).sort((a, b) => {
            if (!a.latestDate && !b.latestDate) return 0;
            if (!a.latestDate) return 1;
            if (!b.latestDate) return -1;
            return b.latestDate - a.latestDate;
        });
    }

    toggleGroup(groupKey, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content-unified');
        const icon = group.querySelector('.group-expand-unified i');
        
        if (!content || !icon) return;
        
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
        }
    }

    generateAvatarColor(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash) % 360;
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash) % 15);
        
        return `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 10}%))`;
    }

    getEmailPriorityColor(email, isPreselected) {
        if (isPreselected) return '#8b5cf6'; // Violet pour pré-sélectionnés
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        return email.provider === 'google' ? '#4285f4' : '#0078d7';
    }

    formatEmailDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}h`;
        } else if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}j`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCategoryColor(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.color || '#64748b';
    }

    getCategoryIcon(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.icon || '📌';
    }

    getCategoryName(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.name || categoryId || 'Autre';
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS ET MISE À JOUR
    // ================================================
    
    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
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

    setupStickyControls() {
        const originalContainer = document.querySelector('.controls-and-filters-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) return;

        // Cloner le contenu
        stickyContainer.innerHTML = originalContainer.innerHTML;
        
        // Configurer les event listeners pour le clone
        this.setupStickyEventListeners(stickyContainer);
    }

    setupStickyEventListeners(stickyContainer) {
        // Recherche sticky
        const stickySearch = stickyContainer.querySelector('#emailSearchInput');
        if (stickySearch) {
            stickySearch.id = 'emailSearchInputSticky';
            let searchTimeout;
            stickySearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                    // Synchroniser avec l'original
                    const originalSearch = document.querySelector('#emailSearchInput');
                    if (originalSearch) originalSearch.value = e.target.value;
                }, 300);
            });
        }

        // Boutons sticky
        stickyContainer.querySelectorAll('button[onclick]').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            btn.removeAttribute('onclick');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    eval(onclickAttr);
                } catch (error) {
                    console.warn('[PageManager] Erreur sticky button:', error);
                }
            });
        });
    }

    updateControlsOnly() {
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        // Mettre à jour les deux containers (original et sticky)
        ['.controls-and-filters-container', '.sticky-controls-container'].forEach(selector => {
            const container = document.querySelector(selector);
            if (!container) return;
            
            // Bouton sélection
            const selectBtn = container.querySelector('.btn-selection');
            if (selectBtn) {
                const btnText = selectBtn.querySelector('.btn-text');
                const btnCount = selectBtn.querySelector('.btn-count');
                const icon = selectBtn.querySelector('i');
                
                if (allSelected) {
                    if (btnText) btnText.textContent = 'Désélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-check-square');
                        icon.classList.add('fa-square');
                    }
                    selectBtn.classList.add('all-selected');
                } else {
                    if (btnText) btnText.textContent = 'Sélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-square');
                        icon.classList.add('fa-check-square');
                    }
                    selectBtn.classList.remove('all-selected');
                }
                
                if (btnCount) btnCount.textContent = `(${visibleEmails.length})`;
            }
            
            // Bouton créer tâches
            const createBtn = container.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
            if (createBtn) {
                const btnText = createBtn.querySelector('.btn-text');
                let countBadge = createBtn.querySelector('.count-badge');
                
                if (selectedCount === 0) {
                    createBtn.classList.add('disabled');
                    createBtn.disabled = true;
                } else {
                    createBtn.classList.remove('disabled');
                    createBtn.disabled = false;
                }
                
                if (btnText) {
                    btnText.textContent = `Créer tâche${selectedCount > 1 ? 's' : ''}`;
                }
                
                if (selectedCount > 0) {
                    if (!countBadge) {
                        countBadge = document.createElement('span');
                        countBadge.className = 'count-badge';
                        createBtn.appendChild(countBadge);
                    }
                    countBadge.textContent = selectedCount;
                } else if (countBadge) {
                    countBadge.remove();
                }
            }
            
            // Bouton actions
            const actionsBtn = container.querySelector('.dropdown-toggle');
            if (actionsBtn) {
                if (selectedCount === 0) {
                    actionsBtn.classList.add('disabled');
                    actionsBtn.disabled = true;
                } else {
                    actionsBtn.classList.remove('disabled');
                    actionsBtn.disabled = false;
                }
            }
            
            // Bouton effacer
            const existingClearBtn = container.querySelector('.btn-clear');
            const actionsSection = container.querySelector('.actions-section-unified');
            
            if (selectedCount > 0) {
                if (!existingClearBtn && actionsSection) {
                    const clearBtn = document.createElement('button');
                    clearBtn.className = 'btn-unified btn-clear';
                    clearBtn.onclick = () => window.pageManager.clearSelection();
                    clearBtn.innerHTML = `
                        <i class="fas fa-times"></i>
                        <span class="btn-text">Effacer (${selectedCount})</span>
                    `;
                    actionsSection.appendChild(clearBtn);
                } else if (existingClearBtn) {
                    const btnText = existingClearBtn.querySelector('.btn-text');
                    if (btnText) btnText.textContent = `Effacer (${selectedCount})`;
                }
            } else if (existingClearBtn) {
                existingClearBtn.remove();
            }
        });
    }

    refreshEmailsView() {
        // Sauvegarder l'état des groupes ouverts
        const expandedGroups = new Set();
        document.querySelectorAll('.email-group-unified.expanded').forEach(group => {
            const groupKey = group.dataset.groupKey;
            if (groupKey) expandedGroups.add(groupKey);
        });
        
        // Mettre à jour le contenu
        const emailsContainer = document.querySelector('.emails-container-unified');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
            
            // Restaurer les groupes ouverts
            expandedGroups.forEach(groupKey => {
                this.toggleGroup(groupKey, null);
            });
        }
        
        // Mettre à jour les contrôles
        this.updateControlsOnly();
        
        // Synchroniser les sticky controls
        this.setupStickyControls();
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            this.clearEmailsCache();
            
            // Recatégoriser les emails existants
            if (window.emailScanner && window.emailScanner.emails?.length > 0) {
                await window.emailScanner.recategorizeEmails();
            }
            
            this.refreshEmailsView();
            
            const providerName = this.currentProvider === 'google' ? 'Gmail' : 'Outlook';
            window.uiManager?.showToast(`Emails ${providerName} actualisés`, 'success');
            
        } catch (error) {
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
        } finally {
            window.uiManager?.hideLoading();
        }
    }

    renderEmptyEmailsState() {
        const providerName = this.currentProvider === 'google' ? 'Gmail' : 'Outlook';
        
        return `
            <div class="empty-state-unified">
                <div class="empty-icon-unified">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-title-unified">Aucun email ${providerName} trouvé</h3>
                <p class="empty-text-unified">
                    Utilisez le scanner pour récupérer et analyser vos emails ${providerName}.
                </p>
                <button class="btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    <span>Aller au scanner</span>
                </button>
            </div>
        `;
    }

    scheduleAutoAnalysis(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        const emailsToAnalyze = emails
            .filter(email => this.taskPreselectedCategories.includes(email.category))
            .slice(0, 5);
        
        if (emailsToAnalyze.length > 0) {
            setTimeout(() => {
                this.analyzeEmailsInBackground(emailsToAnalyze);
            }, 1000);
        }
    }

    // ================================================
    // MODALES UNIFIÉES GMAIL/OUTLOOK
    // ================================================
    
    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        let analysis;
        try {
            window.uiManager?.showLoading('Analyse IA de l\'email...');
            analysis = await window.aiTaskAnalyzer?.analyzeEmailForTasks(email, { useApi: true });
            this.aiAnalysisResults.set(emailId, analysis);
            window.uiManager?.hideLoading();
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'analyse IA', 'error');
            return;
        }

        const uniqueId = 'task_creation_modal_' + Date.now();
        const modalHTML = this.buildUnifiedTaskModal(uniqueId, email, analysis);

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildUnifiedTaskModal(uniqueId, email, analysis) {
        const sender = this.getUnifiedSender(email);
        const senderEmail = this.getUnifiedSenderEmail(email);
        const providerName = email.provider === 'google' ? 'Gmail' : 'Outlook';
        const providerIcon = email.provider === 'google' ? 'google' : 'microsoft';
        const providerColor = email.provider === 'google' ? '#4285f4' : '#0078d7';
        
        return `
            <div id="${uniqueId}" class="modal-overlay-unified">
                <div class="modal-container-unified">
                    <div class="modal-header-unified">
                        <div class="modal-title-section">
                            <h2 class="modal-title">Créer une tâche depuis ${providerName}</h2>
                            <div class="modal-provider-badge" style="background: ${providerColor}20; color: ${providerColor};">
                                <i class="fab fa-${providerIcon}"></i>
                                <span>${providerName}</span>
                            </div>
                        </div>
                        <button class="modal-close-btn" onclick="window.pageManager.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content-unified">
                        ${this.buildUnifiedTaskForm(email, analysis, providerName)}
                    </div>
                    
                    <div class="modal-footer-unified">
                        <button class="btn-secondary" onclick="window.pageManager.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                            <span>Annuler</span>
                        </button>
                        <button class="btn-primary" onclick="window.pageManager.createTaskFromModal('${email.id}'); window.pageManager.closeModal('${uniqueId}')">
                            <i class="fas fa-check"></i>
                            <span>Créer la tâche</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    buildUnifiedTaskForm(email, analysis, providerName) {
        const sender = this.getUnifiedSender(email);
        const senderEmail = this.getUnifiedSenderEmail(email);
        const enhancedTitle = analysis.mainTask?.title?.includes(sender) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask?.title || 'Tâche'} - ${sender}`;
        
        return `
            <div class="task-form-unified">
                <!-- AI Badge -->
                <div class="ai-analysis-badge">
                    <i class="fas fa-robot"></i>
                    <span>Analyse intelligente par Claude AI</span>
                </div>
                
                <!-- Email Source -->
                <div class="email-source-card">
                    <div class="source-avatar" style="background: ${this.generateAvatarColor(sender)}">
                        ${sender.charAt(0).toUpperCase()}
                    </div>
                    <div class="source-info">
                        <div class="source-name">${this.escapeHtml(sender)}</div>
                        <div class="source-email">${this.escapeHtml(senderEmail)}</div>
                        <div class="source-subject">${this.escapeHtml(email.subject || 'Sans sujet')}</div>
                    </div>
                    <div class="source-provider">
                        <i class="fab fa-${email.provider === 'google' ? 'google' : 'microsoft'}"></i>
                        <span>${providerName}</span>
                    </div>
                </div>
                
                <!-- Form Fields -->
                <div class="form-grid-unified">
                    <div class="form-field-unified">
                        <label class="form-label-unified">Titre de la tâche</label>
                        <input type="text" 
                               id="task-title" 
                               class="form-input-unified"
                               value="${this.escapeHtml(enhancedTitle)}" 
                               placeholder="Titre de la tâche">
                    </div>
                    
                    <div class="form-field-unified">
                        <label class="form-label-unified">Description</label>
                        <textarea id="task-description" 
                                  class="form-textarea-unified"
                                  rows="4"
                                  placeholder="Description détaillée...">${this.escapeHtml(analysis.mainTask?.description || analysis.summary || '')}</textarea>
                    </div>
                    
                    <div class="form-row-unified">
                        <div class="form-field-unified">
                            <label class="form-label-unified">Priorité</label>
                            <select id="task-priority" class="form-select-unified">
                                <option value="urgent" ${analysis.mainTask?.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                                <option value="high" ${analysis.mainTask?.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${analysis.mainTask?.priority === 'medium' || !analysis.mainTask?.priority ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${analysis.mainTask?.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>
                        
                        <div class="form-field-unified">
                            <label class="form-label-unified">Date d'échéance</label>
                            <input type="date" 
                                   id="task-duedate" 
                                   class="form-input-unified"
                                   value="${analysis.mainTask?.dueDate || ''}">
                        </div>
                    </div>
                    
                    <!-- Aperçu email -->
                    <div class="email-preview-section">
                        <button type="button" 
                                class="preview-toggle-btn" 
                                onclick="window.pageManager.toggleEmailPreview()">
                            <i class="fas fa-chevron-right" id="preview-toggle-icon"></i>
                            <span>Voir le contenu original de l'email ${providerName}</span>
                        </button>
                        <div id="email-preview-content" class="email-preview-content" style="display: none;">
                            <div class="preview-header">
                                <div><strong>De:</strong> ${this.escapeHtml(sender)} &lt;${this.escapeHtml(senderEmail)}&gt;</div>
                                <div><strong>Date:</strong> ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</div>
                                <div><strong>Sujet:</strong> ${this.escapeHtml(email.subject || 'Sans sujet')}</div>
                                <div><strong>Source:</strong> ${providerName}</div>
                            </div>
                            <div class="preview-body">
                                ${this.getEmailContentForPreview(email)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'email_modal_' + Date.now();
        const providerName = email.provider === 'google' ? 'Gmail' : 'Outlook';
        const providerIcon = email.provider === 'google' ? 'google' : 'microsoft';
        const providerColor = email.provider === 'google' ? '#4285f4' : '#0078d7';
        const sender = this.getUnifiedSender(email);
        const senderEmail = this.getUnifiedSenderEmail(email);
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay-unified">
                <div class="modal-container-unified large">
                    <div class="modal-header-unified">
                        <div class="modal-title-section">
                            <h2 class="modal-title">Email ${providerName}</h2>
                            <div class="modal-provider-badge" style="background: ${providerColor}20; color: ${providerColor};">
                                <i class="fab fa-${providerIcon}"></i>
                                <span>${providerName}</span>
                            </div>
                        </div>
                        <button class="modal-close-btn" onclick="window.pageManager.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content-unified">
                        <div class="email-details-card">
                            <div class="email-header-details">
                                <div class="sender-section">
                                    <div class="sender-avatar-large" style="background: ${this.generateAvatarColor(sender)}">
                                        ${sender.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="sender-details">
                                        <div class="sender-name-large">${this.escapeHtml(sender)}</div>
                                        <div class="sender-email-large">${this.escapeHtml(senderEmail)}</div>
                                        <div class="email-date-large">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</div>
                                    </div>
                                </div>
                                
                                <div class="email-meta-details">
                                    ${email.category && email.category !== 'other' ? `
                                        <div class="meta-item">
                                            <span class="meta-label">Catégorie:</span>
                                            <span class="category-badge-large" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)};">
                                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                            </span>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="meta-item">
                                        <span class="meta-label">Source:</span>
                                        <span class="provider-badge-small" style="background: ${providerColor}20; color: ${providerColor};">
                                            <i class="fab fa-${providerIcon}"></i>
                                            ${providerName}
                                        </span>
                                    </div>
                                    
                                    ${email.hasAttachments ? `
                                        <div class="meta-item">
                                            <span class="meta-label">Pièces jointes:</span>
                                            <span class="attachment-badge">
                                                <i class="fas fa-paperclip"></i>
                                                Oui
                                            </span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <div class="email-subject-large">
                                ${this.escapeHtml(email.subject || 'Sans sujet')}
                            </div>
                            
                            <div class="email-body-container">
                                ${this.getEmailContentForPreview(email)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer-unified">
                        <button class="btn-secondary" onclick="window.pageManager.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                            <span>Fermer</span>
                        </button>
                        ${!this.createdTasks.has(emailId) ? `
                            <button class="btn-primary" onclick="window.pageManager.closeModal('${uniqueId}'); window.pageManager.showTaskCreationModal('${emailId}')">
                                <i class="fas fa-tasks"></i>
                                <span>Créer une tâche</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = 'auto';
    }

    toggleEmailPreview() {
        const content = document.getElementById('email-preview-content');
        const icon = document.getElementById('preview-toggle-icon');
        
        if (!content || !icon) return;
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
        }
    }

    async createTaskFromModal(emailId) {
        const email = this.getEmailById(emailId);
        const analysis = this.aiAnalysisResults.get(emailId);
        
        if (!email || !analysis) {
            window.uiManager?.showToast('Données manquantes', 'error');
            return;
        }

        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-duedate')?.value;

        if (!title) {
            window.uiManager?.showToast('Le titre est requis', 'warning');
            return;
        }

        try {
            const taskData = this.buildUnifiedTaskData(email, {
                ...analysis,
                mainTask: {
                    ...analysis.mainTask,
                    title,
                    description,
                    priority,
                    dueDate
                }
            });

            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager?.saveTasks();
                
                const providerName = email.provider === 'google' ? 'Gmail' : 'Outlook';
                window.uiManager?.showToast(`Tâche créée depuis ${providerName}`, 'success');
                this.refreshEmailsView();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager?.showToast('Erreur lors de la création', 'error');
        }
    }

    getEmailContentForPreview(email) {
        if (email.body?.content) {
            return email.body.content;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu disponible')}</p>`;
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => {
                if (window.tasksView?.showTaskDetails) {
                    window.tasksView.showTaskDetails(taskId);
                }
            }, 100);
        });
    }

    // ================================================
    // AUTRES PAGES UNIFIÉES
    // ================================================
    
    async renderScanner(container) {
        console.log('[PageManager] Rendu page scanner...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule:', error);
            }
        }
        
        // Fallback scanner
        const provider = this.detectCurrentProvider();
        const providerName = provider === 'google' ? 'Gmail' : 'Outlook';
        
        container.innerHTML = `
            <div class="page-container-unified">
                <div class="scanner-fallback-card">
                    <div class="scanner-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h2>Scanner ${providerName}</h2>
                    <p>Module de scan en cours de chargement...</p>
                    
                    ${provider ? `
                        <div class="provider-status">
                            <i class="fab fa-${provider === 'google' ? 'google' : 'microsoft'}"></i>
                            <span>Connecté à ${providerName}</span>
                        </div>
                    ` : `
                        <div class="auth-required">
                            <p>Connexion requise pour scanner</p>
                            <div class="auth-buttons">
                                <button class="btn-auth btn-microsoft" onclick="window.authService?.login()">
                                    <i class="fab fa-microsoft"></i>
                                    <span>Microsoft</span>
                                </button>
                                <button class="btn-auth btn-google" onclick="window.googleAuthService?.login()">
                                    <i class="fab fa-google"></i>
                                    <span>Google</span>
                                </button>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    async renderTasks(container) {
        if (window.tasksView && typeof window.tasksView.render === 'function') {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="page-container-unified">
                    <div class="page-header-unified">
                        <h1>Tâches</h1>
                        <p>Gérez vos tâches créées depuis Gmail et Outlook</p>
                    </div>
                    
                    <div class="empty-state-unified">
                        <div class="empty-icon-unified">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <h3 class="empty-title-unified">Aucune tâche</h3>
                        <p class="empty-text-unified">Créez des tâches à partir de vos emails</p>
                        <button class="btn-primary" onclick="window.pageManager.loadPage('emails')">
                            <i class="fas fa-envelope"></i>
                            <span>Voir les emails</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        if (window.categoriesPage && typeof window.categoriesPage.renderSettings === 'function') {
            window.categoriesPage.renderSettings(container);
        } else {
            const categories = window.categoryManager?.getCategories() || {};
            
            container.innerHTML = `
                <div class="page-container-unified">
                    <div class="page-header-unified">
                        <h1>Catégories</h1>
                        <p>Configurez la catégorisation automatique de vos emails</p>
                    </div>
                    
                    <div class="categories-grid-unified">
                        ${Object.entries(categories).map(([id, cat]) => `
                            <div class="category-card-unified">
                                <div class="category-icon-large" style="background: ${cat.color}20; color: ${cat.color}">
                                    ${cat.icon}
                                </div>
                                <h3 class="category-name">${cat.name}</h3>
                                <p class="category-description">${cat.description || 'Catégorie personnalisée'}</p>
                                <div class="category-status">
                                    ${cat.isCustom ? 
                                        '<span class="status-badge custom">Personnalisée</span>' : 
                                        '<span class="status-badge system">Système</span>'
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    async renderSettings(container) {
        container.innerHTML = `
            <div class="page-container-unified">
                <div class="page-header-unified">
                    <h1>Paramètres</h1>
                    <p>Configuration générale de l'application</p>
                </div>
                
                <div class="settings-sections">
                    <div class="settings-card">
                        <h3>Configuration IA</h3>
                        <p>Configurez l'assistant IA Claude pour l'analyse des emails</p>
                        <button class="btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                            <i class="fas fa-cog"></i>
                            <span>Configurer Claude AI</span>
                        </button>
                    </div>
                    
                    <div class="settings-card">
                        <h3>Providers Email</h3>
                        <p>État des connexions Gmail et Outlook</p>
                        <div class="provider-status-list">
                            <div class="provider-item">
                                <i class="fab fa-google"></i>
                                <span>Gmail</span>
                                <span class="status ${this.isGoogleAuthenticated() ? 'connected' : 'disconnected'}">
                                    ${this.isGoogleAuthenticated() ? 'Connecté' : 'Déconnecté'}
                                </span>
                            </div>
                            <div class="provider-item">
                                <i class="fab fa-microsoft"></i>
                                <span>Outlook</span>
                                <span class="status ${this.isMicrosoftAuthenticated() ? 'connected' : 'disconnected'}">
                                    ${this.isMicrosoftAuthenticated() ? 'Connecté' : 'Déconnecté'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderRanger(container) {
        if (window.domainOrganizer && typeof window.domainOrganizer.showPage === 'function') {
            window.domainOrganizer.showPage(container);
        } else {
            container.innerHTML = `
                <div class="page-container-unified">
                    <div class="page-header-unified">
                        <h1>Ranger par domaine</h1>
                        <p>Organisez vos emails par domaine d'expéditeur</p>
                    </div>
                    
                    <div class="empty-state-unified">
                        <div class="empty-icon-unified">
                            <i class="fas fa-folder-tree"></i>
                        </div>
                        <h3 class="empty-title-unified">Module de rangement</h3>
                        <p class="empty-text-unified">Module en cours de chargement...</p>
                    </div>
                </div>
            `;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES D'AUTHENTIFICATION
    // ================================================
    
    isGoogleAuthenticated() {
        try {
            return window.googleAuthService && 
                   typeof window.googleAuthService.isAuthenticated === 'function' &&
                   window.googleAuthService.isAuthenticated();
        } catch (error) {
            return false;
        }
    }

    isMicrosoftAuthenticated() {
        try {
            return window.authService && 
                   typeof window.authService.isAuthenticated === 'function' &&
                   window.authService.isAuthenticated();
        } catch (error) {
            return false;
        }
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    
    cleanup() {
        // Nettoyer les intervals
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Nettoyer les listeners
        this.syncListeners.clear();
        
        // Nettoyer les caches
        this.clearEmailsCache();
        this.categoriesCache.clear();
        
        // Réinitialiser les états
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        
        console.log('[PageManager] 🧹 Nettoyage effectué');
    }

    destroy() {
        this.cleanup();
        this.currentPage = null;
        this.currentProvider = null;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        console.log('[PageManager] Instance détruite');
    }
}

    getVisibleEmails() {
        const emails = this.getAllEmails();
        let filteredEmails = emails;
        
        // Filtre par catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                });
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
            }
        }
        
        // Filtre par recherche
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return filteredEmails;
    }

    matchesSearch(email, searchTerm) {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        const subject = (email.subject || '').toLowerCase();
        
        // Gestion unifiée des expéditeurs Gmail/Outlook
        let senderName = '';
        let senderEmail = '';
        
        if (email.provider === 'google') {
            // Format Gmail - from peut être une string
            const fromString = email.from?.emailAddress?.address || email.from || '';
            const match = fromString.match(/<(.+@.+)>/);
            senderEmail = match ? match[1] : fromString;
            senderName = fromString.includes('<') ? fromString.split('<')[0].trim() : fromString;
        } else {
            // Format Microsoft Graph
            senderName = email.from?.emailAddress?.name || '';
            senderEmail = email.from?.emailAddress?.address || '';
        }
        
        const preview = (email.bodyPreview || '').toLowerCase();
        
        return subject.includes(search) || 
               senderName.toLowerCase().includes(search) || 
               senderEmail.toLowerCase().includes(search) || 
               preview.includes(search);
    }

    calculateCategoryCounts(emails) {
        const counts = {};
        let uncategorizedCount = 0;
        
        emails.forEach(email => {
            const cat = email.category;
            
            if (cat && cat !== 'other' && cat !== null && cat !== undefined && cat !== '') {
                counts[cat] = (counts[cat] || 0) + 1;
            } else {
                uncategorizedCount++;
            }
        });
        
        if (uncategorizedCount > 0) {
            counts.other = uncategorizedCount;
        }
        
        return counts;
    }

    // ... Continuer avec toutes les autres méthodes unifiées ...

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'PageManager',
                    timestamp: Date.now(),
                    provider: this.currentProvider
                }
            }));
        } catch (error) {
            console.error(`[PageManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    getDebugInfo() {
        return {
            version: '13.0',
            currentPage: this.currentPage,
            currentProvider: this.currentProvider,
            providerState: this.providerState,
            selectedEmailsCount: this.selectedEmails.size,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            emailsCacheSize: this.emailsCache.size,
            lastCacheUpdate: this.lastCacheUpdate,
            lastSettingsSync: this.lastSettingsSync,
            authServices: {
                google: {
                    available: !!window.googleAuthService,
                    authenticated: window.googleAuthService?.isAuthenticated() || false
                },
                microsoft: {
                    available: !!window.authService,
                    authenticated: window.authService?.isAuthenticated() || false
                }
            },
            mailService: {
                available: !!window.mailService,
                initialized: window.mailService?.isInitialized || false,
                provider: window.mailService?.provider || null
            }
        };
    }

    // ================================================
    // AJOUT DES STYLES CSS UNIFIÉS
    // ================================================
    addUnifiedEmailStyles() {
        if (document.getElementById('unifiedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'unifiedEmailStyles';
        styles.textContent = `
            /* Styles CSS unifiés pour Gmail/Outlook */
            :root {
                --primary-color: #6366f1;
                --secondary-color: #8b5cf6;
                --success-color: #10b981;
                --warning-color: #f59e0b;
                --danger-color: #ef4444;
                --google-color: #4285f4;
                --microsoft-color: #0078d7;
                --border-radius: 12px;
                --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                --transition: all 0.2s ease;
            }

            .emails-page-unified {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 20px;
            }

            .provider-badge-unified {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 16px;
                border: 2px solid;
            }

            .provider-badge-unified.google {
                background: rgba(66, 133, 244, 0.1);
                color: var(--google-color);
                border-color: rgba(66, 133, 244, 0.3);
            }

            .provider-badge-unified.microsoft {
                background: rgba(0, 120, 215, 0.1);
                color: var(--microsoft-color);
                border-color: rgba(0, 120, 215, 0.3);
            }

            .email-count {
                background: rgba(255, 255, 255, 0.8);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 700;
            }

            .explanation-text-unified {
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.2);
                border-radius: var(--border-radius);
                padding: 16px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #3730a3;
                font-size: 14px;
                line-height: 1.5;
                position: relative;
            }

            .explanation-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.2);
                color: #3730a3;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: var(--transition);
            }

            .explanation-close-btn:hover {
                background: rgba(99, 102, 241, 0.2);
                transform: scale(1.1);
            }

            .controls-and-filters-container {
                margin-bottom: 16px;
            }

            .controls-bar-unified {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: var(--border-radius);
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: var(--shadow);
                display: flex;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
            }

            .search-section-unified {
                flex: 1;
                min-width: 250px;
            }

            .search-box-unified {
                position: relative;
            }

            .search-input-unified {
                width: 100%;
                height: 44px;
                padding: 0 16px 0 44px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 14px;
                background: #f9fafb;
                transition: var(--transition);
                outline: none;
            }

            .search-input-unified:focus {
                border-color: var(--primary-color);
                background: white;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .search-icon-unified {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #6b7280;
                pointer-events: none;
            }

            .search-clear-unified {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--danger-color);
                color: white;
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 10px;
                transition: var(--transition);
            }

            .search-clear-unified:hover {
                background: #dc2626;
            }

            .view-modes-unified {
                display: flex;
                background: #f8fafc;
                border-radius: 10px;
                padding: 3px;
                gap: 2px;
            }

            .view-mode-unified {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: 7px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
            }

            .view-mode-unified:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
            }

            .view-mode-unified.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .actions-section-unified {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .btn-unified {
                height: 44px;
                padding: 0 16px;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 6px;
                border: 1px solid #e5e7eb;
                background: white;
                color: #374151;
                position: relative;
                white-space: nowrap;
            }

            .btn-unified:hover:not(.disabled) {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .btn-unified.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            .btn-unified.btn-primary {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                border-color: transparent;
            }

            .btn-unified.btn-secondary {
                background: #f8fafc;
                color: #475569;
            }

            .btn-unified.btn-selection {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #0ea5e9;
            }

            .btn-unified.btn-selection.all-selected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }

            .btn-unified.btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }

            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--danger-color);
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 8px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
            }

            .filters-bar-unified {
                display: flex;
                gap: 8px;
                overflow-x: auto;
                padding: 4px;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .filters-bar-unified::-webkit-scrollbar {
                display: none;
            }

            .filter-tab-unified {
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 12px;
                cursor: pointer;
                transition: var(--transition);
                min-width: 100px;
                position: relative;
                flex-shrink: 0;
            }

            .filter-tab-unified:hover {
                border-color: var(--primary-color);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
            }

            .filter-tab-unified.active {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                border-color: var(--primary-color);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }

            .filter-tab-unified.preselected {
                border-color: var(--secondary-color);
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05));
            }

            .filter-tab-unified.active.preselected {
                background: linear-gradient(135deg, var(--secondary-color), #7c3aed);
            }

            .tab-content-unified {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                width: 100%;
            }

            .tab-header-unified {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .tab-icon-unified {
                font-size: 16px;
            }

            .tab-count-unified {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 800;
                min-width: 18px;
                text-align: center;
            }

            .filter-tab-unified.active .tab-count-unified {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }

            .tab-name-unified {
                font-size: 11px;
                font-weight: 700;
                text-align: center;
                line-height: 1.2;
            }

            .preselected-star-unified {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--secondary-color);
                color: white;
                font-size: 10px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(139, 92, 246, 0.4);
            }

            .sticky-controls-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                padding: 20px;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                opacity: 0;
                visibility: hidden;
            }

            .sticky-controls-container.sticky-active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }

            .emails-container-unified {
                background: white;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow);
                overflow: hidden;
            }

            /* Responsive */
            @media (max-width: 1024px) {
                .controls-bar-unified {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }

                .search-section-unified {
                    order: 1;
                    min-width: auto;
                }

                .view-modes-unified {
                    order: 2;
                    justify-content: space-around;
                }

                .actions-section-unified {
                    order: 3;
                    justify-content: center;
                }

                .filters-bar-unified {
                    gap: 4px;
                }

                .filter-tab-unified {
                    min-width: 80px;
                    padding: 8px;
                }
            }

            @media (max-width: 768px) {
                .emails-page-unified {
                    padding: 12px;
                }

                .btn-unified .btn-text {
                    display: none;
                }

                .view-mode-unified span {
                    display: none;
                }

                .actions-section-unified {
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .btn-unified {
                    min-width: 44px;
                    padding: 0 8px;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    addAuthStyles() {
        if (document.getElementById('authStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'authStyles';
        styles.textContent = `
            .page-container-unified {
                min-height: calc(100vh - 120px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .auth-required-card, .error-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 50px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 600px;
                width: 100%;
            }

            .auth-icon, .error-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 25px;
                color: white;
                font-size: 32px;
            }

            .error-icon {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }

            .auth-title, .error-title {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
            }

            .auth-subtitle, .error-message {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 30px;
            }

            .auth-buttons, .error-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 25px;
            }

            .btn-auth, .btn-primary, .btn-secondary {
                height: 50px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                text-decoration: none;
            }

            .btn-auth.btn-microsoft {
                background: linear-gradient(135deg, #0078d7 0%, #106ebe 100%);
                color: white;
            }

            .btn-auth.btn-google {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
                color: white;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .btn-auth:hover, .btn-primary:hover, .btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            }

            .auth-info {
                background: rgba(102, 126, 234, 0.1);
                border-radius: 10px;
                padding: 15px;
                font-size: 14px;
                color: #667eea;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-weight: 500;
            }

            @media (max-width: 480px) {
                .auth-required-card, .error-card {
                    padding: 30px 20px;
                }

                .auth-title, .error-title {
                    font-size: 24px;
                }

                .auth-subtitle, .error-message {
                    font-size: 14px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================

// Nettoyer l'ancienne instance
if (window.pageManager) {
    if (typeof window.pageManager.cleanup === 'function') {
        window.pageManager.cleanup();
    }
}

// Créer la nouvelle instance
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v13.0 loaded - Intégration Gmail/Outlook Unifiée et Robuste');
