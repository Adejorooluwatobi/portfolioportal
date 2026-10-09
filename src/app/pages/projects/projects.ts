import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  PortfolioAdminService, 
  ProjectItem, 
  ProjectCategoryItem, 
  ProjectCreateUpdateDto, 
  CaseStudyUpdateDto,
  CaseStudyDetail
} from '../../services/portfolio-admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.scss']
})
export class ProjectsComponent implements OnInit {
  private adminService = inject(PortfolioAdminService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  projects: ProjectItem[] = [];
  filteredProjects: ProjectItem[] = [];
  categories: ProjectCategoryItem[] = [];

  // Filter state
  searchQuery = '';
  selectedCategorySlug = 'all';
  filterStatus = 'all'; // 'all', 'published', 'draft'

  // Loading & Action states
  isLoading = false;
  isSaving = false;
  isDeleting = false;
  isUploading = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // Drawer / Modal state
  isEditorOpen = false;
  isEditing = false;
  activeTab: 'details' | 'casestudy' = 'details';
  currentProjectId: string | null = null;

  // Project Form Model
  formTitle = '';
  formSlug = '';
  formClientName = '';
  formCategoryBadgeText = '';
  formTimeframe = '';
  formShortDescription = '';
  formImageUrl = '';
  formImageAlt = '';
  formIconKey = '';
  formLiveUrl = '';
  formGithubUrl = '';
  formArticleUrl = '';
  formHasCaseStudy = false;
  formIsPublished = true;
  formSortOrder = 1;
  formTagsInput = '';
  selectedCategoryIds: string[] = [];

  // Category Management State
  isAddingCategory = false;
  newCategoryLabel = '';
  isSavingCategory = false;

  // Case Study Form Model
  csTitle = '';
  csCategoryLabel = '';
  csYear = '';
  csClientName = '';
  csHeroImageUrl = '';
  csSummary = '';
  csLiveUrl = '';
  csHighlights: string[] = [];
  newHighlightInput = '';
  csTechnologies: string[] = [];
  newTechInput = '';

  // Delete Modal
  isDeleteModalOpen = false;
  projectToDelete: ProjectItem | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.adminService.getProjectCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.adminService.getAdminProjects().subscribe({
      next: (items) => {
        this.projects = items;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('Failed to load projects from server.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    let result = [...this.projects];

    // Status filter
    if (this.filterStatus === 'published') {
      result = result.filter(p => p.isPublished);
    } else if (this.filterStatus === 'draft') {
      result = result.filter(p => !p.isPublished);
    }

    // Category filter
    if (this.selectedCategorySlug !== 'all') {
      result = result.filter(p => {
        return p.categoryMaps && p.categoryMaps.some(cm => cm.projectCategory?.slug === this.selectedCategorySlug);
      });
    }

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.clientName && p.clientName.toLowerCase().includes(q)) ||
        (p.categoryBadgeText && p.categoryBadgeText.toLowerCase().includes(q)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.tagName.toLowerCase().includes(q)))
      );
    }

    this.filteredProjects = result;
  }

  setCategoryFilter(slug: string): void {
    this.selectedCategorySlug = slug;
    this.applyFilter();
  }

  setStatusFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentProjectId = null;
    this.activeTab = 'details';

    // Calculate next sort order
    const nextOrder = this.projects.length > 0 
      ? Math.max(...this.projects.map(p => p.sortOrder || 0)) + 1 
      : 1;

    // Reset project form
    this.formTitle = '';
    this.formSlug = '';
    this.formClientName = '';
    this.formCategoryBadgeText = '';
    this.formTimeframe = `${new Date().getFullYear()}`;
    this.formShortDescription = '';
    this.formImageUrl = '';
    this.formImageAlt = '';
    this.formIconKey = 'code';
    this.formLiveUrl = '';
    this.formGithubUrl = '';
    this.formArticleUrl = '';
    this.formHasCaseStudy = false;
    this.formIsPublished = true;
    this.formSortOrder = nextOrder;
    this.formTagsInput = '';
    this.selectedCategoryIds = [];

