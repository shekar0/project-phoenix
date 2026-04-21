import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500
                        flex items-center justify-center text-lg font-bold text-white
                        group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              ✨
            </div>
            <span class="font-display text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Project Phoenix
            </span>
          </a>

          <!-- Nav links (authenticated) -->
          <div *ngIf="auth.isLoggedIn" class="flex items-center gap-1">
            <a routerLink="/generate" routerLinkActive="nav-active"
               class="nav-link">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Generate
            </a>
            <a routerLink="/history" routerLinkActive="nav-active"
               class="nav-link">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              History
            </a>
            <button (click)="logout()" class="nav-link ml-2 text-red-400 hover:text-red-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign Out
            </button>
          </div>

          <!-- Auth links (guest) -->
          <div *ngIf="!auth.isLoggedIn" class="flex items-center gap-3">
            <a routerLink="/login" class="nav-link">Sign In</a>
            <a routerLink="/register" class="btn-primary text-sm !px-4 !py-2">Get Started</a>
          </div>

        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.875rem;
      border-radius: 0.625rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569; /* slate-600 */
      transition: all 0.25s;
      cursor: pointer;
      background: none;
      border: none;
    }
    .nav-link:hover {
      color: #0f172a; /* slate-900 */
      background: rgba(59, 130, 246, 0.1);
    }
    :host ::ng-deep .nav-active {
      color: #1d4ed8 !important; /* blue-700 */
      background: rgba(59, 130, 246, 0.15);
    }
  `],
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
