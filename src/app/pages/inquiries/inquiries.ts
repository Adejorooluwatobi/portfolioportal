import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  PortfolioAdminService, 
  InquiryItem, 
  InquiryStats 
} from '../../services/portfolio-admin.service';

@Component({
  selector: 'app-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inquiries.html',
  styleUrls: ['./inquiries.scss']
})
export class InquiriesComponent implements OnInit {
  private adminService = inject(PortfolioAdminService);
  private cdr = inject(ChangeDetectorRef);

  // Data
  stats: InquiryStats | null = null;
  inquiries: InquiryItem[] = [];
  filteredInquiries: InquiryItem[] = [];

  // Filter & Search
  currentTab: 'all' | 'unread' | 'archived' = 'all';
  searchQuery = '';
  selectedType = 'ALL';

  // Loading & Action states
  isLoading = false;
  isSavingNotes = false;
  isDeleting = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // Detail Drawer State
  isDetailOpen = false;
  selectedInquiry: InquiryItem | null = null;
  adminNotesDraft = '';

  // Delete Modal State
  deleteModalInquiry: InquiryItem | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.adminService.getInquiryStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load inquiry stats:', err)
    });

    const filterParam = this.currentTab === 'all' ? undefined : this.currentTab;
    this.adminService.getInquiries(filterParam).subscribe({
      next: (items) => {
        this.inquiries = items;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load inquiries:', err);
        this.showToast('Failed to load inquiries', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'all' | 'unread' | 'archived'): void {
    this.currentTab = tab;
    this.loadData();
  }

  applyFilters(): void {
    let result = [...this.inquiries];

    if (this.selectedType !== 'ALL') {
      result = result.filter(i => (i.inquiryType || '').toLowerCase() === this.selectedType.toLowerCase());
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(i => 
        (i.senderName && i.senderName.toLowerCase().includes(q)) ||
        (i.senderEmail && i.senderEmail.toLowerCase().includes(q)) ||
        (i.message && i.message.toLowerCase().includes(q)) ||
        (i.adminNotes && i.adminNotes.toLowerCase().includes(q))
      );
    }

    this.filteredInquiries = result;
  }

  openDetail(inquiry: InquiryItem): void {
    this.selectedInquiry = inquiry;
    this.adminNotesDraft = inquiry.adminNotes || '';
    this.isDetailOpen = true;

    // If it is unread, automatically mark as read on the backend
    if (!inquiry.isRead) {
      this.adminService.getInquiryById(inquiry.id).subscribe({
        next: (updated) => {
          inquiry.isRead = true;
          inquiry.readAt = updated.readAt || new Date().toISOString();
          if (this.stats && this.stats.unreadCount > 0) {
            this.stats.unreadCount--;
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to mark inquiry as read:', err)
      });
    }
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedInquiry = null;
    this.adminNotesDraft = '';
  }

  toggleRead(inquiry: InquiryItem, event?: Event): void {
    if (event) event.stopPropagation();

    this.adminService.toggleInquiryRead(inquiry.id).subscribe({
      next: () => {
        inquiry.isRead = !inquiry.isRead;
        if (inquiry.isRead) {
          inquiry.readAt = new Date().toISOString();
          if (this.stats) this.stats.unreadCount = Math.max(0, this.stats.unreadCount - 1);
          this.showToast('Marked as read', 'success');
        } else {
          inquiry.readAt = undefined;
          if (this.stats) this.stats.unreadCount++;
          this.showToast('Marked as unread', 'success');
        }
        if (this.currentTab === 'unread' && inquiry.isRead) {
          this.applyFilters();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error toggling read status:', err);
        this.showToast('Failed to update read status', 'error');
      }
    });
  }

  toggleArchive(inquiry: InquiryItem, event?: Event): void {
    if (event) event.stopPropagation();

    this.adminService.toggleInquiryArchive(inquiry.id).subscribe({
      next: () => {
        inquiry.isArchived = !inquiry.isArchived;
        if (inquiry.isArchived) {
          if (this.stats) this.stats.archivedCount++;
          this.showToast('Inquiry moved to archive', 'success');
        } else {
          if (this.stats) this.stats.archivedCount = Math.max(0, this.stats.archivedCount - 1);
          this.showToast('Inquiry restored from archive', 'success');
        }
        // Remove or update from current list if filtered
        if ((this.currentTab === 'archived' && !inquiry.isArchived) || (this.currentTab !== 'archived' && inquiry.isArchived)) {
          this.inquiries = this.inquiries.filter(i => i.id !== inquiry.id);
          this.applyFilters();
          if (this.selectedInquiry?.id === inquiry.id) {
            this.closeDetail();
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error toggling archive status:', err);
        this.showToast('Failed to update archive status', 'error');
      }
    });
  }

  saveNotes(): void {
    if (!this.selectedInquiry) return;
    this.isSavingNotes = true;

    this.adminService.updateInquiryNotes(this.selectedInquiry.id, this.adminNotesDraft).subscribe({
      next: () => {
        if (this.selectedInquiry) {
          this.selectedInquiry.adminNotes = this.adminNotesDraft;
        }
        this.isSavingNotes = false;
        this.showToast('Internal notes saved successfully', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving notes:', err);
        this.isSavingNotes = false;
        this.showToast('Failed to save notes', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(inquiry: InquiryItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.deleteModalInquiry = inquiry;
  }

  cancelDelete(): void {
    this.deleteModalInquiry = null;
  }

  executeDelete(): void {
    if (!this.deleteModalInquiry) return;
    this.isDeleting = true;
    const targetId = this.deleteModalInquiry.id;

    this.adminService.deleteInquiry(targetId).subscribe({
      next: () => {
        this.inquiries = this.inquiries.filter(i => i.id !== targetId);
        this.applyFilters();
        if (this.selectedInquiry?.id === targetId) {
          this.closeDetail();
        }
        if (this.stats) {
          this.stats.totalCount = Math.max(0, this.stats.totalCount - 1);
          if (this.deleteModalInquiry && !this.deleteModalInquiry.isRead) {
            this.stats.unreadCount = Math.max(0, this.stats.unreadCount - 1);
          }
          if (this.deleteModalInquiry && this.deleteModalInquiry.isArchived) {
            this.stats.archivedCount = Math.max(0, this.stats.archivedCount - 1);
          }
        }
        this.isDeleting = false;
        this.deleteModalInquiry = null;
        this.showToast('Inquiry permanently deleted', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting inquiry:', err);
        this.isDeleting = false;
        this.showToast('Failed to delete inquiry', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  copyEmail(email: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        this.showToast(`Email copied: ${email}`, 'success');
      }).catch(() => {
        this.showToast(`Email: ${email}`, 'success');
      });
    } else {
      this.showToast(`Email: ${email}`, 'success');
    }
  }

  replyEmail(inquiry: InquiryItem, event?: Event): void {
    if (event) event.stopPropagation();
    const subject = encodeURIComponent(`Re: Inquiry regarding ${this.getTypeLabel(inquiry.inquiryType)}`);
    const body = encodeURIComponent(
      `Hi ${inquiry.senderName},\n\nThank you for reaching out through my portfolio. Regarding your message:\n\n> "${inquiry.message}"\n\n`
    );
    window.open(`mailto:${inquiry.senderEmail}?subject=${subject}&body=${body}`, '_blank');
  }

  getTypeLabel(type: string): string {
    switch ((type || '').toLowerCase()) {
      case 'fulltime': return 'Full-Time Role';
      case 'contract': return 'Contract / Freelance';
      case 'architecture': return 'System Architecture';
      case 'general': return 'General Inquiry';
      default: return type || 'Inquiry';
    }
  }

  getTypeBadgeClasses(type: string): string {
    switch ((type || '').toLowerCase()) {
      case 'fulltime':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'contract':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'architecture':
        return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
      case 'general':
      default:
        return 'bg-slate-700/40 text-slate-300 border border-slate-600/30';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 3500);
  }
}
