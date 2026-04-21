import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, HistoryItem } from '../../services/api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-3xl font-bold text-slate-900 mb-2">Generation History</h1>
        <p class="text-slate-600">Your past AI-generated masterpieces</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-20">
        <div class="w-12 h-12 rounded-full border-4 border-phoenix-500/20 border-t-phoenix-500 animate-spin"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && items.length === 0"
           class="glass rounded-2xl p-12 text-center">
        <div class="text-5xl mb-4">📭</div>
        <p class="text-slate-700 font-medium text-lg">No generations yet</p>
        <p class="text-slate-500 mt-1">Create your first masterpiece on the Generate page</p>
      </div>

      <!-- Grid -->
      <div *ngIf="!loading && items.length > 0"
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <div *ngFor="let item of items"
             class="glass rounded-2xl overflow-hidden group hover:border-blue-500/40 transition-all duration-300
                    hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">

          <!-- Preview -->
          <div class="aspect-square bg-white relative overflow-hidden">
            <img *ngIf="item.type === 'image' && item.output_url"
                 [src]="item.output_url" [alt]="item.prompt"
                 class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div *ngIf="item.type === 'video'"
                 class="w-full h-full flex items-center justify-center">
              <div class="text-5xl">🎬</div>
            </div>
            <div *ngIf="!item.output_url"
                 class="w-full h-full flex items-center justify-center text-slate-400">
              <div class="text-5xl">🖼️</div>
            </div>

            <!-- Type badge -->
            <div class="absolute top-3 right-3">
              <span class="text-xs font-medium px-2.5 py-1 rounded-full glass"
                    [class.text-blue-600]="item.type === 'image'"
                    [class.text-pink-600]="item.type === 'video'">
                {{ item.type === 'image' ? '🖼️ Image' : '🎥 Video' }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <p class="text-slate-800 text-sm font-medium line-clamp-2 mb-2">{{ item.prompt }}</p>
            <div class="flex items-center gap-2 flex-wrap">
              <span *ngIf="item.style"
                    class="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {{ item.style }}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                {{ item.resolution }}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                {{ item.aspect_ratio }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-3">{{ formatDate(item.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class HistoryComponent implements OnInit {
  items: HistoryItem[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getHistory().subscribe({
      next: (res) => {
        this.items = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
