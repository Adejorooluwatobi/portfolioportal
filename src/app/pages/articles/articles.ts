import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  PortfolioAdminService, 
  ArticleItem, 
  ArticleCreateUpdateDto,
  ArticleLinkCreateDto,
  ArticleLinkItem
} from '../../services/portfolio-admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles.html',
  styleUrls: ['./articles.scss']
})
export class ArticlesComponent implements OnInit {
  private adminService = inject(PortfolioAdminService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  articles: ArticleItem[] = [];
  filteredArticles: ArticleItem[] = [];
  categories: string[] = [];

  // Filter state
  searchQuery = '';
  selectedCategory = 'all';
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
  currentArticleId: string | null = null;

  // Article Form Model
  formTitle = '';
  formSlug = '';
  formExcerpt = '';
  formCategory = '';
  formPublicationType = 'Software Development Guide';
  formPublishStatus = 'Published';
  formReadTimeMinutes = 5;
  formImageUrl = '';
  formImageAlt = '';
  formLinkedinUrl = '';
  formTwitterUrl = '';
  formFooterAnnotation = '';
  formPublishedDate = '';
  formIsActive = true;
  formSortOrder = 1;
  formTagsInput = '';

  // Dynamic Article Links
  formLinks: ArticleLinkCreateDto[] = [];
  linkIconPresets = [
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'X / Twitter', value: 'twitter' },
    { label: 'Medium', value: 'medium' },
    { label: 'Dev.to', value: 'devto' },
    { label: 'GitHub', value: 'github' },
    { label: 'Website / External', value: 'globe' },
    { label: 'Hashnode', value: 'hashnode' },
    { label: 'YouTube', value: 'youtube' },
    { label: 'Document / PDF', value: 'file' }
  ];

  addArticleLink(): void {
    this.formLinks.push({
      title: '',
      url: '',
      icon: 'globe',
      sortOrder: this.formLinks.length + 1
    });
  }

  removeArticleLink(index: number): void {
    if (index >= 0 && index < this.formLinks.length) {
      this.formLinks.splice(index, 1);
    }
  }

  getLinkIcon(icon: string | undefined): string {
    if (!icon) return 'globe';
    return icon.trim().toLowerCase();
  }

  // Delete Modal
  isDeleteModalOpen = false;
  articleToDelete: ArticleItem | null = null;

