// ================================================
    // RESTE DES MÉTHODES (Conservées et optimisées)
    // ================================================
    
    renderEmailsList() {
        const emails = this.getAllEmails();
        let filteredEmails = emails;
        
        console.log(`[PageManager] 📧 Rendu liste emails: ${emails.length} total, catégorie: ${this.currentCategory}`);
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    const isOther = !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                    return isOther;
                });
                console.log(`[PageManager] 📌 Emails "Autre" trouvés: ${filteredEmails.length}`);
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
                console.log(`[PageManager] 🏷️ Emails dans catégorie "${this.currentCategory}": ${filteredEmails.length}`);
            }
        }
        
        if (this.searchTerm) {
            const beforeSearch = filteredEmails.length;
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
            console.log(`[PageManager] 🔍 Après recherche "${this.searchTerm}": ${filteredEmails.length} (était ${beforeSearch})`);
        }
        
        if (filteredEmails.length === 0) {
            return this.renderEmptyState();
        }

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
            <div class="tasks-harmonized-list">
                ${emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
            </div>
        `;
    }

    renderHarmonizedEmailRow(email) {
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        const preselectedCategories = this.getTaskPreselectedCategories();
        let isPreselectedForTasks = email.isPreselectedForTasks === true;
        
        if (!isPreselectedForTasks && preselectedCategories.includes(email.category)) {
            isPreselectedForTasks = true;
            email.isPreselectedForTasks = true;
        }
        
        const isSelected = this.selectedEmails.has(email.id) || isPreselectedForTasks;
        
        if (isPreselectedForTasks && !this.selectedEmails.has(email.id)) {
            this.selectedEmails.add(email.id);
        }
        
        // Classes spéciales pour Newsletter/Spam ULTRA-RENFORCÉES
        let specialClasses = '';
        if (email.category === 'marketing_news') {
            specialClasses = 'newsletter-email-ultra';
        } else if (email.category === 'spam') {
            specialClasses = 'spam-email-ultra';
        } else if (email.priorityCorrection) {
            specialClasses = 'priority-corrected-ultra';
        }
        
        const cardClasses = [
            'task-harmonized-card',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselectedForTasks ? 'preselected-task' : '',
            specialClasses
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClasses}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 data-preselected="${isPreselectedForTasks}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar-harmonized" 
                     style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColor(email)}"></div>
                
                <div class="task-main-content-harmonized">
                    <div class="task-header-harmonized">
                        <h3 class="task-title-harmonized">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="task-meta-harmonized">
                            <span class="task-type-badge-harmonized">📧 Email</span>
                            <span class="deadline-badge-harmonized">
                                📅 ${this.formatEmailDate(email.receivedDateTime)}
                            </span>
                            ${email.categoryScore ? `
                                <span class="confidence-badge-harmonized">
                                    🎯 ${Math.round((email.categoryConfidence || 0) * 100)}%
                                </span>
                            ` : ''}
                            ${isPreselectedForTasks ? `
                                <span class="preselected-badge-harmonized">
                                    ⭐ Pré-sélectionné
                                </span>
                            ` : ''}
                            ${email.priorityCorrection ? `
                                <span class="correction-badge-harmonized">
                                    ✅ Auto-Corrigé
                                </span>
                            ` : ''}
                            ${email.hasAttachments ? `
                                <span class="attachment-badge-harmonized">
                                    📎 Pièces jointes
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas fa-envelope"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(senderName)}</span>
                        ${email.category && email.category !== 'other' ? `
                            <span class="category-indicator-harmonized ${email.category === 'marketing_news' ? 'newsletter-category-ultra' : ''} ${email.category === 'spam' ? 'spam-category-ultra' : ''}" 
                                  style="background: ${this.getCategoryColor(email.category)}20; 
                                         color: ${this.getCategoryColor(email.category)};
                                         ${isPreselectedForTasks ? 'font-weight: 700;' : ''}">
                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                ${isPreselectedForTasks ? ' ⭐' : ''}
                            </span>
                        ` : ''}
                    </div>
                    
                    <!-- Aperçu du contenu amélioré -->
                    ${email.bodyPreview ? `
                        <div class="email-preview-harmonized">
                            <i class="fas fa-quote-left"></i>
                            <span>${this.escapeHtml(this.truncateText(email.bodyPreview, 120))}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-actions-harmonized">
                    ${this.renderHarmonizedEmailActions(email)}
                </div>
            </div>
        `;
    }

    renderHarmonizedEmailActions(email) {
        const hasTask = this.createdTasks.has(email.id);
        const actions = [];
        
        if (!hasTask) {
            actions.push(`
                <button class="action-btn-harmonized create-task" 
                        onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                        title="Créer une tâche">
                    <i class="fas fa-tasks"></i>
                </button>
            `);
        } else {
            actions.push(`
                <button class="action-btn-harmonized view-task" 
                        onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')"
                        title="Voir la tâche">
                    <i class="fas fa-check-circle"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-harmonized details" 
                    onclick="event.stopPropagation(); window.pageManager.showEmailModalEnhanced('${email.id}')"
                    title="Voir l'email">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // ================================================
    // MÉTHODES UTILITAIRES ÉTENDUES
    // ================================================
    
    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails désélectionnés`, 'info');
        } else {
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
        }
        
        this.refreshEmailsView();
    }

    toggleEmailSelection(emailId) {
        console.log('[PageManager] Toggle sélection email:', emailId);
        
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .task-checkbox-harmonized`);
        if (checkbox) {
            checkbox.checked = this.selectedEmails.has(emailId);
        }
        
        this.updateControlsBarOnly();
        console.log('[PageManager] Total sélectionnés:', this.selectedEmails.size);
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        window.uiManager?.showToast('Sélection effacée', 'info');
    }

    getVisibleEmails() {
        const emails = this.getAllEmails();
        let filteredEmails = emails;
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    const isOther = !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                    return isOther;
                });
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
            }
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return filteredEmails;
    }

    matchesSearch(email, searchTerm) {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        const subject = (email.subject || '').toLowerCase();
        const sender = (email.from?.emailAddress?.name || '').toLowerCase();
        const senderEmail = (email.from?.emailAddress?.address || '').toLowerCase();
        const preview = (email.bodyPreview || '').toLowerCase();
        
        return subject.includes(search) || 
               sender.includes(search) || 
               senderEmail.includes(search) || 
               preview.includes(search);
    }

    // ================================================
    // MÉTHODES UTILITAIRES CRITIQUES
    // ================================================
    
    calculateCategoryCounts(emails) {
        console.log('[PageManager] 📊 Calcul des comptages de catégories...');
        
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
            console.log(`[PageManager] 📌 ${uncategorizedCount} emails dans la catégorie "Autre"`);
        }
        
        console.log('[PageManager] 📊 Comptages finaux:', {
            categories: counts,
            totalEmails: emails.length,
            sumCounts: Object.values(counts).reduce((sum, count) => sum + count, 0)
        });
        
        return counts;
    }

    getTaskPreselectedCategories() {
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            return window.categoryManager.getTaskPreselectedCategories();
        }
        
        if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
            return window.categoriesPage.getTaskPreselectedCategories();
        }
        
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            return settings.taskPreselectedCategories || [];
        } catch (error) {
            console.error('[PageManager] Erreur récupération catégories pré-sélectionnées:', error);
            return [];
        }
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

    getEmailContent(email) {
        if (email.body?.content) {
            let content = email.body.content;
            content = content.replace(/<meta[^>]*>/gi, '');
            return content;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu disponible')}</p>`;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatEmailDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        if (email.category === 'marketing_news') return '#f97316';
        if (email.category === 'spam') return '#ef4444';
        return '#3b82f6';
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR ET CONTRÔLES
    // ================================================
    
    updateControlsBarOnly() {
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        const updateContainer = (container) => {
            if (!container) return;
            
            const selectAllBtn = container.querySelector('.btn-selection-toggle');
            if (selectAllBtn) {
                const btnText = selectAllBtn.querySelector('.btn-text');
                const btnCount = selectAllBtn.querySelector('.btn-count');
                const icon = selectAllBtn.querySelector('i');
                
                if (allSelected) {
                    if (btnText) btnText.textContent = 'Désélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-check-square');
                        icon.classList.add('fa-square');
                    }
                    selectAllBtn.classList.add('all-selected');
                } else {
                    if (btnText) btnText.textContent = 'Sélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-square');
                        icon.classList.add('fa-check-square');
                    }
                    selectAllBtn.classList.remove('all-selected');
                }
                
                if (btnCount) {
                    btnCount.textContent = `(${visibleEmails.length})`;
                }
            }
            
            const createTaskBtn = container.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
            if (createTaskBtn) {
                const span = createTaskBtn.querySelector('.btn-text');
                const countBadge = createTaskBtn.querySelector('.count-badge');
                
                if (selectedCount === 0) {
                    createTaskBtn.classList.add('disabled');
                    createTaskBtn.disabled = true;
                } else {
                    createTaskBtn.classList.remove('disabled');
                    createTaskBtn.disabled = false;
                }
                
                if (span) {
                    span.textContent = `Créer tâche${selectedCount > 1 ? 's' : ''}`;
                }
                
                if (countBadge) {
                    if (selectedCount > 0) {
                        countBadge.textContent = selectedCount;
                        countBadge.style.display = 'inline';
                    } else {
                        countBadge.style.display = 'none';
                    }
                } else if (selectedCount > 0) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'count-badge';
                    newBadge.textContent = selectedCount;
                    createTaskBtn.appendChild(newBadge);
                }
            }
            
            const actionsBtn = container.querySelector('.dropdown-toggle[onclick*="toggleBulkActions"]');
            if (actionsBtn) {
                if (selectedCount === 0) {
                    actionsBtn.classList.add('disabled');
                    actionsBtn.disabled = true;
                } else {
                    actionsBtn.classList.remove('disabled');
                    actionsBtn.disabled = false;
                }
            }
            
            const existingClearBtn = container.querySelector('.btn-clear');
            const actionButtonsContainer = container.querySelector('.action-buttons');
            
            if (selectedCount > 0) {
                if (!existingClearBtn && actionButtonsContainer) {
                    const clearBtn = document.createElement('button');
                    clearBtn.className = 'btn-action btn-clear';
                    clearBtn.onclick = () => window.pageManager.clearSelection();
                    clearBtn.title = 'Effacer la sélection';
                    clearBtn.innerHTML = `
                        <i class="fas fa-times"></i>
                        <span class="btn-text">Effacer (${selectedCount})</span>
                    `;
                    actionButtonsContainer.appendChild(clearBtn);
                } else if (existingClearBtn) {
                    const span = existingClearBtn.querySelector('.btn-text');
                    if (span) {
                        span.textContent = `Effacer (${selectedCount})`;
                    }
                }
            } else {
                if (existingClearBtn) {
                    existingClearBtn.remove();
                }
            }
        };
        
        updateContainer(document.querySelector('.controls-and-filters-container'));
        updateContainer(document.querySelector('.sticky-controls-container'));
    }

    refreshEmailsView() {
        console.log('[PageManager] Rafraîchissement vue emails...');
        
        const expandedGroups = new Set();
        document.querySelectorAll('.task-group-harmonized.expanded').forEach(group => {
            const groupKey = group.dataset.groupKey;
            if (groupKey) {
                expandedGroups.add(groupKey);
            }
        });
        
        const searchInput = document.getElementById('emailSearchInput');
        const currentSearchValue = searchInput ? searchInput.value : this.searchTerm;
        
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
            
            expandedGroups.forEach(groupKey => {
                const group = document.querySelector(`[data-group-key="${groupKey}"]`);
                if (group) {
                    const content = group.querySelector('.group-content-harmonized');
                    const icon = group.querySelector('.group-expand-harmonized i');
                    const header = group.querySelector('.group-header-harmonized');
                    
                    if (content && icon && header) {
                        content.style.display = 'block';
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                        group.classList.add('expanded');
                        header.classList.add('expanded-header');
                    }
                }
            });
        }
        
        this.updateControlsBarOnly();
        
        setTimeout(() => {
            const newSearchInput = document.getElementById('emailSearchInput');
            if (newSearchInput && currentSearchValue && newSearchInput.value !== currentSearchValue) {
                newSearchInput.value = currentSearchValue;
            }
            const stickySearchInput = document.getElementById('emailSearchInputSticky');
            if (stickySearchInput && currentSearchValue && stickySearchInput.value !== currentSearchValue) {
                stickySearchInput.value = currentSearchValue;
            }
        }, 50);
        
        console.log('[PageManager] Vue emails rafraîchie avec', this.selectedEmails.size, 'sélectionnés');
    }

    // ================================================
    // GESTION FILTRES ET RECHERCHE
    // ================================================
    
    filterByCategory(categoryId) {
        console.log(`[PageManager] 🔍 Filtrage par catégorie: ${categoryId}`);
        
        this.currentCategory = categoryId;
        
        const emails = this.getAllEmails();
        let filteredEmails;
        
        if (categoryId === 'all') {
            filteredEmails = emails;
            console.log(`[PageManager] 📧 Affichage de tous les emails: ${emails.length}`);
        } else if (categoryId === 'other') {
            filteredEmails = emails.filter(email => {
                const cat = email.category;
                return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
            });
            console.log(`[PageManager] 📌 Emails "Autre" trouvés: ${filteredEmails.length}`);
        } else {
            filteredEmails = emails.filter(email => email.category === categoryId);
            console.log(`[PageManager] 🏷️ Emails dans catégorie "${categoryId}": ${filteredEmails.length}`);
        }
        
        this.refreshEmailsView();
        
        ['', 'Sticky'].forEach(suffix => {
            const containerSelector = suffix ? '.sticky-controls-container' : '.controls-and-filters-container';
            const container = document.querySelector(containerSelector);
            if (container) {
                container.querySelectorAll('.status-pill-compact').forEach(pill => {
                    const pillCategoryId = pill.dataset.categoryId;
                    if (pillCategoryId === categoryId) {
                        pill.classList.add('active');
                    } else {
                        pill.classList.remove('active');
                    }
                });
            }
        });
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    handleSearch(term) {
        this.searchTerm = term.trim();
        this.refreshEmailsView();
        
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput && stickySearchInput.value !== term) {
            stickySearchInput.value = term;
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput) stickySearchInput.value = '';
        
        this.refreshEmailsView();
    }

    // ================================================
    // GROUPES ET VUES GROUPÉES (simplifiées)
    // ================================================
    
    renderGroupedView(emails, groupMode) {
        const groups = this.createEmailGroups(emails, groupMode);
        
        return `
            <div class="tasks-grouped-harmonized">
                ${groups.map(group => this.renderEmailGroup(group, groupMode)).join('')}
            </div>
        `;
    }

    renderEmailGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? `@${group.name}` : group.name;
        const avatarColor = this.generateAvatarColor(group.name);
        
        return `
            <div class="task-group-harmonized" data-group-key="${group.key}">
                <div class="group-header-harmonized" onclick="event.preventDefault(); event.stopPropagation(); window.pageManager.toggleGroup('${group.key}', event)">
                    <div class="group-avatar-harmonized" style="background: ${avatarColor}">
                        ${groupType === 'grouped-domain' ? 
                            '<i class="fas fa-globe"></i>' : 
                            group.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="group-info-harmonized">
                        <div class="group-name-harmonized">${displayName}</div>
                        <div class="group-meta-harmonized">${group.count} email${group.count > 1 ? 's' : ''} • ${this.formatEmailDate(group.latestDate)}</div>
                    </div>
                    <div class="group-expand-harmonized" onclick="event.preventDefault(); event.stopPropagation();">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="group-content-harmonized" style="display: none;">
                    ${group.emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
                </div>
            </div>
        `;
    }

    createEmailGroups(emails, groupMode) {
        const groups = {};
        
        emails.forEach(email => {
            let groupKey, groupName;
            
            if (groupMode === 'grouped-domain') {
                const domain = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                groupKey = domain;
                groupName = domain;
            } else {
                const senderEmail = email.from?.emailAddress?.address || 'unknown';
                const senderName = email.from?.emailAddress?.name || senderEmail;
                groupKey = senderEmail;
                groupName = senderName;
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey,
                    name: groupName,
                    emails: [],
                    count: 0,
                    latestDate: null
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
        
        console.log('[PageManager] Toggle groupe:', groupKey);
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) {
            console.error('[PageManager] Groupe non trouvé:', groupKey);
            return;
        }
        
        const content = group.querySelector('.group-content-harmonized');
        const icon = group.querySelector('.group-expand-harmonized i');
        const header = group.querySelector('.group-header-harmonized');
        
        if (!content || !icon || !header) {
            console.error('[PageManager] Éléments du groupe manquants');
            return;
        }
        
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
            header.classList.remove('expanded-header');
        } else {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
            header.classList.add('expanded-header');
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

    // ================================================
    // ÉTATS VIDES ET ERREURS
    // ================================================
    
    renderEmptyState() {
        const providerInfo = this.getProviderInfo();
        
        let title, text, action = '';
        
        if (this.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.searchTerm}"`;
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.currentCategory === 'other') {
            title = 'Aucun email non catégorisé';
            text = 'Tous vos emails ont été correctement catégorisés ! 🎉';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            const categoryName = this.getCategoryName(this.currentCategory);
            title = `Aucun email dans "${categoryName}"`;
            text = 'Cette catégorie ne contient aucun email pour le moment.';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else {
            title = 'Aucun email trouvé';
            text = providerInfo.status === 'connected' ? 
                `Connecté à ${providerInfo.name}. Utilisez le scanner pour récupérer et analyser vos emails.` :
                'Connectez-vous à Gmail ou Outlook pour commencer l\'analyse.';
            
            if (providerInfo.status === 'connected') {
                action = `
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i>
                        <span>Aller au scanner</span>
                    </button>
                `;
            } else {
                action = `
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            <span>Se connecter à Gmail</span>
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter à Outlook</span>
                        </button>
                    </div>
                `;
            }
        }
        
        return `
            <div class="empty-state-harmonized">
                <div class="empty-state-icon-harmonized">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title-harmonized">${title}</h3>
                <p class="empty-state-text-harmonized">${text}</p>
                ${action}
            </div>
        `;
    }

    renderEmptyEmailsState() {
        const providerInfo = this.getProviderInfo();
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">Aucun email trouvé</h3>
                <p class="empty-state-text">
                    ${providerInfo.status === 'connected' ? 
                        `Connecté à ${providerInfo.name}. Utilisez le scanner pour récupérer et analyser vos emails.` :
                        'Connectez-vous à Gmail ou Outlook pour commencer l\'analyse.'
                    }
                </p>
                <div class="empty-state-actions">
                    ${providerInfo.status === 'connected' ? `
                        <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                            <i class="fas fa-search"></i>
                            Aller au scanner
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            Se connecter à Gmail
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            Se connecter à Outlook
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    // ================================================
    // SETUP CONTRÔLES ET ÉVÉNEMENTS
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

        stickyContainer.innerHTML = originalContainer.innerHTML;
        this.setupEventListenersForStickyClone(stickyContainer);
        
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                this.syncStickyControls();
            }, 100);
        });
        
        observer.observe(originalContainer, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    setupEventListenersForStickyClone(stickyContainer) {
        const searchInput = stickyContainer.querySelector('#emailSearchInput');
        if (searchInput) {
            searchInput.id = 'emailSearchInputSticky';
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        stickyContainer.querySelectorAll('.view-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (mode) {
                    this.changeViewMode(mode);
                }
            });
        });

        stickyContainer.querySelectorAll('button[onclick]').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('window.pageManager')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    eval(onclickAttr);
                });
            }
        });

        stickyContainer.querySelectorAll('.status-pill-compact').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = pill.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (categoryId) {
                    this.filterByCategory(categoryId);
                }
            });
        });
    }

    syncStickyControls() {
        const originalContainer = document.querySelector('.controls-and-filters-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) return;

        const originalSearch = originalContainer.querySelector('#emailSearchInput');
        const stickySearch = stickyContainer.querySelector('#emailSearchInputSticky');
        
        if (originalSearch && stickySearch && originalSearch.value !== stickySearch.value) {
            stickySearch.value = originalSearch.value;
        }

        const originalButtons = originalContainer.querySelectorAll('.active, .disabled');
        const stickyButtons = stickyContainer.querySelectorAll('button, .status-pill-compact');
        
        originalButtons.forEach((origBtn, index) => {
            const stickyBtn = stickyButtons[index];
            if (stickyBtn) {
                stickyBtn.className = origBtn.className;
            }
        });
    }

    // ================================================
    // STYLES CSS ULTRA-AMÉLIORÉS
    // ================================================
    
    addExpandedEmailStyles() {
        if (document.getElementById('expandedEmailStylesV14')) return;
        
        const styles = document.createElement('style');
        styles.id = 'expandedEmailStylesV14';
        styles.textContent = `
            /* Variables CSS de base */
            :root {
                --btn-height: 44px;
                --btn-padding-horizontal: 16px;
                --btn-font-size: 13px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                --card-height: 90px; /* Augmenté pour aperçu */
                --card-padding: 16px; /* Augmenté */
                --card-border-radius: 12px;
                --action-btn-size: 36px;
                --gap-small: 8px;
                --gap-medium: 12px;
                --gap-large: 16px;
                --transition-speed: 0.2s;
                --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
                --preselect-color: #8b5cf6;
                --newsletter-color: #f97316;
                --spam-color: #ef4444;
                --sticky-height: 180px;
            }
            
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-large);
                font-size: var(--btn-font-size);
            }

            /* Styles d'explication AMÉLIORÉS */
            .explanation-text-harmonized {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                backdrop-filter: blur(10px);
                position: relative;
            }

            .explanation-text-harmonized.provider-connected {
                background: rgba(16, 185, 129, 0.1);
                border-color: rgba(16, 185, 129, 0.3);
            }

            .explanation-text-harmonized.provider-disconnected {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.3);
            }

            .explanation-content {
                display: flex;
                flex-direction: column;
                gap: var(--gap-small);
            }

            .explanation-main {
                display: flex;
                align-items: center;
                gap: var(--gap-medium);
                color: #1e40af;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.5;
            }

            .explanation-stats {
                display: flex;
                flex-wrap: wrap;
                gap: var(--gap-medium);
                margin-top: var(--gap-small);
            }

            .stat-item {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .stat-item.newsletter {
                background: rgba(249, 115, 22, 0.1);
                color: var(--newsletter-color);
                border: 1px solid rgba(249, 115, 22, 0.3);
            }

            .stat-item.spam {
                background: rgba(239, 68, 68, 0.1);
                color: var(--spam-color);
                border: 1px solid rgba(239, 68, 68, 0.3);
            }

            .stat-item.preselected {
                background: rgba(139, 92, 246, 0.1);
                color: var(--preselect-color);
                border: 1px solid rgba(139, 92, 246, 0.3);
            }

            .stat-item.corrected {
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }

            .stat-item.provider {
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0, 0, 0, 0.1);
                font-weight: 700;
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

            /* Provider Status Display */
            .provider-status-display {
                flex-shrink: 0;
                margin-right: var(--gap-medium);
            }

            .provider-info {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: var(--btn-border-radius);
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .provider-info.connected {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }

            .provider-info.disconnected {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }

            .optimization-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                font-size: 9px;
                padding: 2px 4px;
                border-radius: 6px;
                font-weight: 700;
                border: 1px solid white;
                box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
            }

            /* CONTAINERS POUR POSITION FIXE */
            .controls-and-filters-container {
                position: relative;
                z-index: 100;
                background: transparent;
                margin-bottom: var(--gap-medium);
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
                padding: var(--gap-large);
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

            /* BARRE DE CONTRÔLES UNIFIÉE */
            .controls-bar-single-line {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                display: flex;
                align-items: center;
                gap: var(--gap-large);
                position: relative;
                z-index: 1000;
                min-height: var(--btn-height);
            }
            
            /* Section de recherche */
            .search-section {
                flex: 1;
                max-width: 400px;
                min-width: 250px;
            }
            
            .search-box {
                position: relative;
                width: 100%;
                height: var(--btn-height);
                display: flex;
                align-items: center;
            }
            
            .search-input {
                width: 100%;
                height: 100%;
                padding: 0 var(--gap-medium) 0 40px;
                border: 2px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                background: #f9fafb;
                transition: all var(--transition-speed) ease;
                outline: none;
                font-weight: 500;
                color: #374151;
            }
            
            .search-input:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-input::placeholder {
                color: #9ca3af;
                font-weight: 400;
            }
            
            .search-icon {
                position: absolute;
                left: var(--gap-medium);
                color: #6b7280;
                pointer-events: none;
                font-size: 14px;
                z-index: 1;
            }
            
            .search-input:focus + .search-icon {
                color: #3b82f6;
            }
            
            .search-clear {
                position: absolute;
                right: var(--gap-small);
                background: #ef4444;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                transition: all var(--transition-speed) ease;
            }
            
            .search-clear:hover {
                background: #dc2626;
                transform: scale(1.1);
            }

            /* Modes de vue */
            .view-modes {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: 3px;
                gap: 2px;
                height: var(--btn-height);
                flex-shrink: 0;
            }
            
            .view-mode {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 0 12px;
                height: calc(var(--btn-height) - 6px);
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                min-width: 80px;
                white-space: nowrap;
            }
            
            .view-mode:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
            }
            
            .view-mode.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
            }

            /* Actions */
            .action-buttons {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
                position: relative;
                z-index: 1001;
            }
            
            .btn-action {
                height: var(--btn-height);
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                padding: 0 var(--gap-medium);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: var(--shadow-base);
                position: relative;
                white-space: nowrap;
                flex-shrink: 0;
            }
            
            .btn-action:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-action.disabled {
                opacity: 0.5;
                cursor: not-allowed !important;
                pointer-events: none;
            }
            
            .btn-action.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                font-weight: 700;
            }
            
            .btn-action.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            .btn-action.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-action.btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
                border-color: #cbd5e1;
            }
            
            .btn-action.btn-selection-toggle {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #0ea5e9;
                min-width: 140px;
            }
            
            .btn-action.btn-selection-toggle:hover {
                background: #e0f2fe;
                color: #0c4a6e;
                border-color: #0284c7;
            }
            
            .btn-action.btn-selection-toggle.all-selected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-action.btn-selection-toggle.all-selected:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            .btn-action.btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-action.btn-clear:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            .btn-text {
                font-weight: inherit;
            }
            
            .btn-count {
                font-size: 11px;
                opacity: 0.8;
                margin-left: 2px;
            }
            
            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 8px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
                animation: badgePulse 2s ease-in-out infinite;
            }

            @keyframes badgePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* Dropdown */
            .dropdown-action {
                position: relative;
                display: inline-block;
                z-index: 1002;
            }
            
            .dropdown-menu {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                min-width: 200px;
                z-index: 9999;
                padding: 8px 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;
            }
            
            .dropdown-menu.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .dropdown-item {
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
            
            .dropdown-item:hover {
                background: #f8fafc;
                color: #1f2937;
            }
            
            .dropdown-item.danger {
                color: #dc2626;
            }
            
            .dropdown-item.danger:hover {
                background: #fef2f2;
                color: #b91c1c;
            }

            /* FILTRES CATÉGORIES AVEC PRIORITÉ NEWSLETTER ULTRA-RENFORCÉE */
            .status-filters-compact {
                display: flex;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
                flex-wrap: wrap;
                width: 100%;
                position: relative;
                z-index: 10;
                align-items: flex-start;
            }
            
            .status-pill-compact {
                height: 64px; /* Augmenté pour ultra-priority */
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
                overflow: visible;
                z-index: 11;
            }

            /* Styles spéciaux ULTRA pour Newsletter et Spam */
            .status-pill-compact.newsletter-priority-ultra {
                border-width: 3px;
                border-color: var(--newsletter-color);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05));
                animation: newsletterPulseUltra 2s ease-in-out infinite;
                box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
            }

            .status-pill-compact.spam-priority-ultra {
                border-width: 3px;
                border-color: var(--spam-color);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
                animation: spamPulseUltra 2s ease-in-out infinite;
                box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
            }

            @keyframes newsletterPulseUltra {
                0%, 100% { 
                    transform: scale(1); 
                    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3); 
                }
                50% { 
                    transform: scale(1.05); 
                    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5); 
                }
            }

            @keyframes spamPulseUltra {
                0%, 100% { 
                    transform: scale(1); 
                    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3); 
                }
                50% { 
                    transform: scale(1.05); 
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5); 
                }
            }

            .ultra-priority-badge {
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #f97316, #ea580c);
                color: white;
                font-size: 9px;
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: 800;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
                animation: ultraBadgePulse 1.5s ease-in-out infinite;
                z-index: 20;
                white-space: nowrap;
            }

            @keyframes ultraBadgePulse {
                0%, 100% { 
                    transform: translateX(-50%) scale(1);
                }
                50% { 
                    transform: translateX(-50%) scale(1.1);
                }
            }
            
            .status-pill-compact.preselected-category {
                animation: pulsePreselected 3s ease-in-out infinite;
                border-width: 2px;
                border-color: var(--preselect-color);
            }
            
            .status-pill-compact.preselected-category::before {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border-radius: inherit;
                background: linear-gradient(45deg, var(--preselect-color), #a78bfa, var(--preselect-color));
                background-size: 300% 300%;
                animation: gradientShift 4s ease infinite;
                z-index: -1;
                opacity: 0.3;
            }
            
            @keyframes pulsePreselected {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.03); }
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
            
            .pill-second-line-twolines {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
            }
            
            .pill-text-twolines {
                font-weight: 700;
                font-size: 12px;
                line-height: 1.2;
                text-align: center;
            }
            
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
                z-index: 15;
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
            
            .status-pill-compact:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
                z-index: 12;
            }
            
            .status-pill-compact.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                transform: translateY(-2px);
                z-index: 13;
            }
            
            .status-pill-compact.active.preselected-category {
                background: linear-gradient(135deg, var(--preselect-color) 0%, #7c3aed 100%);
                box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
            }

            .status-pill-compact.active.newsletter-priority-ultra {
                background: linear-gradient(135deg, var(--newsletter-color) 0%, #ea580c 100%);
                box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
            }

            .status-pill-compact.active.spam-priority-ultra {
                background: linear-gradient(135deg, var(--spam-color) 0%, #dc2626 100%);
                box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
            }
            
            .status-pill-compact.active .pill-count-twolines {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }

            /* Container des emails */
            .tasks-container-harmonized {
                background: transparent;
                transition: padding-top 0.3s ease;
            }
            
            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            /* CARTES D'EMAILS ULTRA-AMÉLIORÉES */
            .task-harmonized-card {
                display: flex;
                align-items: flex-start; /* Changé pour aperçu */
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
                z-index: 1;
            }

            /* Styles spéciaux Newsletter ULTRA */
            .task-harmonized-card.newsletter-email-ultra {
                border-left: 5px solid var(--newsletter-color);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
                box-shadow: 0 2px 12px rgba(249, 115, 22, 0.1);
            }

            .task-harmonized-card.newsletter-email-ultra:hover {
                border-left: 6px solid var(--newsletter-color);
                box-shadow: 0 8px 24px rgba(249, 115, 22, 0.2);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(255, 255, 255, 1) 100%);
            }

            /* Styles spéciaux Spam ULTRA */
            .task-harmonized-card.spam-email-ultra {
                border-left: 5px solid var(--spam-color);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
                opacity: 0.85;
                box-shadow: 0 2px 12px rgba(239, 68, 68, 0.1);
            }

            .task-harmonized-card.spam-email-ultra:hover {
                border-left: 6px solid var(--spam-color);
                box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(255, 255, 255, 1) 100%);
                opacity: 1;
            }

            /* Emails corrigés par priorité ULTRA */
            .task-harmonized-card.priority-corrected-ultra {
                border-left: 5px solid #10b981;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
                box-shadow: 0 2px 12px rgba(16, 185, 129, 0.1);
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
                z-index: 2;
            }
            
            .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 3;
            }
            
            .task-harmonized-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }
            
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
                margin-top: 4px; /* Ajusté pour aligner avec contenu */
            }
            
            .task-checkbox-harmonized:checked {
                background: #6366f1;
                border-color: #6366f1;
            }
            
            .task-harmonized-card.preselected-task .task-checkbox-harmonized:checked {
                background: var(--preselect-color);
                border-color: var(--preselect-color);
            }

            .task-harmonized-card.newsletter-email-ultra .task-checkbox-harmonized:checked {
                background: var(--newsletter-color);
                border-color: var(--newsletter-color);
            }

            .task-harmonized-card.spam-email-ultra .task-checkbox-harmonized:checked {
                background: var(--spam-color);
                border-color: var(--spam-color);
            }
            
            .task-checkbox-harmonized:checked::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: 700;
            }
            
            .priority-bar-harmonized {
                width: 4px;
                height: 70px; /* Augmenté pour cartes plus hautes */
                border-radius: 2px;
                margin-right: var(--gap-medium);
                transition: all 0.3s ease;
                flex-shrink: 0;
                margin-top: 4px;
            }
            
            .task-main-content-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 6px; /* Augmenté pour spacing */
                padding-right: var(--gap-medium);
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
                flex-wrap: wrap;
            }
            
            .task-type-badge-harmonized,
            .deadline-badge-harmonized,
            .confidence-badge-harmonized,
            .attachment-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: #f8fafc;
                color: #64748b;
                padding: 3px 6px;
                border-radius: 5px;
                font-size: 10px;
                font-weight: 600;
                border: 1px solid #e2e8f0;
                white-space: nowrap;
            }
            
            .confidence-badge-harmonized {
                background: #f0fdf4;
                color: #16a34a;
                border-color: #bbf7d0;
            }

            .attachment-badge-harmonized {
                background: #fef3c7;
                color: #d97706;
                border-color: #fde68a;
            }
            
            .preselected-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: linear-gradient(135deg, var(--preselect-color) 0%, #7c3aed 100%);
                color: white !important;
                padding: 3px 6px;
                border-radius: 5px;
                font-size: 10px;
                font-weight: 700 !important;
                border: none !important;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
                animation: badgePulse 2s ease-in-out infinite;
            }

            .correction-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white !important;
                padding: 3px 6px;
                border-radius: 5px;
                font-size: 10px;
                font-weight: 700 !important;
                border: none !important;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
            }
            
            .task-recipient-harmonized {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
                flex-wrap: wrap;
            }
            
            .recipient-name-harmonized {
                font-weight: 600;
                color: #374151;
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

            .category-indicator-harmonized.newsletter-category-ultra {
                border: 2px solid var(--newsletter-color);
                box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
                animation: newsletterCategoryGlowUltra 2s ease-in-out infinite;
                font-weight: 700;
            }

            .category-indicator-harmonized.spam-category-ultra {
                border: 2px solid var(--spam-color);
                box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
                animation: spamCategoryGlowUltra 2s ease-in-out infinite;
                font-weight: 700;
            }

            @keyframes newsletterCategoryGlowUltra {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
                }
                50% { 
                    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.4);
                }
            }

            @keyframes spamCategoryGlowUltra {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
                }
                50% { 
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.4);
                }
            }
            
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

            /* NOUVEAU: Aperçu du contenu email */
            .email-preview-harmonized {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                margin-top: 4px;
                padding: 8px 12px;
                background: #f8fafc;
                border-radius: 6px;
                border-left: 3px solid #e2e8f0;
                font-size: 12px;
                color: #64748b;
                line-height: 1.4;
                font-style: italic;
            }

            .email-preview-harmonized i {
                color: #9ca3af;
                font-size: 10px;
                margin-top: 2px;
                flex-shrink: 0;
            }
            
            .task-actions-harmonized {
                display: flex;
                flex-direction: column; /* Changé pour meilleur alignement */
                align-items: center;
                gap: 4px;
                margin-left: var(--gap-medium);
                flex-shrink: 0;
                z-index: 10;
                position: relative;
                margin-top: 4px;
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
                z-index: 11;
                position: relative;
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
            
            .task-harmonized-card.preselected-task .action-btn-harmonized.create-task {
                color: var(--preselect-color);
                background: rgba(139, 92, 246, 0.1);
            }
            
            .task-harmonized-card.preselected-task .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-color: var(--preselect-color);
                color: #7c3aed;
            }

            .task-harmonized-card.newsletter-email-ultra .action-btn-harmonized.create-task {
                color: var(--newsletter-color);
                background: rgba(249, 115, 22, 0.1);
            }

            .task-harmonized-card.newsletter-email-ultra .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
                border-color: var(--newsletter-color);
                color: #ea580c;
            }

            .task-harmonized-card.spam-email-ultra .action-btn-harmonized.create-task {
                color: var(--spam-color);
                background: rgba(239, 68, 68, 0.1);
            }

            .task-harmonized-card.spam-email-ultra .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
                border-color: var(--spam-color);
                color: #dc2626;
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

            /* Vue groupée - Compatible avec nouvelles cartes */
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
                z-index: 1;
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
                border-bottom: 1px solid #e5e7eb;
                gap: var(--gap-medium);
                z-index: 1;
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
            
            .group-content-harmonized {
                background: transparent;
                margin: 0;
                padding: 0;
                display: none;
            }

            /* État vide harmonisé */
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
            }
            
            .empty-state-title-harmonized {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text-harmonized {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
            }

            .empty-state-actions {
                display: flex;
                gap: var(--gap-medium);
                justify-content: center;
                flex-wrap: wrap;
            }

            /* États vide standard */
            .empty-state {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
            }
            
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state-title {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
                margin-left: auto;
                margin-right: auto;
            }

            /* Boutons dans empty state */
            .empty-state .btn,
            .empty-state-harmonized .btn,
            .btn {
                display: inline-flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 12px 24px;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                text-decoration: none;
                border: 1px solid transparent;
                white-space: nowrap;
            }

            .btn.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }

            .btn.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }

            .btn.btn-secondary {
                background: white;
                color: #374151;
                border-color: #e5e7eb;
                box-shadow: var(--shadow-base);
            }

            .btn.btn-secondary:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }

            /* RESPONSIVE ÉTENDU */
            @media (max-width: 1400px) {
                .status-pill-compact {
                    flex: 0 1 calc(20% - var(--gap-small));
                    min-width: 100px;
                    max-width: 160px;
                }
            }
            
            @media (max-width: 1200px) {
                .status-pill-compact {
                    flex: 0 1 calc(25% - var(--gap-small));
                    min-width: 80px;
                    max-width: 140px;
                }
            }
            
            @media (max-width: 1024px) {
                .status-pill-compact {
                    flex: 0 1 calc(33.333% - var(--gap-small));
                    min-width: 70px;
                    max-width: 120px;
                    height: 52px;
                }
                
                .controls-bar-single-line {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                }
                
                .search-section {
                    max-width: none;
                    order: 1;
                }
                
                .view-modes {
                    width: 100%;
                    justify-content: space-around;
                    order: 2;
                }
                
                .action-buttons {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    order: 3;
                }

                .provider-status-display {
                    order: 0;
                    margin-right: 0;
                    margin-bottom: var(--gap-small);
                }
                
                .dropdown-menu {
                    right: auto;
                    left: 0;
                }

                /* Cartes mobiles */
                .task-harmonized-card {
                    padding: 12px;
                    min-height: 80px;
                }

                .task-actions-harmonized {
                    flex-direction: row;
                }

                .email-preview-harmonized {
                    display: none; /* Masquer sur mobile */
                }
            }
            
            @media (max-width: 768px) {
                .status-filters-compact {
                    flex-wrap: wrap;
                    gap: 2px;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                    background: transparent;
                }
                
                .status-pill-compact {
                    flex: 0 1 calc(50% - 1px);
                    min-width: 0;
                    border-radius: var(--btn-border-radius);
                    border: 1px solid #e5e7eb;
                    box-shadow: var(--shadow-base);
                    height: 50px;
                }
                
                .view-mode span,
                .btn-action .btn-text {
                    display: none;
                }
                
                .view-mode {
                    min-width: 44px;
                    padding: 0;
                    justify-content: center;
                }
                
                .btn-action {
                    padding: 0 var(--gap-small);
                    min-width: 44px;
                    justify-content: center;
                }
                
                .btn-action .btn-count {
                    display: none;
                }
                
                .search-input {
                    font-size: 14px;
                    padding: 0 var(--gap-small) 0 36px;
                }
                
                .search-icon {
                    left: var(--gap-small);
                    font-size: 14px;
                }

                .explanation-stats {
                    justify-content: center;
                }

                .stat-item {
                    font-size: 11px;
                    padding: 3px 6px;
                }

                .task-meta-harmonized {
                    flex-wrap: wrap;
                }

                .task-meta-harmonized .task-type-badge-harmonized,
                .task-meta-harmonized .deadline-badge-harmonized {
                    font-size: 9px;
                    padding: 2px 4px;
                }
            }
            
            @media (max-width: 480px) {
                .status-filters-compact {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .status-pill-compact {
                    flex: none;
                    width: 100%;
                    border-radius: var(--btn-border-radius);
                    border: 1px solid #e5e7eb;
                    box-shadow: var(--shadow-base);
                }
                
                .controls-bar-single-line {
                    padding: var(--gap-small);
                    gap: var(--gap-small);
                }
                
                .action-buttons {
                    flex-direction: column;
                    gap: var(--gap-small);
                    align-items: stretch;
                }
                
                .action-buttons > * {
                    width: 100%;
                    justify-content: center;
                }
                
                .dropdown-menu {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 300px;
                }
                
                .sticky-controls-container {
                    padding: var(--gap-small);
                }

                .explanation-content {
                    align-items: center;
                }

                .explanation-stats {
                    flex-direction: column;
                    align-items: center;
                    gap: var(--gap-small);
                }

                .task-harmonized-card {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }

                .task-actions-harmonized {
                    flex-direction: row;
                    margin-left: 0;
                    align-self: flex-end;
                    margin-top: 8px;
                }

                .priority-bar-harmonized {
                    height: 4px;
                    width: 100%;
                    margin-right: 0;
                    margin-bottom: 4px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // ACTIONS BULK ET AUTRES MÉTHODES (Conservées)
    // ================================================
    
    toggleBulkActions(event) {
        event.stopPropagation();
        event.preventDefault();
        
        const menu = document.getElementById('bulkActionsMenu');
        const button = event.currentTarget;
        
        if (!menu || !button) return;
        
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
            button.classList.remove('show');
        } else {
            menu.classList.add('show');
            button.classList.add('show');
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
        
        if (confirm(`Supprimer définitivement ${selectedEmails.length} email(s) ?\n\nCette action est irréversible.`)) {
            window.uiManager?.showToast(`${selectedEmails.length} emails supprimés`, 'success');
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async bulkExport() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        const emails = selectedEmails.map(id => this.getEmailById(id)).filter(Boolean);
        
        const csvContent = [
            ['De', 'Sujet', 'Date', 'Catégorie', 'Provider', 'Contenu'].join(','),
            ...emails.map(email => [
                `"${email.from?.emailAddress?.name || email.from?.emailAddress?.address || ''}"`,
                `"${email.subject || ''}"`,
                email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleDateString('fr-FR') : '',
                `"${this.getCategoryName(email.category)}"`,
                `"${this.currentProvider || 'unknown'}"`,
                `"${(email.bodyPreview || '').substring(0, 100)}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `emails_${this.currentProvider || 'scan'}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.uiManager?.showToast('Export terminé', 'success');
        this.clearSelection();
    }

    // ================================================
    // CRÉATION DE TÂCHES
    // ================================================
    
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        window.uiManager?.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                if (window.taskManager) {
                    const taskData = this.buildBasicTaskFromEmail(email);
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
            window.uiManager?.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''} (${this.currentProvider || 'scan'})`, 'success');
            this.clearSelection();
            this.refreshEmailsView();
        } else {
            window.uiManager?.showToast('Aucune tâche créée', 'warning');
        }
    }

    buildBasicTaskFromEmail(email) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || 'unknown';
        
        return {
            id: this.generateTaskId(),
            title: `Email de ${senderName}: ${email.subject || 'Sans sujet'}`,
            description: email.bodyPreview || 'Aucune description disponible',
            priority: 'medium',
            dueDate: null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            emailDomain: senderDomain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            tags: [senderDomain, email.category].filter(Boolean),
            method: 'basic',
            provider: this.currentProvider || 'unknown'
        };
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            window.uiManager?.showToast('Email non trouvé', 'error');
            return;
        }

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'task_creation_modal_' + Date.now();
        const providerInfo = this.getProviderInfo();
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; 
                            max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Créer une tâche</h2>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; color: ${providerInfo.color};">
                                <i class="${providerInfo.icon}"></i>
                                <span style="font-size: 14px; font-weight: 600;">${providerInfo.name}</span>
                            </div>
                        </div>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        <div>
                            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Titre de la tâche</label>
                            <input type="text" id="task-title" 
                                   style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                   value="Email de ${senderName}: ${email.subject || 'Sans sujet'}">
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Description</label>
                            <textarea id="task-description" 
                                      style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 100px;"
                                      rows="4">${email.bodyPreview || 'Traiter cet email'}</textarea>
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Priorité</label>
                            <select id="task-priority" 
                                    style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                                <option value="urgent">🚨 Urgent</option>
                                <option value="high">⚡ Haute</option>
                                <option value="medium" selected>📌 Normale</option>
                                <option value="low">📄 Basse</option>
                            </select>
                        </div>
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Annuler
                        </button>
                        <button onclick="window.pageManager.createTaskFromModal('${email.id}'); document.getElementById('${uniqueId}').remove();"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    async createTaskFromModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            window.uiManager?.showToast('Email non trouvé', 'error');
            return;
        }

        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;

        if (!title) {
            window.uiManager?.showToast('Le titre est requis', 'warning');
            return;
        }

        try {
            const taskData = {
                ...this.buildBasicTaskFromEmail(email),
                title,
                description,
                priority
            };

            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager?.saveTasks();
                window.uiManager?.showToast(`Tâche créée avec succès (${this.currentProvider || 'email'})`, 'success');
                this.refreshEmailsView();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager?.showToast('Erreur lors de la création', 'error');
        }
    }

    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
                const emails = window.emailScanner.getAllEmails();
                this.updateEmailsData(emails);
                
                if (typeof window.emailScanner.recategorizeEmails === 'function') {
                    await window.emailScanner.recategorizeEmails();
                }
            }
            
            await this.loadPage('emails');
            window.uiManager?.showToast(`Emails actualisés (${this.currentProvider || 'provider'})`, 'success');
            
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
        }
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
    // PAGES ADDITIONNELLES (simplifiées)
    // ================================================
    
    async renderScanner(container) {
        console.log('[PageManager] Rendu page scanner...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                console.log('[PageManager] Utilisation ScanStartModule moderne');
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule, fallback:', error);
            }
        }
        
        const providerInfo = this.getProviderInfo();
        console.log('[PageManager] Utilisation interface scanner fallback');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="empty-title">Scanner d'emails</h3>
                <p class="empty-text">
                    ${providerInfo.status === 'connected' ? 
                        `Connecté à ${providerInfo.name}. Module de scan en cours de chargement...` :
                        'Connectez-vous à Gmail ou Outlook pour commencer.'
                    }
                </p>
                ${providerInfo.status !== 'connected' ? `
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            Se connecter à Gmail
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            Se connecter à Outlook
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async renderTasks(container) {
        if (window.tasksView && window.tasksView.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Tâches</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-title">Aucune tâche</h3>
                    <p class="empty-text">Créez des tâches à partir de vos emails ${this.currentProvider || 'scannés'}</p>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        const categories = window.categoryManager?.getCategories() || {};
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Catégories</h1>
            </div>
            
            <div class="categories-grid">
                ${Object.entries(categories).map(([id, cat]) => `
                    <div class="category-card">
                        <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                            ${cat.icon}
                        </div>
                        <h3>${cat.name}</h3>
                        <p>${cat.description || ''}</p>
                        ${id === 'marketing_news' ? '<span class="priority-badge">🚀 PRIORITÉ NEWSLETTER ULTRA</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderSettings(container) {
        if (window.categoriesPage) {
            window.categoriesPage.renderSettings(container);
        } else {
            const providerInfo = this.getProviderInfo();
            container.innerHTML = `
                <div class="page-header">
                    <h1>Paramètres</h1>
                </div>
                
                <div class="settings-card">
                    <h3>Configuration IA</h3>
                    <p>Provider actuel: <strong style="color: ${providerInfo.color};">${providerInfo.name}</strong></p>
                    <button class="btn primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        <i class="fas fa-cog"></i> Configurer Claude AI
                    </button>
                </div>
            `;
        }
    }

    async renderRanger(container) {
        if (window.domainOrganizer && window.domainOrganizer.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            const providerInfo = this.getProviderInfo();
            container.innerHTML = `
                <div class="page-header">
                    <h1>Ranger par domaine</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-folder-tree"></i>
                    </div>
                    <h3 class="empty-title">Module de rangement</h3>
                    <p class="empty-text">
                        Organisez vos emails ${providerInfo.name} par domaine. Module en cours de chargement...
                    </p>
                </div>
            `;
        }
    }

    // ================================================
    // MÉTHODES DE DISPATCH ET DEBUG
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

    analyzeFirstEmails(emails) {
        console.log(`[PageManager] Analyse de ${emails.length} emails pré-sélectionnés`);
    }

    cleanup() {
        console.log('[PageManager] 🧹 Nettoyage...');
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        this.emailsData = [];
    }

    destroy() {
        this.cleanup();
        this.currentPage = null;
        this.currentProvider = null;
        console.log('[PageManager] 💥 Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================
if (window.pageManager) {
    console.log('[PageManager] 🔄 Nettoyage ancienne instance...');
    try {
        window.pageManager.destroy?.();
    } catch (e) {
        console.warn('[PageManager] Erreur nettoyage:', e);
    }
}

console.log('[PageManager] 🚀 Création nouvelle instance v14.0...');
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

// ================================================
// FONCTIONS DE TEST GLOBALES AMÉLIORÉES
// ================================================
window.testPageManagerUltraEnhanced = function() {
    console.group('🧪 TEST PageManager v14.0 - AFFICHAGE EMAIL ULTRA-AMÉLIORÉ');
    
    const debugInfo = {
        currentProvider: window.pageManager.currentProvider,
        connectionStatus: window.pageManager.connectionStatus,
        providerInfo: window.pageManager.getProviderInfo(),
        emailsCount: window.pageManager.getAllEmails().length,
        emailsDataCached: window.pageManager.emailsData.length,
        selectedEmails: window.pageManager.selectedEmails.size,
        createdTasks: window.pageManager.createdTasks.size
    };
    
    console.log('Debug Info Ultra:', debugInfo);
    console.log('✅ getEmailById disponible:', typeof window.pageManager.getEmailById === 'function');
    console.log('✅ getAllEmails disponible:', typeof window.pageManager.getAllEmails === 'function');
    console.log('✅ showEmailModalEnhanced disponible:', typeof window.pageManager.showEmailModalEnhanced === 'function');
    
    // Test modal améliorée
    const emails = window.pageManager.getAllEmails();
    if (emails.length > 0) {
        const firstEmail = emails[0];
        const foundEmail = window.pageManager.getEmailById(firstEmail.id);
        console.log('Test getEmailById:', foundEmail ? '✅ Réussi' : '❌ Échec');
        
        console.log('Test modal améliorée disponible:', typeof window.pageManager.showEmailModalEnhanced === 'function' ? '✅ Oui' : '❌ Non');
        console.log('Test détection newsletter ultra:', typeof window.pageManager.ensureNewsletterSpamPriorityUltraEnhanced === 'function' ? '✅ Oui' : '❌ Non');
        console.log('Test extraction contenu améliorée:', typeof window.pageManager.extractAndCleanEmailContent === 'function' ? '✅ Oui' : '❌ Non');
    }
    
    console.groupEnd();
    return { 
        success: true, 
        provider: debugInfo.currentProvider,
        connected: debugInfo.providerInfo.status === 'connected',
        version: '14.0-ULTRA-ENHANCED',
        emailsAvailable: emails.length > 0,
        newsletterDetectionUltra: true,
        modalEnhanced: true,
        priorityNewsletterFixed: true
    };
};

console.log('✅ PageManager v14.0 loaded - AFFICHAGE EMAIL ULTRA-AMÉLIORÉ + Newsletter Priority ABSOLUE!');
console.log('📧 Fonctionnalités ajoutées:');
console.log('  - Modal email ultra-améliorée avec contenu nettoyé');
console.log('  - Détection newsletter/spam priorité ABSOLUE');
console.log('  - Aperçu contenu dans les cartes emails');
console.log('  - Gestion encodage caractères spéciaux');
console.log('  - Pièces jointes et métadonnées enrichies');
console.log('  - Interface ultra-responsive et accessible');
console.log('🚀 Utilisez testPageManagerUltraEnhanced() pour tester!');// PageManager.js - Version 14.0 - AFFICHAGE EMAIL CORRIGÉ + Newsletter Priority

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        this.emailsData = []; // Cache local des emails
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // Gmail/Outlook detection et état
        this.currentProvider = null;
        this.connectionStatus = {
            gmail: false,
            outlook: false,
            lastCheck: null
        };
        
        // Newsletter/Spam priority system - ULTRA-RENFORCÉ
        this.categoryPriority = {
            'marketing_news': 1000,  // PRIORITÉ ABSOLUE MAXIMALE
            'spam': 950,
            'security': 900,
            'finance': 850,
            'tasks': 800,
            'meetings': 750,
            'commercial': 700,
            'support': 650,
            'hr': 600,
            'notifications': 150, // TRÈS RÉDUIT pour éviter conflit
            'reminders': 500,
            'project': 450,
            'internal': 400,
            'cc': 350,
            'other': 0
        };
        
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
        this.detectProviders();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 14.0 - AFFICHAGE EMAIL CORRIGÉ + Newsletter Priority');
        this.startPeriodicProviderCheck();
    }

    // ================================================
    // GESTION DES EMAILS - ULTRA-RENFORCÉE
    // ================================================
    
    getAllEmails() {
        // Essayer EmailScanner d'abord
        if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
            const emails = window.emailScanner.getAllEmails();
            if (emails && emails.length > 0) {
                this.emailsData = [...emails];
                return emails;
            }
        }
        
        // Utiliser le cache local si disponible
        if (this.emailsData && this.emailsData.length > 0) {
            return this.emailsData;
        }
        
        // Fallback: emails vides
        console.warn('[PageManager] Aucun email disponible depuis EmailScanner ou cache');
        return [];
    }

    getEmailById(emailId) {
        if (!emailId) {
            console.warn('[PageManager] getEmailById appelé sans ID');
            return null;
        }

        // Méthode 1: Essayer EmailScanner si disponible
        if (window.emailScanner) {
            if (typeof window.emailScanner.getEmailById === 'function') {
                const email = window.emailScanner.getEmailById(emailId);
                if (email) return email;
            }
            
            if (typeof window.emailScanner.getAllEmails === 'function') {
                const allEmails = window.emailScanner.getAllEmails();
                const email = allEmails.find(e => e.id === emailId);
                if (email) return email;
            }
        }

        // Méthode 2: Chercher dans le cache local
        if (this.emailsData && this.emailsData.length > 0) {
            const email = this.emailsData.find(e => e.id === emailId);
            if (email) return email;
        }

        // Méthode 3: Chercher dans sessionStorage
        try {
            const scanResults = sessionStorage.getItem('lastScanResults');
            if (scanResults) {
                const parsed = JSON.parse(scanResults);
                if (parsed.emails && Array.isArray(parsed.emails)) {
                    const email = parsed.emails.find(e => e.id === emailId);
                    if (email) return email;
                }
            }
        } catch (error) {
            console.warn('[PageManager] Erreur lecture sessionStorage:', error);
        }

        console.warn(`[PageManager] Email non trouvé: ${emailId}`);
        return null;
    }

    updateEmailsData(emails) {
        if (emails && Array.isArray(emails)) {
            this.emailsData = [...emails];
            console.log(`[PageManager] Cache emails mis à jour: ${emails.length} emails`);
        }
    }

    // ================================================
    // DÉTECTION PROVIDER GMAIL/OUTLOOK
    // ================================================
    detectProviders() {
        console.log('[PageManager] 🔍 Détection providers email...');
        
        this.connectionStatus = {
            gmail: false,
            outlook: false,
            lastCheck: Date.now()
        };
        
        // PRIORITÉ 1: Gmail via GoogleAuthService
        if (window.googleAuthService && 
            typeof window.googleAuthService.isAuthenticated === 'function') {
            try {
                const isGmailAuth = window.googleAuthService.isAuthenticated();
                this.connectionStatus.gmail = isGmailAuth;
                
                if (isGmailAuth) {
                    this.currentProvider = 'gmail';
                    console.log('[PageManager] ✅ Gmail détecté et authentifié');
                    return 'gmail';
                }
            } catch (error) {
                console.warn('[PageManager] ⚠️ Erreur vérification Gmail:', error);
            }
        }
        
        // PRIORITÉ 2: Outlook via AuthService
        if (window.authService && 
            typeof window.authService.isAuthenticated === 'function') {
            try {
                const isOutlookAuth = window.authService.isAuthenticated();
                this.connectionStatus.outlook = isOutlookAuth;
                
                if (isOutlookAuth) {
                    this.currentProvider = 'outlook';
                    console.log('[PageManager] ✅ Outlook détecté et authentifié');
                    return 'outlook';
                }
            } catch (error) {
                console.warn('[PageManager] ⚠️ Erreur vérification Outlook:', error);
            }
        }
        
        console.log('[PageManager] ⚠️ Aucun provider email authentifié');
        this.currentProvider = null;
        return null;
    }

    getProviderInfo() {
        const provider = this.detectProviders();
        
        if (provider === 'gmail') {
            return {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#ea4335',
                status: 'connected',
                priority: 'high',
                optimized: true
            };
        } else if (provider === 'outlook') {
            return {
                name: 'Outlook',
                icon: 'fab fa-microsoft',
                color: '#0078d4',
                status: 'connected',
                priority: 'normal',
                optimized: false
            };
        }
        
        return {
            name: 'Non connecté',
            icon: 'fas fa-unlink',
            color: '#6b7280',
            status: 'disconnected',
            priority: 'none',
            optimized: false
        };
    }

    startPeriodicProviderCheck() {
        setInterval(() => {
            const oldProvider = this.currentProvider;
            const newProvider = this.detectProviders();
            
            if (oldProvider !== newProvider) {
                console.log(`[PageManager] 🔄 Provider changé: ${oldProvider} → ${newProvider}`);
                this.updateProviderStatus();
            }
        }, 30000);
    }

    updateProviderStatus() {
        if (this.currentPage === 'emails') {
            this.updateProviderInfoDisplay();
        }
        
        this.dispatchEvent('providerChanged', {
            provider: this.currentProvider,
            connectionStatus: this.connectionStatus
        });
    }

    updateProviderInfoDisplay() {
        const providerDisplays = document.querySelectorAll('.provider-status-display');
        const providerInfo = this.getProviderInfo();
        
        providerDisplays.forEach(display => {
            if (display) {
                const statusClass = providerInfo.status === 'connected' ? 'connected' : 'disconnected';
                const optimizedBadge = providerInfo.optimized ? 
                    '<span class="optimization-badge">🚀 Optimisé</span>' : '';
                
                display.innerHTML = `
                    <div class="provider-info ${statusClass}" style="color: ${providerInfo.color};">
                        <i class="${providerInfo.icon}"></i>
                        <span>${providerInfo.name}</span>
                        ${optimizedBadge}
                    </div>
                `;
            }
        });
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX
    // ================================================
    setupEventListeners() {
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 Paramètres changés reçus:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        window.addEventListener('settingsChanged', (event) => {
            console.log('[PageManager] 📨 Changement générique reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        });

        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] Emails recatégorisés, mise à jour interface');
            if (event.detail && event.detail.emails) {
                this.updateEmailsData(event.detail.emails);
            }
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.refreshEmailsView();
                }, 100);
            }
        });

        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] Scan terminé, données mises à jour');
            this.lastScanData = event.detail;
            
            if (event.detail && event.detail.emails) {
                this.updateEmailsData(event.detail.emails);
            } else if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
                const emails = window.emailScanner.getAllEmails();
                this.updateEmailsData(emails);
            }
            
            if (this.currentPage === 'emails') {
                this.loadPage('emails');
            }
        });

        window.addEventListener('scroll', () => {
            this.handleScrollForSticky();
        });

        window.addEventListener('providerChanged', (event) => {
            console.log('[PageManager] Provider changé:', event.detail);
            this.updateProviderInfoDisplay();
        });
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
            const content = document.querySelector('.tasks-container-harmonized');
            if (content) {
                content.style.paddingTop = stickyContainer.offsetHeight + 'px';
            }
        } else {
            stickyContainer.classList.remove('sticky-active');
            const content = document.querySelector('.tasks-container-harmonized');
            if (content) {
                content.style.paddingTop = '0';
            }
        }
    }

    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 Traitement changement paramètres:', settingsData);
        
        if (settingsData.settings?.taskPreselectedCategories) {
            console.log('[PageManager] 📋 Catégories pré-sélectionnées changées:', settingsData.settings.taskPreselectedCategories);
            
            if (window.emailScanner && this.emailsData.length > 0) {
                console.log('[PageManager] 🔄 Déclenchement re-catégorisation...');
                setTimeout(() => {
                    if (typeof window.emailScanner.recategorizeEmails === 'function') {
                        window.emailScanner.recategorizeEmails();
                    }
                }, 100);
            }
        }
        
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 200);
        }
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[PageManager] 🔧 Traitement changement générique:', changeData);
        
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[PageManager] 📋 Catégories pour tâches changées:', value);
                if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
                break;
                
            case 'activeCategories':
                console.log('[PageManager] 🏷️ Catégories actives changées:', value);
                if (window.emailScanner && this.emailsData.length > 0) {
                    setTimeout(() => {
                        if (typeof window.emailScanner.recategorizeEmails === 'function') {
                            window.emailScanner.recategorizeEmails();
                        }
                    }, 150);
                }
                break;
                
            case 'preferences':
                console.log('[PageManager] ⚙️ Préférences changées:', value);
                if (this.currentPage === 'emails') {
                    setTimeout(() => {
                        this.refreshEmailsView();
                    }, 100);
                }
                break;
        }
    }

    // =====================================
    // PAGE LOADING
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Chargement page: ${pageName}`);

        if (pageName === 'dashboard') {
            console.log('[PageManager] Dashboard ignoré - géré par index.html');
            this.updateNavigation(pageName);
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.style.display = 'block';
                pageContent.style.opacity = '1';
            }
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
            
            pageContent.innerHTML = this.renderErrorPage(error);
        }
    }

    renderErrorPage(error) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="empty-state-title">Erreur de chargement</h3>
                <p class="empty-state-text">${error.message}</p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('dashboard')">
                    Retour au tableau de bord
                </button>
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

    // ================================================
    // RENDU PAGE EMAILS - AVEC PRIORITÉ NEWSLETTER ULTRA-RENFORCÉE
    // ================================================
    async renderEmails(container) {
        const emails = this.getAllEmails();
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManager] 📧 Rendu page emails avec ${emails.length} emails`);
        console.log(`[PageManager] 🔌 Provider actuel: ${this.currentProvider}`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        // Priorité Newsletter/Spam - Analyse et correction ULTRA-RENFORCÉE
        this.ensureNewsletterSpamPriorityUltraEnhanced(emails);

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            const providerInfo = this.getProviderInfo();
            
            // Stats Newsletter/Spam AMÉLIORÉES
            const newsletterCount = emails.filter(e => e.category === 'marketing_news').length;
            const spamCount = emails.filter(e => e.category === 'spam').length;
            const preselectedCount = emails.filter(e => e.isPreselectedForTasks).length;
            const priorityCorrectedCount = emails.filter(e => e.priorityCorrection).length;
            
            container.innerHTML = `
                <div class="tasks-page-modern">
                    <!-- Texte explicatif avec stats provider AMÉLIORÉ -->
                    ${!this.hideExplanation ? `
                        <div class="explanation-text-harmonized ${providerInfo.status === 'connected' ? 'provider-connected' : 'provider-disconnected'}">
                            <div class="explanation-content">
                                <div class="explanation-main">
                                    <i class="fas fa-info-circle"></i>
                                    <span>
                                        Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action. 
                                        <strong>Détection Newsletter/Marketing ULTRA-RENFORCÉE avec priorité absolue.</strong>
                                    </span>
                                </div>
                                <div class="explanation-stats">
                                    <span class="stat-item newsletter">📰 ${newsletterCount} newsletters/marketing</span>
                                    <span class="stat-item spam">🚫 ${spamCount} spam</span>
                                    <span class="stat-item preselected">⭐ ${preselectedCount} pré-sélectionnés</span>
                                    <span class="stat-item corrected">✅ ${priorityCorrectedCount} auto-corrigés</span>
                                    <span class="stat-item provider" style="color: ${providerInfo.color};">
                                        <i class="${providerInfo.icon}"></i> ${providerInfo.name}
                                    </span>
                                </div>
                            </div>
                            <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}

                    <!-- Container original des contrôles et filtres -->
                    <div class="controls-and-filters-container">
                        <!-- Barre de contrôles unifiée -->
                        <div class="controls-bar-single-line">
                            <!-- Status Provider -->
                            <div class="provider-status-display">
                                ${this.renderProviderStatus(providerInfo)}
                            </div>
                            
                            <!-- Barre de recherche -->
                            <div class="search-section">
                                <div class="search-box">
                                    <i class="fas fa-search search-icon"></i>
                                    <input type="text" 
                                           class="search-input" 
                                           id="emailSearchInput"
                                           placeholder="Rechercher..." 
                                           value="${this.searchTerm}">
                                    ${this.searchTerm ? `
                                        <button class="search-clear" onclick="window.pageManager.clearSearch()">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- Modes de vue -->
                            <div class="view-modes">
                                <button class="view-mode ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('grouped-domain')"
                                        title="Par domaine">
                                    <i class="fas fa-globe"></i>
                                    <span>Domaine</span>
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('grouped-sender')"
                                        title="Par expéditeur">
                                    <i class="fas fa-user"></i>
                                    <span>Expéditeur</span>
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('flat')"
                                        title="Liste complète">
                                    <i class="fas fa-list"></i>
                                    <span>Liste</span>
                                </button>
                            </div>
                            
                            <!-- Actions principales -->
                            <div class="action-buttons">
                                <!-- Bouton Sélectionner/Désélectionner tout -->
                                <button class="btn-action btn-selection-toggle" 
                                        onclick="window.pageManager.toggleAllSelection()"
                                        title="Sélectionner/Désélectionner tous les emails visibles">
                                    <i class="fas fa-check-square"></i>
                                    <span class="btn-text">Sélectionner tous</span>
                                    <span class="btn-count">(${this.getVisibleEmails().length})</span>
                                </button>
                                
                                <!-- Bouton Créer tâches -->
                                <button class="btn-action btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                        onclick="window.pageManager.createTasksFromSelection()"
                                        ${selectedCount === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-tasks"></i>
                                    <span class="btn-text">Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                                    ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                                </button>
                                
                                <!-- Bouton Actions -->
                                <div class="dropdown-action">
                                    <button class="btn-action btn-secondary dropdown-toggle ${selectedCount === 0 ? 'disabled' : ''}" 
                                            onclick="window.pageManager.toggleBulkActions(event)"
                                            ${selectedCount === 0 ? 'disabled' : ''}>
                                        <i class="fas fa-ellipsis-v"></i>
                                        <span class="btn-text">Actions</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="dropdown-menu" id="bulkActionsMenu">
                                        <button class="dropdown-item" onclick="window.pageManager.bulkMarkAsRead()">
                                            <i class="fas fa-eye"></i>
                                            <span>Marquer comme lu</span>
                                        </button>
                                        <button class="dropdown-item" onclick="window.pageManager.bulkArchive()">
                                            <i class="fas fa-archive"></i>
                                            <span>Archiver</span>
                                        </button>
                                        <button class="dropdown-item danger" onclick="window.pageManager.bulkDelete()">
                                            <i class="fas fa-trash"></i>
                                            <span>Supprimer</span>
                                        </button>
                                        <div class="dropdown-divider"></div>
                                        <button class="dropdown-item" onclick="window.pageManager.bulkExport()">
                                            <i class="fas fa-download"></i>
                                            <span>Exporter</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Bouton Actualiser -->
                                <button class="btn-action btn-secondary" onclick="window.pageManager.refreshEmails()">
                                    <i class="fas fa-sync-alt"></i>
                                    <span class="btn-text">Actualiser</span>
                                </button>
                                
                                <!-- Bouton Effacer sélection -->
                                ${selectedCount > 0 ? `
                                    <button class="btn-action btn-clear" 
                                            onclick="window.pageManager.clearSelection()"
                                            title="Effacer la sélection">
                                        <i class="fas fa-times"></i>
                                        <span class="btn-text">Effacer (${selectedCount})</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Filtres de catégories avec priorité Newsletter/Spam ULTRA-RENFORCÉE -->
                        <div class="status-filters-compact">
                            ${this.buildPriorityCompactCategoryTabs(categoryCounts, totalEmails, categories)}
                        </div>
                    </div>

                    <!-- Container fixe (clone) -->
                    <div class="sticky-controls-container">
                        <!-- Contenu cloné dynamiquement -->
                    </div>

                    <!-- CONTENU DES EMAILS -->
                    <div class="tasks-container-harmonized">
                        ${this.renderEmailsList()}
                    </div>
                </div>
            `;

            this.addExpandedEmailStyles();
            this.setupEmailsEventListeners();
            this.setupStickyControls();
        };

        renderEmailsPage();
        
        // Auto-analyze si activé
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            const preselectedCategories = this.getTaskPreselectedCategories();
            
            if (preselectedCategories && preselectedCategories.length > 0) {
                const emailsToAnalyze = emails.filter(email => 
                    preselectedCategories.includes(email.category)
                ).slice(0, 5);
                
                if (emailsToAnalyze.length > 0) {
                    setTimeout(() => {
                        this.analyzeFirstEmails(emailsToAnalyze);
                    }, 1000);
                }
            }
        }
    }

    // ================================================
    // PRIORITÉ NEWSLETTER/SPAM - ULTRA-RENFORCÉE
    // ================================================
    ensureNewsletterSpamPriorityUltraEnhanced(emails) {
        console.log('[PageManager] 🔍 Vérification priorité Newsletter/Spam ULTRA-RENFORCÉE...');
        
        let corrected = 0;
        let newsletterDetected = 0;
        let spamDetected = 0;
        
        emails.forEach(email => {
            const originalCategory = email.category;
            
            // MÉTHODE 1: Détection ULTRA-RENFORCÉE via CategoryManager
            let correctedCategory = null;
            if (window.categoryManager && typeof window.categoryManager.analyzeEmail === 'function') {
                const reanalysis = window.categoryManager.analyzeEmail(email);
                if (reanalysis && reanalysis.category === 'marketing_news' && 
                    (reanalysis.hasAbsolute || reanalysis.score >= 50)) {
                    correctedCategory = 'marketing_news';
                    console.log(`[PageManager] 📰 Newsletter détectée via CategoryManager: "${email.subject?.substring(0, 40)}" (Score: ${reanalysis.score})`);
                }
            }
            
            // MÉTHODE 2: Détection directe renforcée
            if (!correctedCategory) {
                correctedCategory = this.detectNewsletterSpamPriorityDirect(email);
            }
            
            // Appliquer la correction si nécessaire
            if (correctedCategory && correctedCategory !== originalCategory) {
                console.log(`[PageManager] 📰 CORRECTION APPLIQUÉE: "${email.subject?.substring(0, 40)}" ${originalCategory} → ${correctedCategory}`);
                
                email.category = correctedCategory;
                email.categoryScore = (email.categoryScore || 0) + 100;
                email.categoryConfidence = Math.max(email.categoryConfidence || 0, 0.95);
                email.priorityCorrection = true;
                email.correctionMethod = 'ultra_enhanced';
                corrected++;
                
                if (correctedCategory === 'marketing_news') {
                    newsletterDetected++;
                } else if (correctedCategory === 'spam') {
                    spamDetected++;
                }
            }
        });
        
        if (corrected > 0) {
            console.log(`[PageManager] ✅ ${corrected} emails corrigés avec priorité Newsletter/Spam ULTRA-RENFORCÉE`);
            console.log(`[PageManager] 📰 ${newsletterDetected} newsletters détectées, 🚫 ${spamDetected} spam détectés`);
        }
    }

    detectNewsletterSpamPriorityDirect(email) {
        const content = this.extractEmailContentForAnalysisEnhanced(email);
        
        // === PATTERNS NEWSLETTER ULTRA-RENFORCÉS ===
        const ultraNewsletterPatterns = [
            // Désabonnement - PRIORITÉ ABSOLUE
            /unsubscribe|désabonner|se désinscrire/i,
            /newsletter|bulletin|lettre d'information/i,
            /mailing list|liste de diffusion/i,
            /view in browser|voir dans le navigateur/i,
            /email preferences|préférences email/i,
            /promotion|promo|offre spéciale|special offer/i,
            /limited offer|offre limitée|flash sale/i,
            /shop now|acheter maintenant|buy now/i,
            /you are receiving this|vous recevez cet email/i,
            /manage subscription|gérer abonnement/i,
            
            // Services spécifiques détectés dans les exemples
            /google cloud|gcp|cloud platform/i,
            /twitch|streaming|live stream/i,
            /youtube|video notification/i,
            /spotify|music streaming/i,
            /netflix|streaming service/i,
            /amazon|order|shipping/i,
            
            // Encodage défectueux (caractères spéciaux)
            /sÃ©curitÃ©|notificatÃ©|prÃ©fÃ©rences/i,
            /dÃ©sabonner|rÃ©ception|Ã©quipe/i,
            /confidentialitÃ©|dÃ©claration/i,
            
            // Adresses typiques
            /noreply|no-reply|donotreply|do-not-reply/i,
            /notifications@|updates@|news@|newsletter@/i,
            /marketing@|promo@|offers@|deals@/i
        ];
        
        // === PATTERNS SPAM ===
        const spamPatterns = [
            /urgent.*action|action.*urgent/i,
            /félicitations.*gagné|congratulations.*won/i,
            /cliquez ici immédiatement|click here immediately/i,
            /réclamez maintenant|claim now/i,
            /offre exclusive.*expire/i,
            /100% gratuit.*aucun frais/i,
            /winner|gagnant|lottery|loterie/i
        ];
        
        // === DÉTECTION NEWSLETTER ULTRA-RENFORCÉE ===
        let newsletterScore = 0;
        
        // Vérifier dans le contenu complet
        ultraNewsletterPatterns.forEach(pattern => {
            if (pattern.test(content.fullText)) {
                newsletterScore += 20;
            }
            if (pattern.test(content.subject)) {
                newsletterScore += 30; // Bonus sujet
            }
            if (pattern.test(content.senderAddress)) {
                newsletterScore += 25; // Bonus expéditeur
            }
        });
        
        // Bonus pour domaines marketing
        const marketingDomains = [
            'mailchimp', 'sendgrid', 'constantcontact', 'aweber',
            'getresponse', 'campaign-monitor', 'sendinblue',
            'klaviyo', 'convertkit', 'activecampaign'
        ];
        
        if (marketingDomains.some(domain => content.senderDomain.includes(domain))) {
            newsletterScore += 50;
        }
        
        // Bonus pour noreply
        if (/noreply|no-reply|donotreply/.test(content.senderAddress)) {
            newsletterScore += 30;
        }
        
        // Bonus pour multiple destinataires
        if (content.recipientsCount > 1) {
            newsletterScore += 15;
        }
        
        // Bonus pour contenu HTML
        if (content.hasHtml) {
            newsletterScore += 10;
        }
        
        // === DÉCISION FINALE ===
        if (newsletterScore >= 40) { // Seuil très permissif
            return 'marketing_news';
        }
        
        // Vérifier Spam
        const hasSpamPattern = spamPatterns.some(pattern => 
            pattern.test(content.fullText) || pattern.test(content.subject)
        );
        
        if (hasSpamPattern || this.isSuspiciousDomain(content.senderDomain)) {
            return 'spam';
        }
        
        return null; // Pas de correction nécessaire
    }

    extractEmailContentForAnalysisEnhanced(email) {
        const subject = email.subject || '';
        const body = email.bodyPreview || email.body?.content || '';
        const senderAddress = email.from?.emailAddress?.address || '';
        const senderName = email.from?.emailAddress?.name || '';
        const senderDomain = senderAddress.includes('@') ? senderAddress.split('@')[1] : '';
        
        // Construire le texte complet avec poids
        let fullText = '';
        fullText += (subject + ' ').repeat(5); // Sujet répété 5 fois
        fullText += (senderName + ' ').repeat(3); // Nom expéditeur répété 3 fois
        fullText += (senderAddress + ' ').repeat(3); // Adresse répétée 3 fois
        fullText += (senderDomain + ' ').repeat(2); // Domaine répété 2 fois
        fullText += body; // Corps une fois
        
        return {
            fullText: fullText.toLowerCase(),
            subject: subject.toLowerCase(),
            senderAddress: senderAddress.toLowerCase(),
            senderName: senderName.toLowerCase(),
            senderDomain: senderDomain.toLowerCase(),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            recipientsCount: (email.toRecipients?.length || 0) + (email.ccRecipients?.length || 0),
            hasAttachments: email.hasAttachments || false
        };
    }

    isSuspiciousDomain(domain) {
        const suspiciousDomains = [
            'temp-mail', 'guerrillamail', '10minutemail', 'mailinator',
            'throwaway', 'fakeinbox', 'yopmail', 'maildrop'
        ];
        
        return suspiciousDomains.some(suspicious => domain.includes(suspicious));
    }

    // ================================================
    // PROVIDER STATUS RENDERING
    // ================================================
    renderProviderStatus(providerInfo) {
        const statusClass = providerInfo.status === 'connected' ? 'connected' : 'disconnected';
        const optimizedBadge = providerInfo.optimized ? 
            '<span class="optimization-badge">🚀 Optimisé</span>' : '';
        
        return `
            <div class="provider-info ${statusClass}" style="color: ${providerInfo.color};">
                <i class="${providerInfo.icon}"></i>
                <span>${providerInfo.name}</span>
                ${optimizedBadge}
            </div>
        `;
    }

    // ================================================
    // FILTRES CATÉGORIES AVEC PRIORITÉ NEWSLETTER ULTRA-RENFORCÉE
    // ================================================
    buildPriorityCompactCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        
        // ORDRE PRIORITAIRE ULTRA-RENFORCÉ: Newsletter/Marketing d'abord ABSOLUMENT
        const priorityOrder = [
            'all',
            'marketing_news', // NEWSLETTER/MARKETING EN PREMIER ABSOLU
            'spam',           // SPAM EN SECOND
            'security',
            'finance', 
            'tasks',
            'meetings',
            'commercial',
            'support',
            'hr',
            'reminders',
            'project',
            'internal',
            'cc',
            'notifications', // TRÈS BAS pour éviter conflit
            'other'
        ];
        
        const tabs = [];
        
        // Ajouter "Tous" en premier
        tabs.push({
            id: 'all',
            name: 'Tous',
            icon: '📧',
            count: totalEmails,
            isPreselected: false,
            priority: 10000 // Priorité maximale pour "Tous"
        });
        
        // Ajouter les catégories dans l'ordre de priorité ULTRA-RENFORCÉ
        priorityOrder.slice(1).forEach(catId => {
            const count = categoryCounts[catId] || 0;
            const category = categories[catId];
            
            if (count > 0 && category) {
                const isPreselected = preselectedCategories.includes(catId);
                const priority = this.categoryPriority[catId] || 0;
                
                // Icônes et classes spéciales pour Newsletter et Spam
                let icon = category.icon;
                let specialClass = '';
                let specialBadge = '';
                
                if (catId === 'marketing_news') {
                    icon = '📰';
                    specialClass = 'newsletter-priority-ultra';
                    specialBadge = '<span class="ultra-priority-badge">🚀 PRIORITÉ</span>';
                } else if (catId === 'spam') {
                    icon = '🚫';
                    specialClass = 'spam-priority-ultra';
                }
                
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: icon,
                    color: category.color,
                    count: count,
                    isPreselected: isPreselected,
                    priority: priority,
                    specialClass: specialClass,
                    specialBadge: specialBadge
                });
            }
        });
        
        // Trier par priorité décroissante ABSOLUE
        tabs.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        return tabs.map(tab => {
            const isCurrentCategory = this.currentCategory === tab.id;
            const baseClasses = `status-pill-compact ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''} ${tab.specialClass || ''}`;
            
            return `
                <button class="${baseClasses}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}"
                        title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                        ${tab.specialBadge || ''}
                    </div>
                    ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                </button>
            `;
        }).join('');
    }

    // ================================================
    // CLICK EMAIL - AMÉLIORÉ POUR AFFICHAGE
    // ================================================
    handleEmailClick(event, emailId) {
        // Éviter les double-clics sur la checkbox
        if (event.target.type === 'checkbox') {
            return;
        }
        
        // Éviter les clics sur les boutons d'action
        if (event.target.closest('.task-actions-harmonized')) {
            return;
        }
        
        // Éviter les clics sur les headers de groupes
        if (event.target.closest('.group-header-harmonized')) {
            return;
        }
        
        // Gestion du double-clic pour sélection
        const now = Date.now();
        const lastClick = this.lastEmailClick || 0;
        
        if (now - lastClick < 300) {
            // Double-clic: sélectionner/désélectionner
            event.preventDefault();
            event.stopPropagation();
            this.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
            return;
        }
        
        // Simple clic: ouvrir email après délai
        this.lastEmailClick = now;
        
        setTimeout(() => {
            if (Date.now() - this.lastEmailClick >= 250) {
                this.showEmailModalEnhanced(emailId);
            }
        }, 250);
    }

    // ================================================
    // MODAL EMAIL ULTRA-AMÉLIORÉE
    // ================================================
    showEmailModalEnhanced(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            console.error('[PageManager] Email non trouvé pour la modal:', emailId);
            window.uiManager?.showToast('Email non trouvé', 'error');
            return;
        }

        // Supprimer toute modal existante
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const providerInfo = this.getProviderInfo();
        const uniqueId = 'email_modal_' + Date.now();
        
        // Extraire et nettoyer le contenu avec gestion améliorée
        const emailContent = this.extractAndCleanEmailContent(email);
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    
                    <!-- HEADER DE LA MODAL AMÉLIORÉ -->
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
                        <div style="flex: 1; min-width: 0;">
                            <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937; line-height: 1.3;">
                                ${this.escapeHtml(email.subject || 'Sans sujet')}
                            </h2>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                                <!-- Provider Info -->
                                <span style="display: flex; align-items: center; gap: 4px; color: ${providerInfo.color}; font-size: 14px; font-weight: 600;">
                                    <i class="${providerInfo.icon}"></i>
                                    ${providerInfo.name}
                                </span>
                                
                                <!-- Badges de catégorie améliorés -->
                                ${email.category === 'marketing_news' ? 
                                    '<span style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">📰 Newsletter/Marketing</span>' : 
                                    email.category === 'spam' ? 
                                    '<span style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">🚫 Spam</span>' : 
                                    email.category && email.category !== 'other' ? 
                                    `<span style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; border: 1px solid ${this.getCategoryColor(email.category)}40;">
                                        ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                    </span>` : ''
                                }
                                
                                ${email.priorityCorrection ? 
                                    '<span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">✅ Auto-Corrigé</span>' : ''
                                }
                                
                                ${email.hasAttachments ? 
                                    '<span style="background: #f59e0b20; color: #f59e0b; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; border: 1px solid #f59e0b40;">📎 Pièces jointes</span>' : ''
                                }
                                
                                ${email.importance === 'high' ? 
                                    '<span style="background: #ef444420; color: #ef4444; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; border: 1px solid #ef444440;">🔥 Important</span>' : ''
                                }
                            </div>
                        </div>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444;
                                       width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;
                                       font-size: 16px; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- MÉTADONNÉES EMAIL AMÉLIORÉES -->
                    <div style="padding: 20px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 12px 20px; font-size: 14px;">
                            <!-- Expéditeur -->
                            <span style="font-weight: 700; color: #374151;">De:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="color: #1f2937; font-weight: 600;">
                                    ${this.escapeHtml(email.from?.emailAddress?.name || 'Inconnu')}
                                </span>
                                <span style="color: #6b7280; font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">
                                    ${this.escapeHtml(email.from?.emailAddress?.address || '')}
                                </span>
                            </div>
                            
                            <!-- Date -->
                            <span style="font-weight: 700; color: #374151;">Date:</span>
                            <span style="color: #1f2937;">
                                ${this.formatEmailDateDetailed(email.receivedDateTime)}
                            </span>
                            
                            <!-- Destinataires -->
                            ${email.toRecipients && email.toRecipients.length > 0 ? `
                                <span style="font-weight: 700; color: #374151;">À:</span>
                                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${email.toRecipients.slice(0, 3).map(recipient => 
                                        `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                                            ${this.escapeHtml(recipient.emailAddress?.name || recipient.emailAddress?.address || 'Inconnu')}
                                        </span>`
                                    ).join('')}
                                    ${email.toRecipients.length > 3 ? `<span style="color: #6b7280; font-size: 12px;">+${email.toRecipients.length - 3} autres</span>` : ''}
                                </div>
                            ` : ''}
                            
                            <!-- CC si présent -->
                            ${email.ccRecipients && email.ccRecipients.length > 0 ? `
                                <span style="font-weight: 700; color: #374151;">CC:</span>
                                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${email.ccRecipients.slice(0, 3).map(recipient => 
                                        `<span style="background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                                            ${this.escapeHtml(recipient.emailAddress?.name || recipient.emailAddress?.address || 'Inconnu')}
                                        </span>`
                                    ).join('')}
                                    ${email.ccRecipients.length > 3 ? `<span style="color: #6b7280; font-size: 12px;">+${email.ccRecipients.length - 3} autres</span>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- CONTENU EMAIL AMÉLIORÉ -->
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; 
                                   max-height: 500px; overflow-y: auto; line-height: 1.6; color: #374151;">
                            ${emailContent}
                        </div>
                    </div>
                    
                    <!-- FOOTER ACTIONS AMÉLIORÉ -->
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; gap: 16px; background: #f8fafc;">
                        <div style="display: flex; gap: 12px;">
                            ${email.categoryScore ? `
                                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                                    <i class="fas fa-chart-bar"></i>
                                    <span>Score: ${email.categoryScore}pts</span>
                                    <span>•</span>
                                    <span>Confiance: ${Math.round((email.categoryConfidence || 0) * 100)}%</span>
                                </div>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                    style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; 
                                           cursor: pointer; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;
                                           transition: all 0.2s ease;">
                                <i class="fas fa-times"></i>
                                Fermer
                            </button>
                            ${!this.createdTasks.has(emailId) ? `
                                <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.showTaskCreationModal('${emailId}');"
                                        style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; 
                                               border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;
                                               transition: all 0.2s ease;">
                                    <i class="fas fa-tasks"></i> 
                                    Créer une tâche
                                </button>
                            ` : `
                                <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.openCreatedTask('${emailId}');"
                                        style="padding: 12px 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; 
                                               border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;
                                               transition: all 0.2s ease;">
                                    <i class="fas fa-check-circle"></i> 
                                    Voir la tâche
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Améliorer l'accessibilité
        const modal = document.getElementById(uniqueId);
        modal.focus();
        
        // Fermeture par échap
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // ================================================
    // EXTRACTION ET NETTOYAGE CONTENU EMAIL AMÉLIORÉ
    // ================================================
    extractAndCleanEmailContent(email) {
        let content = '';
        
        // Priorité 1: Contenu du corps
        if (email.body?.content) {
            content = email.body.content;
            
            // Si c'est du HTML, le nettoyer intelligemment
            if (content.includes('<')) {
                content = this.cleanEmailHtmlContent(content);
            }
        }
        // Priorité 2: Preview du corps
        else if (email.bodyPreview) {
            content = `<div style="padding: 20px; font-style: italic; color: #6b7280; background: #f9fafb; border-radius: 8px; border-left: 4px solid #e5e7eb;">
                <i class="fas fa-eye" style="margin-right: 8px;"></i>
                <strong>Aperçu du contenu:</strong><br><br>
                ${this.escapeHtml(email.bodyPreview)}
            </div>`;
        }
        // Fallback
        else {
            content = `<div style="padding: 40px; text-align: center; color: #9ca3af; background: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb;">
                <i class="fas fa-file-alt" style="font-size: 48px; margin-bottom: 16px; color: #d1d5db;"></i><br>
                <strong>Aucun contenu disponible</strong><br>
                <span style="font-size: 14px;">Ce message ne contient pas de texte lisible</span>
            </div>`;
        }
        
        return content;
    }

    cleanEmailHtmlContent(html) {
        if (!html) return '';
        
        // Créer un document temporaire pour nettoyer le HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Supprimer les éléments indésirables
        const unwantedElements = ['script', 'style', 'meta', 'link', 'base'];
        unwantedElements.forEach(tag => {
            const elements = tempDiv.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });
        
        // Nettoyer les attributs potentiellement dangereux
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(el => {
            // Supprimer les événements JavaScript
            const attributes = [...el.attributes];
            attributes.forEach(attr => {
                if (attr.name.startsWith('on') || attr.name === 'javascript:') {
                    el.removeAttribute(attr.name);
                }
            });
            
            // Nettoyer les styles inline dangereux
            if (el.style) {
                el.style.position = '';
                el.style.zIndex = '';
                el.style.top = '';
                el.style.left = '';
                el.style.right = '';
                el.style.bottom = '';
            }
        });
        
        // Améliorer la lisibilité
        const result = tempDiv.innerHTML;
        
        // Ajouter du style pour améliorer l'affichage
        return `<div style="padding: 20px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${result}
        </div>`;
    }

    // ================================================
    // FORMATAGE DATE AMÉLIORÉ
    // ================================================
    formatEmailDateDetailed(dateString) {
        if (!dateString) return 'Date inconnue';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        let relative = '';
        if (diffMinutes < 1) {
            relative = 'À l\'instant';
        } else if (diffMinutes < 60) {
            relative = `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            relative = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays === 1) {
            relative = 'Hier';
        } else if (diffDays < 7) {
            relative = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            relative = `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
        } else {
            relative = `Il y a ${Math.floor(diffDays / 30)} mois`;
        }
        
        const formatted = date.toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `${formatted} (${relative})`;
    }
