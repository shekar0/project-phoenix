import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface GenerateRequest {
  prompt: string;
  style?: string;
  resolution?: string;
  aspect_ratio?: string;
}

export interface GenerateResponse {
  output_url: string | null;
  job_id: string | null;
  status: string;
  error: string | null;
  quality_score: number | null;
}

export interface HistoryItem {
  id: string;
  user_id: string;
  prompt: string;
  style: string;
  resolution: string;
  aspect_ratio: string;
  type: string;
  output_url: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.auth.getToken()).pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });
        return [headers];
      }),
    );
  }

  generateImage(request: GenerateRequest): Observable<GenerateResponse> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.post<GenerateResponse>(`${this.apiUrl}/api/generate/image`, request, { headers }),
      ),
    );
  }

  generateVideo(request: GenerateRequest): Observable<GenerateResponse> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.post<GenerateResponse>(`${this.apiUrl}/api/generate/video`, request, { headers }),
      ),
    );
  }

  getHistory(): Observable<{ data: HistoryItem[] }> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<{ data: HistoryItem[] }>(`${this.apiUrl}/api/history`, { headers }),
      ),
    );
  }
}
