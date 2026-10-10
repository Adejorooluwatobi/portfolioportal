import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InquiryStats {
  totalCount: number;
  unreadCount: number;
  archivedCount: number;
  todayCount: number;
}

export interface InquiryItem {
  id: string;
  senderName: string;
  senderEmail: string;
  inquiryType: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  adminNotes?: string;
  submittedAt: string;
  readAt?: string;
}

export interface ProjectCategoryItem {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProjectTagItem {
  id?: string;
  tagName: string;
  sortOrder?: number;
}

export interface CaseStudyHighlight {
  id?: string;
  highlightText: string;
  sortOrder?: number;
}

export interface CaseStudyTechnology {
  id?: string;
  name: string;
  sortOrder?: number;
}

export interface CaseStudyDetail {
  id?: string;
  projectId?: string;
  title: string;
  categoryLabel: string;
  year: string;
  clientName: string;
  heroImageUrl?: string;
  summary: string;
  liveUrl?: string;
  highlights: CaseStudyHighlight[];
  technologies: CaseStudyTechnology[];
}

export interface ProjectCategoryMap {
  projectCategoryId?: string;
  projectCategory?: ProjectCategoryItem;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  categoryBadgeText: string;
  timeframe: string;
  shortDescription: string;
  imageUrl?: string;
  imageAlt?: string;
  iconKey?: string;
  liveUrl?: string;
  githubUrl?: string;
  articleUrl?: string;
  hasCaseStudy: boolean;
  isPublished: boolean;
  sortOrder: number;
  tags: ProjectTagItem[];
  categoryMaps: ProjectCategoryMap[];
  caseStudy?: CaseStudyDetail;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectCreateUpdateDto {
  slug: string;
  title: string;
  clientName: string;
  categoryBadgeText: string;
  timeframe: string;
  shortDescription: string;
  imageUrl?: string;
  imageAlt?: string;
  iconKey?: string;
  liveUrl?: string;
  githubUrl?: string;
  articleUrl?: string;
  hasCaseStudy: boolean;
  isPublished: boolean;
  sortOrder: number;
  tags: string[];
  categoryIds: string[];
}

export interface CaseStudyUpdateDto {
  title: string;
  categoryLabel: string;
  year: string;
  clientName: string;
  heroImageUrl?: string;
  summary: string;
  liveUrl?: string;
  highlights: string[];
  technologies: string[];
}

export interface UploadMediaResponse {
  success: boolean;
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  message?: string;
}

export interface ArticleTagItem {
  id?: string;
  articleId?: string;
  tagName: string;
  sortOrder?: number;
}

export interface ArticleLinkItem {
  id?: string;
  articleId?: string;
  title: string;
  url: string;
  icon?: string;
  sortOrder: number;
}

export interface ArticleLinkCreateDto {
  title: string;
  url: string;
  icon?: string;
  sortOrder: number;
}

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publicationType: string;
  publishStatus: string;
  readTimeMinutes: number;
  imageUrl?: string;
  imageAlt?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  footerAnnotation?: string;
  publishedAt?: string;
  isActive: boolean;
  sortOrder: number;
  tags: ArticleTagItem[];
  links?: ArticleLinkItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleCreateUpdateDto {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publicationType: string;
  publishStatus: string;
  readTimeMinutes: number;
  imageUrl?: string;
  imageAlt?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  footerAnnotation?: string;
  publishedAt?: string;
  isActive: boolean;
  sortOrder: number;
  tags: string[];
  links?: ArticleLinkCreateDto[];
}

export interface ExperienceTechnologyItem {
  id?: string;
  name: string;
  sortOrder?: number;
}

export interface WorkExperienceItem {
  id: string;
  jobTitle: string;
  companyName: string;
  employmentType: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  accentVariant: string;
  sortOrder: number;
  technologies: ExperienceTechnologyItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface WorkExperienceCreateUpdateDto {
  jobTitle: string;
  companyName: string;
  employmentType: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  accentVariant: string;
  sortOrder: number;
  technologies: string[];
}

export interface EducationItem {
  id: string;
  degreeTitle: string;
  institutionName: string;
  location: string;
  dateRange: string;
  icon: string;
  description: string;
  credentialType: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface EducationCreateUpdateDto {
  degreeTitle: string;
  institutionName: string;
  location: string;
  dateRange: string;
  icon: string;
  description: string;
  credentialType: string;
  sortOrder: number;
}

export interface SkillItem {
  id: string;
  skillCategoryId: string;
  name: string;
  proficiencyPercent?: number;
  isPrimary: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillCategoryDetail {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColorToken: string;
  sortOrder: number;
  skills: SkillItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillCategoryCreateUpdateDto {
  title: string;
  subtitle: string;
  icon: string;
  accentColorToken: string;
  sortOrder: number;
}

export interface SkillItemCreateUpdateDto {
  skillCategoryId: string;
  name: string;
  proficiencyPercent?: number;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProfileDetail {
  id?: string;
  fullName: string;
  primaryTitle: string;
  sidebarTitle: string;
  avatarImageUrl: string;
  avatarAltText: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  whatsappUrl: string;
  location: string;
  locationDisplay: string;
  birthday?: string;
  cvFileUrl: string;
  cvDownloadName: string;
  isAvailable: boolean;
  availabilityText: string;
  employmentStatus: string;
  responseTime: string;
  engagementScope: string;
  responseGuarantee: string;
  yearsExperience: number;
  yearsExperienceSuffix: string;
  yearsExperienceLabel: string;
  projectsCompleted: number;
  projectsCompletedSuffix: string;
  projectsLabel: string;
}

export interface HeroSectionDetail {
  id?: string;
  categoryBadgeText: string;
  categoryBadgeIcon: string;
  headline: string;
  bioLead: string;
  bioFrontend: string;
  bioBackend: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  primaryCtaIcon: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  secondaryCtaIcon: string;
  tertiaryCtaText: string;
  tertiaryCtaUrl: string;
  tertiaryCtaIcon: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  title: string;
  url: string;
  icon: string;
  showInHeader: boolean;
  showInFooter: boolean;
  showInSidebar: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface SocialLinkCreateUpdateDto {
  platform: string;
  title: string;
  url: string;
  icon: string;
  showInHeader: boolean;
  showInFooter: boolean;
  showInSidebar: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface DisciplineTagItem {
  id?: string;
  disciplineCardId?: string;
  tagName: string;
  sortOrder?: number;
}

export interface DisciplineCardItem {
  id: string;
  indexTag: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  accentColor?: string;
  tags: DisciplineTagItem[];
}

export interface DisciplineCardCreateUpdateDto {
  indexTag: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  accentColor?: string;
  tags: string[];
}

export interface PhilosophyCardItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  accentColor?: string;
}

export interface PhilosophyCardCreateUpdateDto {
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  accentColor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioAdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dashboard Stats & Inquiries
  getInquiryStats(): Observable<InquiryStats> {
    return this.http.get<InquiryStats>(`${this.apiUrl}/admin/AdminInquiries/stats`);
  }

  getInquiries(filter?: string): Observable<InquiryItem[]> {
    const url = filter ? `${this.apiUrl}/admin/AdminInquiries?filter=${filter}` : `${this.apiUrl}/admin/AdminInquiries`;
    return this.http.get<InquiryItem[]>(url);
  }

  toggleInquiryRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminInquiries/${id}/read`, {});
  }

  getInquiryById(id: string): Observable<InquiryItem> {
    return this.http.get<InquiryItem>(`${this.apiUrl}/admin/AdminInquiries/${id}`);
  }

  toggleInquiryArchive(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminInquiries/${id}/archive`, {});
  }

  updateInquiryNotes(id: string, notes: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminInquiries/${id}/notes`, { notes });
  }

  deleteInquiry(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminInquiries/${id}`);
  }

  // --- Admin Projects Management ---
  getAdminProjects(): Observable<ProjectItem[]> {
    return this.http.get<ProjectItem[]>(`${this.apiUrl}/admin/AdminProjects`);
  }

  getAdminProjectById(id: string): Observable<ProjectItem> {
    return this.http.get<ProjectItem>(`${this.apiUrl}/admin/AdminProjects/${id}`);
  }

  createProject(dto: ProjectCreateUpdateDto): Observable<ProjectItem> {
    return this.http.post<ProjectItem>(`${this.apiUrl}/admin/AdminProjects`, dto);
  }

  updateProject(id: string, dto: ProjectCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminProjects/${id}`, dto);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminProjects/${id}`);
  }

