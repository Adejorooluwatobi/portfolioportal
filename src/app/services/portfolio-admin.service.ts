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

  // Projects
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`);
  }

  // Articles
  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/articles`);
  }

  // Profile
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }
}
