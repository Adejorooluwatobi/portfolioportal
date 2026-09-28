import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  PortfolioAdminService, 
  ProfileDetail, 
  HeroSectionDetail, 
  SocialLinkItem, 
  SocialLinkCreateUpdateDto,
  DisciplineCardItem,
  DisciplineCardCreateUpdateDto
} from '../../services/portfolio-admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  private adminService = inject(PortfolioAdminService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'details' | 'hero' | 'socials' | 'disciplines' = 'details';

  // Loading & State
  isLoading = false;
  isSavingProfile = false;
  isSavingHero = false;
  isUploadingAvatar = false;
  isUploadingCv = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // Profile Details Model
  profile: ProfileDetail = {
    fullName: '',
    primaryTitle: '',
    sidebarTitle: '',
    avatarImageUrl: '',
    avatarAltText: '',
    email: '',
    phone: '',
    phoneDisplay: '',
    whatsappUrl: '',
    location: '',
    locationDisplay: '',
    cvFileUrl: '',
    cvDownloadName: '',
    isAvailable: true,
    availabilityText: '',
    employmentStatus: '',
    responseTime: '',
    engagementScope: '',
    responseGuarantee: '',
    yearsExperience: 4,
    yearsExperienceSuffix: '4+',
    yearsExperienceLabel: 'Production Systems',
    projectsCompleted: 25,
    projectsCompletedSuffix: '25+',
    projectsLabel: 'Web & Cloud APIs'
  };

  // Hero Section Model
  hero: HeroSectionDetail = {
    categoryBadgeText: '',
    categoryBadgeIcon: '',
    headline: '',
    bioLead: '',
    bioFrontend: '',
    bioBackend: '',
    primaryCtaText: '',
    primaryCtaUrl: '',
    primaryCtaIcon: '',
    secondaryCtaText: '',
    secondaryCtaUrl: '',
    secondaryCtaIcon: '',
    tertiaryCtaText: '',
    tertiaryCtaUrl: '',
    tertiaryCtaIcon: ''
  };

  // Social Links
  socials: SocialLinkItem[] = [];

  // Social Modal State
  isSocialModalOpen = false;
  isEditingSocial = false;
  currentSocialId: string | null = null;
  socialPlatform = 'GitHub';
  socialTitle = '';
  socialUrl = '';
  socialIcon = 'github';
  socialShowInHeader = true;
  socialShowInFooter = true;
  socialShowInSidebar = true;
  socialSortOrder = 1;
  socialIsActive = true;

  // Social Delete Modal
  isDeleteModalOpen = false;
  socialToDelete: SocialLinkItem | null = null;
  isDeletingSocial = false;

  platforms = [
    { label: 'GitHub', icon: 'github', defaultUrl: 'https://github.com/' },
    { label: 'LinkedIn', icon: 'linkedin', defaultUrl: 'https://linkedin.com/in/' },
    { label: 'Twitter / X', icon: 'twitter', defaultUrl: 'https://x.com/' },
    { label: 'WhatsApp', icon: 'whatsapp', defaultUrl: 'https://wa.me/' },
    { label: 'Email', icon: 'mail', defaultUrl: 'mailto:' },
    { label: 'Portfolio / Website', icon: 'globe', defaultUrl: 'https://' }
  ];

  // What I Do (Core Competencies)
  disciplines: DisciplineCardItem[] = [];
  isLoadingDisciplines = false;
  isDisciplineModalOpen = false;
  isEditingDiscipline = false;
  selectedDisciplineId: string | null = null;
  disciplineForm: DisciplineCardCreateUpdateDto = {
    indexTag: '',
    icon: 'palette',
    title: '',
    description: '',
    sortOrder: 1,
    tags: []
  };
  newDisciplineTag = '';
  isSavingDiscipline = false;
  disciplineToDelete: DisciplineCardItem | null = null;
  isDeleteDisciplineModalOpen = false;
  isDeletingDiscipline = false;

  commonIcons = [
    { label: 'Palette (Design / UI)', value: 'palette' },
    { label: 'Widgets (Apps / Systems)', value: 'widgets' },
    { label: 'DNS (Backend / Cloud)', value: 'dns' },
    { label: 'Rocket (Performance / Speed)', value: 'rocket_launch' },
    { label: 'Terminal (Code / CLI)', value: 'terminal' },
    { label: 'Database (Data / SQL)', value: 'database' },
    { label: 'Security (Auth / Security)', value: 'shield' },
    { label: 'Code (Frontend / Dev)', value: 'code' },
    { label: 'Devices (Responsive / Mobile)', value: 'devices' },
    { label: 'Speed (Optimization)', value: 'speed' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.adminService.getAdminProfile().subscribe({
      next: (data) => {
        if (data) this.profile = { ...this.profile, ...data };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Failed to load profile details.', 'error');
        this.cdr.detectChanges();
      }
    });

    this.adminService.getAdminHero().subscribe({
      next: (data) => {
        if (data) this.hero = { ...this.hero, ...data };
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.loadSocials();
    this.loadDisciplines();
  }

  getImageUrl(url: string | undefined): string {
    return this.adminService.getImageUrl(url);
  }

  loadSocials(): void {
    this.adminService.getAdminSocials().subscribe({
      next: (items) => {
        this.socials = items || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // Save Profile
  saveProfile(): void {
    if (!this.profile.fullName.trim()) {
      this.showToast('Full name is required.', 'error');
      return;
    }

    this.isSavingProfile = true;
    this.adminService.updateAdminProfile(this.profile).subscribe({
      next: () => {
        this.isSavingProfile = false;
        this.showToast('Profile information saved successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.showToast('Failed to save profile: ' + (err.error?.message || err.message), 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // Save Hero Section
  saveHero(): void {
    if (!this.hero.headline.trim()) {
      this.showToast('Headline is required.', 'error');
      return;
    }

    this.isSavingHero = true;
    this.adminService.updateAdminHero(this.hero).subscribe({
      next: () => {
        this.isSavingHero = false;
        this.showToast('Hero section & bio updated successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingHero = false;
        this.showToast('Failed to save hero section: ' + (err.error?.message || err.message), 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // Avatar Upload
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.isUploadingAvatar = true;
      this.adminService.uploadMedia(file, 'portfolio/avatars').subscribe({
        next: (res) => {
          this.isUploadingAvatar = false;
          this.profile.avatarImageUrl = res.url;
          this.showToast('Avatar image uploaded!', 'success');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isUploadingAvatar = false;
          this.showToast('Avatar upload failed: ' + (err.error?.message || 'Check connection'), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // CV Document Upload
  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.isUploadingCv = true;
      this.adminService.uploadDocument(file, 'portfolio/docs').subscribe({
        next: (res) => {
          this.isUploadingCv = false;
          this.profile.cvFileUrl = res.url;
          if (!this.profile.cvDownloadName) {
            this.profile.cvDownloadName = file.name;
          }
          this.showToast('CV document uploaded!', 'success');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isUploadingCv = false;
          this.showToast('CV upload failed: ' + (err.error?.message || 'Check connection'), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Socials Management
  openCreateSocialModal(): void {
    this.isEditingSocial = false;
    this.currentSocialId = null;

    const nextOrder = this.socials.length > 0 
      ? Math.max(...this.socials.map(s => s.sortOrder || 0)) + 1 
      : 1;

    this.socialPlatform = 'GitHub';
    this.socialTitle = 'GitHub Profile';
    this.socialUrl = 'https://github.com/';
    this.socialIcon = 'github';
    this.socialShowInHeader = true;
    this.socialShowInFooter = true;
    this.socialShowInSidebar = true;
    this.socialSortOrder = nextOrder;
    this.socialIsActive = true;

    this.isSocialModalOpen = true;
  }

  openEditSocialModal(social: SocialLinkItem): void {
    this.isEditingSocial = true;
    this.currentSocialId = social.id;

    this.socialPlatform = social.platform || 'GitHub';
    this.socialTitle = social.title || '';
    this.socialUrl = social.url || '';
    this.socialIcon = social.icon || 'github';
    this.socialShowInHeader = social.showInHeader;
    this.socialShowInFooter = social.showInFooter;
    this.socialShowInSidebar = social.showInSidebar;
    this.socialSortOrder = social.sortOrder;
    this.socialIsActive = social.isActive;

    this.isSocialModalOpen = true;
  }

  onPlatformSelected(platformName: string): void {
    const p = this.platforms.find(x => x.label === platformName);
    if (p) {
      this.socialIcon = p.icon;
      if (!this.isEditingSocial) {
        this.socialTitle = `${p.label} Profile`;
        this.socialUrl = p.defaultUrl;
      }
    }
  }

  closeSocialModal(): void {
    this.isSocialModalOpen = false;
    this.currentSocialId = null;
  }

  saveSocial(): void {
    if (!this.socialTitle.trim() || !this.socialUrl.trim()) {
      this.showToast('Social title and URL are required.', 'error');
      return;
    }

    const dto: SocialLinkCreateUpdateDto = {
      platform: this.socialPlatform.trim(),
      title: this.socialTitle.trim(),
      url: this.socialUrl.trim(),
      icon: this.socialIcon.trim() || 'globe',
      showInHeader: this.socialShowInHeader,
      showInFooter: this.socialShowInFooter,
      showInSidebar: this.socialShowInSidebar,
      sortOrder: Number(this.socialSortOrder) || 1,
      isActive: this.socialIsActive
    };

    if (this.isEditingSocial && this.currentSocialId) {
      this.adminService.updateAdminSocial(this.currentSocialId, dto).subscribe({
        next: () => {
          this.isSocialModalOpen = false;
          this.showToast('Social link updated!', 'success');
          this.loadSocials();
        },
        error: (err) => {
          this.showToast('Failed to update social link: ' + (err.error?.message || err.message), 'error');
        }
      });
    } else {
      this.adminService.createAdminSocial(dto).subscribe({
        next: () => {
          this.isSocialModalOpen = false;
          this.showToast('Social link created!', 'success');
          this.loadSocials();
        },
        error: (err) => {
          this.showToast('Failed to create social link: ' + (err.error?.message || err.message), 'error');
        }
      });
    }
  }

  openDeleteSocial(social: SocialLinkItem, event: Event): void {
    event.stopPropagation();
    this.socialToDelete = social;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.socialToDelete = null;
  }

  executeDeleteSocial(): void {
    if (!this.socialToDelete) return;
    this.isDeletingSocial = true;

    this.adminService.deleteAdminSocial(this.socialToDelete.id).subscribe({
      next: () => {
        this.isDeletingSocial = false;
        this.isDeleteModalOpen = false;
        this.showToast(`Deleted "${this.socialToDelete?.title}"`, 'success');
        this.socialToDelete = null;
        this.loadSocials();
      },
      error: (err) => {
        this.isDeletingSocial = false;
        this.showToast('Failed to delete social: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  // ==========================================
  // What I Do (Core Competencies) Methods
  // ==========================================

  loadDisciplines(): void {
    this.isLoadingDisciplines = true;
    this.adminService.getAdminDisciplines().subscribe({
      next: (items) => {
        this.disciplines = items || [];
        this.isLoadingDisciplines = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingDisciplines = false;
        console.error('Failed to load disciplines:', err);
        this.cdr.detectChanges();
      }
    });
  }

  openAddDiscipline(): void {
    this.isEditingDiscipline = false;
    this.selectedDisciplineId = null;
    this.disciplineForm = {
      indexTag: `0${this.disciplines.length + 1} // DOMAIN`,
      icon: 'palette',
      title: '',
      description: '',
      sortOrder: this.disciplines.length + 1,
      tags: []
    };
    this.newDisciplineTag = '';
    this.isDisciplineModalOpen = true;
  }

  openEditDiscipline(card: DisciplineCardItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.isEditingDiscipline = true;
    this.selectedDisciplineId = card.id;
    this.disciplineForm = {
      indexTag: card.indexTag || '',
      icon: card.icon || 'palette',
      title: card.title || '',
      description: card.description || '',
      sortOrder: card.sortOrder || 1,
      tags: (card.tags || []).map(t => typeof t === 'string' ? t : t.tagName)
    };
    this.newDisciplineTag = '';
    this.isDisciplineModalOpen = true;
  }

  closeDisciplineModal(): void {
    this.isDisciplineModalOpen = false;
    this.selectedDisciplineId = null;
  }

  addDisciplineTag(): void {
    const tag = this.newDisciplineTag.trim();
    if (!tag) return;
    if (!this.disciplineForm.tags.includes(tag)) {
      this.disciplineForm.tags.push(tag);
    }
    this.newDisciplineTag = '';
  }

  removeDisciplineTag(index: number): void {
    if (index >= 0 && index < this.disciplineForm.tags.length) {
      this.disciplineForm.tags.splice(index, 1);
    }
  }

  saveDiscipline(): void {
    if (!this.disciplineForm.title.trim()) {
      this.showToast('Title is required.', 'error');
      return;
    }
    if (!this.disciplineForm.description.trim()) {
      this.showToast('Description is required.', 'error');
      return;
    }

    // Auto-commit any unsaved text in tag input
    if (this.newDisciplineTag.trim()) {
      this.addDisciplineTag();
    }

    this.isSavingDiscipline = true;

    if (this.isEditingDiscipline && this.selectedDisciplineId) {
      this.adminService.updateAdminDiscipline(this.selectedDisciplineId, this.disciplineForm).subscribe({
        next: () => {
          this.isSavingDiscipline = false;
          this.isDisciplineModalOpen = false;
          this.showToast(`Updated "${this.disciplineForm.title}"`, 'success');
          this.loadDisciplines();
        },
        error: (err) => {
          this.isSavingDiscipline = false;
          this.showToast('Failed to update competency: ' + (err.error?.message || err.message), 'error');
        }
      });
    } else {
      this.adminService.createAdminDiscipline(this.disciplineForm).subscribe({
        next: () => {
          this.isSavingDiscipline = false;
          this.isDisciplineModalOpen = false;
          this.showToast(`Created "${this.disciplineForm.title}"`, 'success');
          this.loadDisciplines();
        },
        error: (err) => {
          this.isSavingDiscipline = false;
          this.showToast('Failed to create competency: ' + (err.error?.message || err.message), 'error');
        }
      });
    }
  }

  openDeleteDiscipline(card: DisciplineCardItem, event: Event): void {
    event.stopPropagation();
    this.disciplineToDelete = card;
    this.isDeleteDisciplineModalOpen = true;
  }

  closeDeleteDisciplineModal(): void {
    this.isDeleteDisciplineModalOpen = false;
    this.disciplineToDelete = null;
  }

  executeDeleteDiscipline(): void {
    if (!this.disciplineToDelete) return;
    this.isDeletingDiscipline = true;

    this.adminService.deleteAdminDiscipline(this.disciplineToDelete.id).subscribe({
      next: () => {
        this.isDeletingDiscipline = false;
        this.isDeleteDisciplineModalOpen = false;
        this.showToast(`Deleted "${this.disciplineToDelete?.title}"`, 'success');
        this.disciplineToDelete = null;
        this.loadDisciplines();
      },
      error: (err) => {
        this.isDeletingDiscipline = false;
        this.showToast('Failed to delete competency: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  getCleanIcon(icon: string | undefined): string {
    if (!icon) return 'palette';
    return icon.trim().toLowerCase();
  }

  getCardTheme(card: DisciplineCardItem, index: number) {
    const themes = [
      { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.25)' },
      { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.25)' },
      { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.25)' },
      { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.25)' }
    ];
    return themes[index % themes.length];
  }

  showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    if (type === 'success') {
      this.toast.success(msg);
    } else {
      this.toast.error(msg);
    }
  }
}