    // Reset case study form
    this.csTitle = '';
    this.csCategoryLabel = '';
    this.csYear = `${new Date().getFullYear()}`;
    this.csClientName = '';
    this.csHeroImageUrl = '';
    this.csSummary = '';
    this.csLiveUrl = '';
    this.csHighlights = [];
    this.newHighlightInput = '';
    this.csTechnologies = [];
    this.newTechInput = '';

    this.isEditorOpen = true;
  }

  openEditModal(project: ProjectItem): void {
    this.isEditing = true;
    this.currentProjectId = project.id;
    this.activeTab = 'details';

    // Populate project form
    this.formTitle = project.title || '';
    this.formSlug = project.slug || '';
    this.formClientName = project.clientName || '';
    this.formCategoryBadgeText = project.categoryBadgeText || '';
    this.formTimeframe = project.timeframe || '';
    this.formShortDescription = project.shortDescription || '';
    this.formImageUrl = project.imageUrl || '';
    this.formImageAlt = project.imageAlt || '';
    this.formIconKey = project.iconKey || '';
    this.formLiveUrl = project.liveUrl || '';
    this.formGithubUrl = project.githubUrl || '';
    this.formArticleUrl = project.articleUrl || '';
    this.formHasCaseStudy = project.hasCaseStudy;
    this.formIsPublished = project.isPublished;
    this.formSortOrder = project.sortOrder;
    this.formTagsInput = project.tags ? project.tags.map(t => t.tagName).join(', ') : '';

    this.selectedCategoryIds = project.categoryMaps 
      ? project.categoryMaps.map(cm => cm.projectCategory?.id || cm.projectCategoryId || '').filter(id => id.length > 0)
      : [];

    // Reset / Populate Case Study
    this.csTitle = project.title || '';
    this.csCategoryLabel = project.categoryBadgeText || '';
    this.csYear = project.timeframe || '';
    this.csClientName = project.clientName || '';
    this.csHeroImageUrl = project.imageUrl || '';
    this.csSummary = project.shortDescription || '';
    this.csLiveUrl = project.liveUrl || '';
    this.csHighlights = [];
    this.newHighlightInput = '';
    this.csTechnologies = [];
    this.newTechInput = '';

    if (project.caseStudy) {
      this.populateCaseStudyFields(project.caseStudy);
    } else if (project.hasCaseStudy) {
      // Fetch latest case study details
      this.adminService.getCaseStudy(project.id).subscribe({
        next: (cs) => {
          this.populateCaseStudyFields(cs);
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    }

    this.isEditorOpen = true;
  }

  private populateCaseStudyFields(cs: CaseStudyDetail): void {
    this.csTitle = cs.title || this.formTitle;
    this.csCategoryLabel = cs.categoryLabel || this.formCategoryBadgeText;
    this.csYear = cs.year || this.formTimeframe;
    this.csClientName = cs.clientName || this.formClientName;
    this.csHeroImageUrl = cs.heroImageUrl || this.formImageUrl;
    this.csSummary = cs.summary || this.formShortDescription;
    this.csLiveUrl = cs.liveUrl || this.formLiveUrl;
    this.csHighlights = cs.highlights ? cs.highlights.map(h => h.highlightText) : [];
    this.csTechnologies = cs.technologies ? cs.technologies.map(t => t.name) : [];
  }

  closeEditor(): void {
    this.isEditorOpen = false;
    this.currentProjectId = null;
  }

  onTitleChange(): void {
    if (!this.isEditing && !this.formSlug) {
      this.formSlug = this.generateSlug(this.formTitle);
    }
  }

  generateSlug(val: string): string {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  toggleCategory(catId: string): void {
    const idx = this.selectedCategoryIds.indexOf(catId);
    if (idx > -1) {
      this.selectedCategoryIds.splice(idx, 1);
    } else {
      this.selectedCategoryIds.push(catId);
    }
  }

  isCategorySelected(catId: string): boolean {
    return this.selectedCategoryIds.includes(catId);
  }

  // Case Study highlights
  addHighlight(): void {
    const txt = this.newHighlightInput.trim();
    if (txt) {
      this.csHighlights.push(txt);
      this.newHighlightInput = '';
    }
  }

  removeHighlight(index: number): void {
    this.csHighlights.splice(index, 1);
  }

  // Case Study technologies
  addTech(): void {
    const txt = this.newTechInput.trim();
    if (txt) {
      this.csTechnologies.push(txt);
      this.newTechInput = '';
    }
  }

  removeTech(index: number): void {
    this.csTechnologies.splice(index, 1);
  }

  // Image Upload handler
  onImageFileSelected(event: Event, target: 'project' | 'casestudy'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.isUploading = true;
      this.adminService.uploadMedia(file).subscribe({
        next: (res) => {
          this.isUploading = false;
          if (target === 'project') {
            this.formImageUrl = res.url;
            if (!this.csHeroImageUrl) this.csHeroImageUrl = res.url;
          } else {
            this.csHeroImageUrl = res.url;
          }
          this.showToast('Image uploaded successfully!', 'success');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isUploading = false;
          this.showToast('Upload failed: ' + (err.error?.message || 'Check server connection'), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Save Project
  saveProject(): void {
    if (!this.formTitle.trim()) {
      this.showToast('Project title is required.', 'error');
      return;
    }

    if (!this.formSlug.trim()) {
      this.formSlug = this.generateSlug(this.formTitle);
    }

    const tagsArray = this.formTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const projectDto: ProjectCreateUpdateDto = {
      title: this.formTitle.trim(),
      slug: this.formSlug.trim().toLowerCase(),
      clientName: this.formClientName.trim(),
      categoryBadgeText: this.formCategoryBadgeText.trim(),
      timeframe: this.formTimeframe.trim(),
      shortDescription: this.formShortDescription.trim(),
      imageUrl: this.formImageUrl.trim() || undefined,
      imageAlt: this.formImageAlt.trim() || this.formTitle.trim(),
      iconKey: this.formIconKey.trim() || 'code',
      liveUrl: this.formLiveUrl.trim() || undefined,
      githubUrl: this.formGithubUrl.trim() || undefined,
      articleUrl: this.formArticleUrl.trim() || undefined,
      hasCaseStudy: this.formHasCaseStudy,
      isPublished: this.formIsPublished,
      sortOrder: Number(this.formSortOrder) || 1,
      tags: tagsArray,
      categoryIds: this.selectedCategoryIds
    };

    this.isSaving = true;

    if (this.isEditing && this.currentProjectId) {
      const projId = this.currentProjectId;
      this.adminService.updateProject(projId, projectDto).subscribe({
        next: () => {
          // If case study enabled, also update case study
          if (this.formHasCaseStudy) {
            this.saveCaseStudyForProject(projId);
          } else {
            this.isSaving = false;
            this.isEditorOpen = false;
            this.showToast('Project updated successfully!', 'success');
            this.loadData();
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to update project: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create new project
      this.adminService.createProject(projectDto).subscribe({
        next: (created) => {
          if (this.formHasCaseStudy && created.id) {
            this.saveCaseStudyForProject(created.id);
          } else {
            this.isSaving = false;
            this.isEditorOpen = false;
            this.showToast('Project created successfully!', 'success');
            this.loadData();
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to create project: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  private saveCaseStudyForProject(projectId: string): void {
    const csDto: CaseStudyUpdateDto = {
      title: this.csTitle.trim() || this.formTitle.trim(),
      categoryLabel: this.csCategoryLabel.trim() || this.formCategoryBadgeText.trim(),
      year: this.csYear.trim() || this.formTimeframe.trim(),
      clientName: this.csClientName.trim() || this.formClientName.trim(),
      heroImageUrl: this.csHeroImageUrl.trim() || this.formImageUrl.trim() || undefined,
      summary: this.csSummary.trim() || this.formShortDescription.trim(),
      liveUrl: this.csLiveUrl.trim() || this.formLiveUrl.trim() || undefined,
      highlights: this.csHighlights,
      technologies: this.csTechnologies
    };

    this.adminService.updateCaseStudy(projectId, csDto).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditorOpen = false;
        this.showToast(this.isEditing ? 'Project & Case Study updated!' : 'Project & Case Study created!', 'success');
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast('Project saved, but Case Study update encountered an issue.', 'error');
        this.loadData();
      }
    });
  }

  quickTogglePublish(project: ProjectItem, event: Event): void {
    event.stopPropagation();
    const updatedStatus = !project.isPublished;

    const dto: ProjectCreateUpdateDto = {
      title: project.title,
      slug: project.slug,
      clientName: project.clientName,
      categoryBadgeText: project.categoryBadgeText,
      timeframe: project.timeframe,
      shortDescription: project.shortDescription,
      imageUrl: project.imageUrl,
      imageAlt: project.imageAlt,
      iconKey: project.iconKey,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      articleUrl: project.articleUrl,
      hasCaseStudy: project.hasCaseStudy,
      isPublished: updatedStatus,
      sortOrder: project.sortOrder,
      tags: project.tags ? project.tags.map(t => t.tagName) : [],
      categoryIds: project.categoryMaps ? project.categoryMaps.map(cm => cm.projectCategory?.id || cm.projectCategoryId || '').filter(Boolean) : []
    };

    this.adminService.updateProject(project.id, dto).subscribe({
      next: () => {
        project.isPublished = updatedStatus;
        this.applyFilter();
        this.showToast(`Project ${updatedStatus ? 'published' : 'moved to drafts'}.`, 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('Failed to update status.', 'error');
      }
    });
  }

  // Delete modal
  openDeleteModal(project: ProjectItem, event: Event): void {
    event.stopPropagation();
    this.projectToDelete = project;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.projectToDelete = null;
    this.isDeleteModalOpen = false;
  }

  executeDelete(): void {
    if (!this.projectToDelete) return;
    this.isDeleting = true;

    this.adminService.deleteProject(this.projectToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.showToast(`Deleted "${this.projectToDelete?.title}"`, 'success');
        this.projectToDelete = null;
        this.loadData();
      },
      error: (err) => {
        this.isDeleting = false;
        this.showToast('Failed to delete project: ' + (err.error?.message || err.message), 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // Category Selection & Management
  saveNewCategory(): void {
    const label = this.newCategoryLabel.trim();
    if (!label) return;
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    this.isSavingCategory = true;
    this.adminService.createProjectCategory({ label, slug, sortOrder: this.categories.length + 1, isActive: true }).subscribe({
      next: (created) => {
        this.isSavingCategory = false;
        this.newCategoryLabel = '';
        this.isAddingCategory = false;
        this.categories.push(created);
        if (!this.selectedCategoryIds.includes(created.id)) {
          this.selectedCategoryIds.push(created.id);
        }
        this.showToast(`Category "${created.label}" created!`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingCategory = false;
        this.showToast('Failed to create category: ' + (err.error?.message || 'Error occurred'), 'error');
        this.cdr.detectChanges();
      }
    });
  }

  deleteCategory(cat: ProjectCategoryItem, event: Event): void {
    event.stopPropagation();
    if (cat.slug === 'all') {
      this.showToast('The "All" category cannot be removed.', 'error');
      return;
    }
    if (!confirm(`Are you sure you want to delete category "${cat.label}"?`)) {
      return;
    }
    this.adminService.deleteProjectCategory(cat.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== cat.id);
        this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== cat.id);
        this.showToast(`Category "${cat.label}" deleted.`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast('Failed to delete category: ' + (err.error?.message || 'Error occurred'), 'error');
        this.cdr.detectChanges();
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    if (type === 'success') {
      this.toast.success(msg);
    } else {
      this.toast.error(msg);
    }
  }
}
