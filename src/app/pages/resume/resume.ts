import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  PortfolioAdminService, 
  WorkExperienceItem, 
  WorkExperienceCreateUpdateDto,
  EducationItem,
  EducationCreateUpdateDto,
  SkillCategoryDetail,
  SkillCategoryCreateUpdateDto,
  SkillItem,
  SkillItemCreateUpdateDto
} from '../../services/portfolio-admin.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume.html',
  styleUrls: ['./resume.scss']
})
export class ResumeComponent implements OnInit {
  private adminService = inject(PortfolioAdminService);
  private cdr = inject(ChangeDetectorRef);

  // Active top tab
  activeSection: 'experience' | 'education' | 'skills' = 'experience';

  // Data collections
  experiences: WorkExperienceItem[] = [];
  educations: EducationItem[] = [];
  skillCategories: SkillCategoryDetail[] = [];

  // Search & Filter
  searchQuery = '';
  filteredExperiences: WorkExperienceItem[] = [];
  filteredEducations: EducationItem[] = [];

  // Loading & State flags
  isLoading = false;
  isSaving = false;
  isDeleting = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // --- Work Experience Modal State ---
  isExpModalOpen = false;
  isEditingExp = false;
  currentExpId: string | null = null;
  expJobTitle = '';
  expCompanyName = '';
  expEmploymentType = 'Full-Time';
  expDateRange = '';
  expIsCurrent = false;
  expDescription = '';
  expAccentVariant = 'primary';
  expSortOrder = 1;
  expTechsInput = '';

  // --- Education Modal State ---
  isEduModalOpen = false;
  isEditingEdu = false;
  currentEduId: string | null = null;
  eduDegreeTitle = '';
  eduInstitutionName = '';
  eduLocation = '';
  eduDateRange = '';
  eduCredentialType = 'Degree';
  eduIcon = 'school';
  eduDescription = '';
  eduSortOrder = 1;

  // --- Skill Category Modal State ---
  isCatModalOpen = false;
  isEditingCat = false;
  currentCatId: string | null = null;
  catTitle = '';
  catSubtitle = '';
  catIcon = 'code';
  catAccentColorToken = 'primary';
  catSortOrder = 1;

  // --- Skill Item Modal State ---
  isSkillModalOpen = false;
  isEditingSkill = false;
  currentSkillId: string | null = null;
  targetCategoryId = '';
  targetCategoryTitle = '';
  skillName = '';
  skillProficiency: number | null = 90;
  skillIsPrimary = true;
  skillSortOrder = 1;