  getProjectCategories(): Observable<ProjectCategoryItem[]> {
    return this.http.get<ProjectCategoryItem[]>(`${this.apiUrl}/admin/AdminProjects/categories`);
  }

  createProjectCategory(dto: { slug: string; label: string; sortOrder?: number; isActive?: boolean }): Observable<ProjectCategoryItem> {
    return this.http.post<ProjectCategoryItem>(`${this.apiUrl}/admin/AdminProjects/categories`, dto);
  }

  deleteProjectCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminProjects/categories/${id}`);
  }

  // Case Study Management
  getCaseStudy(projectId: string): Observable<CaseStudyDetail> {
    return this.http.get<CaseStudyDetail>(`${this.apiUrl}/admin/AdminProjects/${projectId}/case-study`);
  }

  updateCaseStudy(projectId: string, dto: CaseStudyUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminProjects/${projectId}/case-study`, dto);
  }

  // --- Admin Articles Management ---
  getAdminArticles(): Observable<ArticleItem[]> {
    return this.http.get<ArticleItem[]>(`${this.apiUrl}/admin/AdminArticles`);
  }

  getAdminArticleById(id: string): Observable<ArticleItem> {
    return this.http.get<ArticleItem>(`${this.apiUrl}/admin/AdminArticles/${id}`);
  }