  // Publication types presets
  publicationTypes = [
    'Software Development Guide',
    'Architecture Blueprint',
    'Technical Deep-Dive',
    'LinkedIn Technical Post',
    'Engineering Note'
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.adminService.getAdminArticles().subscribe({
      next: (items) => {
        this.articles = items;
        this.extractCategories();
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('Failed to load articles from server.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  extractCategories(): void {
    const set = new Set<string>();
    this.articles.forEach(a => {
      if (a.category && a.category.trim()) {
        set.add(a.category.trim());
      }
    });
    this.categories = Array.from(set);
  }

  applyFilter(): void {
    let result = [...this.articles];

    // Status filter
    if (this.filterStatus === 'published') {
      result = result.filter(a => a.isActive && a.publishStatus?.toLowerCase() === 'published');
    } else if (this.filterStatus === 'draft') {
      result = result.filter(a => !a.isActive || a.publishStatus?.toLowerCase() !== 'published');
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      result = result.filter(a => a.category?.trim() === this.selectedCategory);
    }

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(a => 
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.publicationType && a.publicationType.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some(t => t.tagName.toLowerCase().includes(q)))
      );
    }

    this.filteredArticles = result;
  }

  setCategoryFilter(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilter();
  }

  setStatusFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentArticleId = null;

    const nextOrder = this.articles.length > 0 
      ? Math.max(...this.articles.map(a => a.sortOrder || 0)) + 1 
      : 1;

    const todayStr = new Date().toISOString().split('T')[0];

    this.formTitle = '';
    this.formSlug = '';
    this.formExcerpt = '';
    this.formCategory = this.categories.length > 0 ? this.categories[0] : 'Backend & Architecture';
    this.formPublicationType = 'Software Development Guide';
    this.formPublishStatus = 'Published';
    this.formReadTimeMinutes = 5;
    this.formImageUrl = '';
    this.formImageAlt = '';
    this.formLinkedinUrl = '';
    this.formTwitterUrl = '';
    this.formFooterAnnotation = '';
    this.formPublishedDate = todayStr;
    this.formIsActive = true;
    this.formSortOrder = nextOrder;
    this.formTagsInput = '';
    this.formLinks = [];

    this.isEditorOpen = true;
  }

  openEditModal(article: ArticleItem): void {
    this.isEditing = true;
    this.currentArticleId = article.id;

    this.formTitle = article.title || '';
    this.formSlug = article.slug || '';
    this.formExcerpt = article.excerpt || '';
    this.formCategory = article.category || '';
    this.formPublicationType = article.publicationType || 'Software Development Guide';
    this.formPublishStatus = article.publishStatus || 'Published';
    this.formReadTimeMinutes = article.readTimeMinutes || 5;
    this.formImageUrl = article.imageUrl || '';
    this.formImageAlt = article.imageAlt || '';
    this.formLinkedinUrl = article.linkedinUrl || '';
    this.formTwitterUrl = article.twitterUrl || '';
    this.formFooterAnnotation = article.footerAnnotation || '';
    this.formPublishedDate = article.publishedAt ? article.publishedAt.split('T')[0] : '';
    this.formIsActive = article.isActive;
    this.formSortOrder = article.sortOrder;
    this.formTagsInput = article.tags ? article.tags.map(t => t.tagName).join(', ') : '';

    if (article.links && article.links.length > 0) {
      this.formLinks = article.links.map((l, i) => ({
        title: l.title,
        url: l.url,
        icon: l.icon || 'globe',
        sortOrder: l.sortOrder || i + 1
      }));
    } else {
      this.formLinks = [];
      if (article.linkedinUrl) {
        this.formLinks.push({ title: 'LinkedIn', url: article.linkedinUrl, icon: 'linkedin', sortOrder: 1 });
      }
      if (article.twitterUrl) {
        this.formLinks.push({ title: 'X / Twitter', url: article.twitterUrl, icon: 'twitter', sortOrder: 2 });
      }
    }

    this.isEditorOpen = true;
  }

  closeEditor(): void {
    this.isEditorOpen = false;
    this.currentArticleId = null;
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

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.isUploading = true;
      this.adminService.uploadMedia(file, 'portfolio/articles').subscribe({
        next: (res) => {
          this.isUploading = false;
          this.formImageUrl = res.url;
          this.showToast('Article image uploaded!', 'success');
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

  saveArticle(): void {
    if (!this.formTitle.trim()) {
      this.showToast('Article title is required.', 'error');
      return;
    }

    if (!this.formSlug.trim()) {
      this.formSlug = this.generateSlug(this.formTitle);
    }

    const tagsArray = this.formTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const publishedAtDate = this.formPublishedDate ? new Date(this.formPublishedDate).toISOString() : new Date().toISOString();

    const validLinks: ArticleLinkCreateDto[] = this.formLinks
      .filter(l => l.title && l.title.trim() && l.url && l.url.trim())
      .map((l, i) => ({
        title: l.title.trim(),
        url: l.url.trim(),
        icon: l.icon?.trim() || 'globe',
        sortOrder: i + 1
      }));

    const firstLinkedin = validLinks.find(l => l.icon === 'linkedin' || l.title.toLowerCase().includes('linkedin'))?.url || this.formLinkedinUrl.trim() || undefined;
    const firstTwitter = validLinks.find(l => l.icon === 'twitter' || l.title.toLowerCase().includes('twitter') || l.title.toLowerCase() === 'x')?.url || this.formTwitterUrl.trim() || undefined;

    const dto: ArticleCreateUpdateDto = {
      title: this.formTitle.trim(),
      slug: this.formSlug.trim().toLowerCase(),
      excerpt: this.formExcerpt.trim(),
      category: this.formCategory.trim(),
      publicationType: this.formPublicationType.trim(),
      publishStatus: this.formPublishStatus.trim(),
      readTimeMinutes: Number(this.formReadTimeMinutes) || 5,
      imageUrl: this.formImageUrl.trim() || undefined,
      imageAlt: this.formImageAlt.trim() || this.formTitle.trim(),
      linkedinUrl: firstLinkedin,
      twitterUrl: firstTwitter,
      footerAnnotation: this.formFooterAnnotation.trim() || undefined,
      publishedAt: publishedAtDate,
      isActive: this.formIsActive,
      sortOrder: Number(this.formSortOrder) || 1,
      tags: tagsArray,
      links: validLinks
    };

    this.isSaving = true;

    if (this.isEditing && this.currentArticleId) {
      this.adminService.updateArticle(this.currentArticleId, dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isEditorOpen = false;
          this.showToast('Article updated successfully!', 'success');
          this.loadData();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to update article: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.adminService.createArticle(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isEditorOpen = false;
          this.showToast('Article published successfully!', 'success');
          this.loadData();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to create article: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  quickToggleActive(article: ArticleItem, event: Event): void {
    event.stopPropagation();
    const updatedStatus = !article.isActive;

    const dto: ArticleCreateUpdateDto = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      publicationType: article.publicationType,
      publishStatus: updatedStatus ? 'Published' : 'Draft',
      readTimeMinutes: article.readTimeMinutes,
      imageUrl: article.imageUrl,
      imageAlt: article.imageAlt,
      linkedinUrl: article.linkedinUrl,
      twitterUrl: article.twitterUrl,
      footerAnnotation: article.footerAnnotation,
      publishedAt: article.publishedAt,
      isActive: updatedStatus,
      sortOrder: article.sortOrder,
      tags: article.tags ? article.tags.map(t => t.tagName) : [],
      links: article.links ? article.links.map((l, i) => ({ title: l.title, url: l.url, icon: l.icon || 'globe', sortOrder: l.sortOrder || i + 1 })) : []
    };

    this.adminService.updateArticle(article.id, dto).subscribe({
      next: () => {
        article.isActive = updatedStatus;
        article.publishStatus = updatedStatus ? 'Published' : 'Draft';
        this.applyFilter();
        this.showToast(`Article ${updatedStatus ? 'published' : 'moved to drafts'}.`, 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('Failed to update status.', 'error');
      }
    });
  }

  openDeleteModal(article: ArticleItem, event: Event): void {
    event.stopPropagation();
    this.articleToDelete = article;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.articleToDelete = null;
    this.isDeleteModalOpen = false;
  }

  executeDelete(): void {
    if (!this.articleToDelete) return;
    this.isDeleting = true;

    this.adminService.deleteArticle(this.articleToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.showToast(`Deleted "${this.articleToDelete?.title}"`, 'success');
        this.articleToDelete = null;
        this.loadData();
      },
      error: (err) => {
        this.isDeleting = false;
        this.showToast('Failed to delete article: ' + (err.error?.message || err.message), 'error');
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