  // --- Delete Confirmation State ---
  isDeleteModalOpen = false;
  deleteType: 'experience' | 'education' | 'skillCategory' | 'skillItem' = 'experience';
  itemToDeleteId: string | null = null;
  itemToDeleteTitle: string = '';

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.loadExperiences();
    this.loadEducations();
    this.loadSkillCategories();
  }

  loadExperiences(): void {
    this.adminService.getExperiences().subscribe({
      next: (items) => {
        this.experiences = items;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Failed to load work experiences.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  loadEducations(): void {
    this.adminService.getEducations().subscribe({
      next: (items) => {
        this.educations = items;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadSkillCategories(): void {
    this.adminService.getSkillCategories().subscribe({
      next: (cats) => {
        this.skillCategories = cats;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredExperiences = [...this.experiences];
      this.filteredEducations = [...this.educations];
      return;
    }

    this.filteredExperiences = this.experiences.filter(e => 
      (e.jobTitle && e.jobTitle.toLowerCase().includes(q)) ||
      (e.companyName && e.companyName.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.technologies && e.technologies.some(t => t.name.toLowerCase().includes(q)))
    );

    this.filteredEducations = this.educations.filter(e => 
      (e.degreeTitle && e.degreeTitle.toLowerCase().includes(q)) ||
      (e.institutionName && e.institutionName.toLowerCase().includes(q)) ||
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q))
    );
  }

  // ================= EXPERIENCE ACTIONS =================
  openCreateExpModal(): void {
    this.isEditingExp = false;
    this.currentExpId = null;

    const nextOrder = this.experiences.length > 0 
      ? Math.max(...this.experiences.map(e => e.sortOrder || 0)) + 1 
      : 1;

    this.expJobTitle = '';
    this.expCompanyName = '';
    this.expEmploymentType = 'Full-Time';
    this.expDateRange = `${new Date().getFullYear()} — Present`;
    this.expIsCurrent = true;
    this.expDescription = '';
    this.expAccentVariant = 'primary';
    this.expSortOrder = nextOrder;
    this.expTechsInput = '';

    this.isExpModalOpen = true;
  }

  openEditExpModal(exp: WorkExperienceItem): void {
    this.isEditingExp = true;
    this.currentExpId = exp.id;

    this.expJobTitle = exp.jobTitle || '';
    this.expCompanyName = exp.companyName || '';
    this.expEmploymentType = exp.employmentType || 'Full-Time';
    this.expDateRange = exp.dateRange || '';
    this.expIsCurrent = exp.isCurrent;
    this.expDescription = exp.description || '';
    this.expAccentVariant = exp.accentVariant || 'primary';
    this.expSortOrder = exp.sortOrder;
    this.expTechsInput = exp.technologies ? exp.technologies.map(t => t.name).join(', ') : '';

    this.isExpModalOpen = true;
  }

  closeExpModal(): void {
    this.isExpModalOpen = false;
    this.currentExpId = null;
  }

  saveExperience(): void {
    if (!this.expJobTitle.trim() || !this.expCompanyName.trim()) {
      this.showToast('Job title and company name are required.', 'error');
      return;
    }

    const techs = this.expTechsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const dto: WorkExperienceCreateUpdateDto = {
      jobTitle: this.expJobTitle.trim(),
      companyName: this.expCompanyName.trim(),
      employmentType: this.expEmploymentType.trim(),
      dateRange: this.expDateRange.trim(),
      isCurrent: this.expIsCurrent,
      description: this.expDescription.trim(),
      accentVariant: this.expAccentVariant.trim(),
      sortOrder: Number(this.expSortOrder) || 1,
      technologies: techs
    };

    this.isSaving = true;

    if (this.isEditingExp && this.currentExpId) {
      this.adminService.updateExperience(this.currentExpId, dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isExpModalOpen = false;
          this.showToast('Experience updated successfully!', 'success');
          this.loadExperiences();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to update experience: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.adminService.createExperience(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isExpModalOpen = false;
          this.showToast('Experience added successfully!', 'success');
          this.loadExperiences();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to add experience: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ================= EDUCATION ACTIONS =================
  openCreateEduModal(): void {
    this.isEditingEdu = false;
    this.currentEduId = null;

    const nextOrder = this.educations.length > 0 
      ? Math.max(...this.educations.map(e => e.sortOrder || 0)) + 1 
      : 1;

    this.eduDegreeTitle = '';
    this.eduInstitutionName = '';
    this.eduLocation = '';
    this.eduDateRange = `${new Date().getFullYear() - 3} — ${new Date().getFullYear()}`;
    this.eduCredentialType = 'Degree';
    this.eduIcon = 'school';
    this.eduDescription = '';
    this.eduSortOrder = nextOrder;

    this.isEduModalOpen = true;
  }

  openEditEduModal(edu: EducationItem): void {
    this.isEditingEdu = true;
    this.currentEduId = edu.id;

    this.eduDegreeTitle = edu.degreeTitle || '';
    this.eduInstitutionName = edu.institutionName || '';
    this.eduLocation = edu.location || '';
    this.eduDateRange = edu.dateRange || '';
    this.eduCredentialType = edu.credentialType || 'Degree';
    this.eduIcon = edu.icon || 'school';
    this.eduDescription = edu.description || '';
    this.eduSortOrder = edu.sortOrder;

    this.isEduModalOpen = true;
  }

  closeEduModal(): void {
    this.isEduModalOpen = false;
    this.currentEduId = null;
  }

  saveEducation(): void {
    if (!this.eduDegreeTitle.trim() || !this.eduInstitutionName.trim()) {
      this.showToast('Degree title and institution name are required.', 'error');
      return;
    }

    const dto: EducationCreateUpdateDto = {
      degreeTitle: this.eduDegreeTitle.trim(),
      institutionName: this.eduInstitutionName.trim(),
      location: this.eduLocation.trim(),
      dateRange: this.eduDateRange.trim(),
      icon: this.eduIcon.trim() || 'school',
      description: this.eduDescription.trim(),
      credentialType: this.eduCredentialType.trim(),
      sortOrder: Number(this.eduSortOrder) || 1
    };

    this.isSaving = true;

    if (this.isEditingEdu && this.currentEduId) {
      this.adminService.updateEducation(this.currentEduId, dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isEduModalOpen = false;
          this.showToast('Education updated successfully!', 'success');
          this.loadEducations();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to update education: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.adminService.createEducation(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isEduModalOpen = false;
          this.showToast('Education added successfully!', 'success');
          this.loadEducations();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to add education: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ================= SKILL CATEGORY ACTIONS =================
  openCreateCatModal(): void {
    this.isEditingCat = false;
    this.currentCatId = null;

    const nextOrder = this.skillCategories.length > 0 
      ? Math.max(...this.skillCategories.map(c => c.sortOrder || 0)) + 1 
      : 1;

    this.catTitle = '';
    this.catSubtitle = '';
    this.catIcon = 'code';
    this.catAccentColorToken = 'primary';
    this.catSortOrder = nextOrder;

    this.isCatModalOpen = true;
  }

  openEditCatModal(cat: SkillCategoryDetail): void {
    this.isEditingCat = true;
    this.currentCatId = cat.id;

    this.catTitle = cat.title || '';
    this.catSubtitle = cat.subtitle || '';
    this.catIcon = cat.icon || 'code';
    this.catAccentColorToken = cat.accentColorToken || 'primary';
    this.catSortOrder = cat.sortOrder;

    this.isCatModalOpen = true;
  }

  closeCatModal(): void {
    this.isCatModalOpen = false;
    this.currentCatId = null;
  }

  saveSkillCategory(): void {
    if (!this.catTitle.trim()) {
      this.showToast('Category title is required.', 'error');
      return;
    }

    const dto: SkillCategoryCreateUpdateDto = {
      title: this.catTitle.trim(),
      subtitle: this.catSubtitle.trim(),
      icon: this.catIcon.trim() || 'code',
      accentColorToken: this.catAccentColorToken.trim() || 'primary',
      sortOrder: Number(this.catSortOrder) || 1
    };

    this.isSaving = true;

    if (this.isEditingCat && this.currentCatId) {
      this.adminService.updateSkillCategory(this.currentCatId, dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isCatModalOpen = false;
          this.showToast('Category updated successfully!', 'success');
          this.loadSkillCategories();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to update category: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.adminService.createSkillCategory(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isCatModalOpen = false;
          this.showToast('Category created successfully!', 'success');
          this.loadSkillCategories();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to create category: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ================= SKILL ITEM ACTIONS =================
  openAddSkillModal(cat: SkillCategoryDetail): void {
    this.isEditingSkill = false;
    this.currentSkillId = null;
    this.targetCategoryId = cat.id;
    this.targetCategoryTitle = cat.title;

    const nextOrder = cat.skills && cat.skills.length > 0 
      ? Math.max(...cat.skills.map(s => s.sortOrder || 0)) + 1 
      : 1;

    this.skillName = '';
    this.skillProficiency = 90;
    this.skillIsPrimary = true;
    this.skillSortOrder = nextOrder;

    this.isSkillModalOpen = true;
  }

  openEditSkillModal(cat: SkillCategoryDetail, skill: SkillItem): void {
    this.isEditingSkill = true;
    this.currentSkillId = skill.id;
    this.targetCategoryId = cat.id;
    this.targetCategoryTitle = cat.title;

    this.skillName = skill.name || '';
    this.skillProficiency = skill.proficiencyPercent ?? 90;
    this.skillIsPrimary = skill.isPrimary;
    this.skillSortOrder = skill.sortOrder;

    this.isSkillModalOpen = true;
  }

  closeSkillModal(): void {
    this.isSkillModalOpen = false;
    this.currentSkillId = null;
  }

  saveSkillItem(): void {
    if (!this.skillName.trim()) {
      this.showToast('Skill name is required.', 'error');
      return;
    }

    const dto: SkillItemCreateUpdateDto = {
      skillCategoryId: this.targetCategoryId,
      name: this.skillName.trim(),
      proficiencyPercent: this.skillProficiency !== null ? Number(this.skillProficiency) : undefined,
      isPrimary: this.skillIsPrimary,
      sortOrder: Number(this.skillSortOrder) || 1
    };

    this.isSaving = true;

    if (this.isEditingSkill && this.currentSkillId) {
      this.adminService.updateSkillItem(this.currentSkillId, dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isSkillModalOpen = false;
          this.showToast('Skill updated successfully!', 'success');
          this.loadSkillCategories();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to update skill: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.adminService.createSkillItem(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.isSkillModalOpen = false;
          this.showToast('Skill added successfully!', 'success');
          this.loadSkillCategories();
        },
        error: (err) => {
          this.isSaving = false;
          this.showToast('Failed to add skill: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ================= GENERAL DELETE ACTIONS =================
  openDeleteConfirm(
    type: 'experience' | 'education' | 'skillCategory' | 'skillItem',
    id: string,
    title: string,
    event?: Event
  ): void {
    if (event) event.stopPropagation();
    this.deleteType = type;
    this.itemToDeleteId = id;
    this.itemToDeleteTitle = title;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.itemToDeleteId = null;
    this.itemToDeleteTitle = '';
  }

  executeDelete(): void {
    if (!this.itemToDeleteId) return;
    this.isDeleting = true;

    const id = this.itemToDeleteId;

    if (this.deleteType === 'experience') {
      this.adminService.deleteExperience(id).subscribe({
        next: () => {
          this.isDeleting = false;
          this.isDeleteModalOpen = false;
          this.showToast(`Deleted experience "${this.itemToDeleteTitle}"`, 'success');
          this.loadExperiences();
        },
        error: (err) => {
          this.isDeleting = false;
          this.showToast('Failed to delete experience: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else if (this.deleteType === 'education') {
      this.adminService.deleteEducation(id).subscribe({
        next: () => {
          this.isDeleting = false;
          this.isDeleteModalOpen = false;
          this.showToast(`Deleted education "${this.itemToDeleteTitle}"`, 'success');
          this.loadEducations();
        },
        error: (err) => {
          this.isDeleting = false;
          this.showToast('Failed to delete education: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else if (this.deleteType === 'skillCategory') {
      this.adminService.deleteSkillCategory(id).subscribe({
        next: () => {
          this.isDeleting = false;
          this.isDeleteModalOpen = false;
          this.showToast(`Deleted skill category "${this.itemToDeleteTitle}"`, 'success');
          this.loadSkillCategories();
        },
        error: (err) => {
          this.isDeleting = false;
          this.showToast('Failed to delete skill category: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    } else if (this.deleteType === 'skillItem') {
      this.adminService.deleteSkillItem(id).subscribe({
        next: () => {
          this.isDeleting = false;
          this.isDeleteModalOpen = false;
          this.showToast(`Deleted skill "${this.itemToDeleteTitle}"`, 'success');
          this.loadSkillCategories();
        },
        error: (err) => {
          this.isDeleting = false;
          this.showToast('Failed to delete skill: ' + (err.error?.message || err.message), 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = null;
        this.cdr.detectChanges();
      }
    }, 4000);
  }
}