  createArticle(dto: ArticleCreateUpdateDto): Observable<ArticleItem> {
    return this.http.post<ArticleItem>(`${this.apiUrl}/admin/AdminArticles`, dto);
  }

  updateArticle(id: string, dto: ArticleCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminArticles/${id}`, dto);
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminArticles/${id}`);
  }

  // --- Resume: Experiences ---
  getExperiences(): Observable<WorkExperienceItem[]> {
    return this.http.get<WorkExperienceItem[]>(`${this.apiUrl}/admin/AdminResume/experiences`);
  }

  createExperience(dto: WorkExperienceCreateUpdateDto): Observable<WorkExperienceItem> {
    return this.http.post<WorkExperienceItem>(`${this.apiUrl}/admin/AdminResume/experiences`, dto);
  }

  updateExperience(id: string, dto: WorkExperienceCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminResume/experiences/${id}`, dto);
  }

  deleteExperience(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminResume/experiences/${id}`);
  }

  // --- Resume: Educations ---
  getEducations(): Observable<EducationItem[]> {
    return this.http.get<EducationItem[]>(`${this.apiUrl}/admin/AdminResume/educations`);
  }

  createEducation(dto: EducationCreateUpdateDto): Observable<EducationItem> {
    return this.http.post<EducationItem>(`${this.apiUrl}/admin/AdminResume/educations`, dto);
  }

  updateEducation(id: string, dto: EducationCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminResume/educations/${id}`, dto);
  }

  deleteEducation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminResume/educations/${id}`);
  }

  // --- Resume: Skills & Categories ---
  getSkillCategories(): Observable<SkillCategoryDetail[]> {
    return this.http.get<SkillCategoryDetail[]>(`${this.apiUrl}/admin/AdminResume/skill-categories`);
  }

  createSkillCategory(dto: SkillCategoryCreateUpdateDto): Observable<SkillCategoryDetail> {
    return this.http.post<SkillCategoryDetail>(`${this.apiUrl}/admin/AdminResume/skill-categories`, dto);
  }

  updateSkillCategory(id: string, dto: SkillCategoryCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminResume/skill-categories/${id}`, dto);
  }

  deleteSkillCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminResume/skill-categories/${id}`);
  }

  createSkillItem(dto: SkillItemCreateUpdateDto): Observable<SkillItem> {
    return this.http.post<SkillItem>(`${this.apiUrl}/admin/AdminResume/skills`, dto);
  }

  updateSkillItem(id: string, dto: SkillItemCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminResume/skills/${id}`, dto);
  }

  deleteSkillItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminResume/skills/${id}`);
  }

  // --- Admin Profile & Bio ---
  getAdminProfile(): Observable<ProfileDetail> {
    return this.http.get<ProfileDetail>(`${this.apiUrl}/admin/AdminProfile`);
  }

  updateAdminProfile(dto: ProfileDetail): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminProfile`, dto);
  }

  getAdminHero(): Observable<HeroSectionDetail> {
    return this.http.get<HeroSectionDetail>(`${this.apiUrl}/admin/AdminProfile/hero`);
  }

  updateAdminHero(dto: HeroSectionDetail): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminProfile/hero`, dto);
  }

  getAdminSocials(): Observable<SocialLinkItem[]> {
    return this.http.get<SocialLinkItem[]>(`${this.apiUrl}/admin/AdminProfile/socials`);
  }

  createAdminSocial(dto: SocialLinkCreateUpdateDto): Observable<SocialLinkItem> {
    return this.http.post<SocialLinkItem>(`${this.apiUrl}/admin/AdminProfile/socials`, dto);
  }

  updateAdminSocial(id: string, dto: SocialLinkCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminProfile/socials/${id}`, dto);
  }

  deleteAdminSocial(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminProfile/socials/${id}`);
  }

  // --- What I Do / Core Competencies ---
  getAdminDisciplines(): Observable<DisciplineCardItem[]> {
    return this.http.get<DisciplineCardItem[]>(`${this.apiUrl}/admin/AdminProfile/disciplines`);
  }

  createAdminDiscipline(dto: DisciplineCardCreateUpdateDto): Observable<DisciplineCardItem> {
    return this.http.post<DisciplineCardItem>(`${this.apiUrl}/admin/AdminProfile/disciplines`, dto);
  }

  updateAdminDiscipline(id: string, dto: DisciplineCardCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminProfile/disciplines/${id}`, dto);
  }

  deleteAdminDiscipline(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminProfile/disciplines/${id}`);
  }

  // --- Engineering Philosophy Cards ---
  getAdminPhilosophies(): Observable<PhilosophyCardItem[]> {
    return this.http.get<PhilosophyCardItem[]>(`${this.apiUrl}/admin/AdminProfile/philosophies`);
  }

  createAdminPhilosophy(dto: PhilosophyCardCreateUpdateDto): Observable<PhilosophyCardItem> {
    return this.http.post<PhilosophyCardItem>(`${this.apiUrl}/admin/AdminProfile/philosophies`, dto);
  }

  updateAdminPhilosophy(id: string, dto: PhilosophyCardCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/AdminProfile/philosophies/${id}`, dto);
  }

  deleteAdminPhilosophy(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/AdminProfile/philosophies/${id}`);
  }

  // Document Upload (CV, etc.)
  uploadDocument(file: File, folder = 'portfolio/docs'): Observable<UploadMediaResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadMediaResponse>(`${this.apiUrl}/admin/Media/upload-doc?folder=${folder}`, formData);
  }

  // Media Upload
  uploadMedia(file: File, folder = 'portfolio/projects'): Observable<UploadMediaResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadMediaResponse>(`${this.apiUrl}/admin/Media/upload?folder=${folder}`, formData);
  }

  // Public / Shared Fallbacks
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`);
  }

  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/articles`);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const base = environment.apiUrl.replace(/\/api\/?$/, '');
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${base}${path}`;
    }
    return url;
  }
}
