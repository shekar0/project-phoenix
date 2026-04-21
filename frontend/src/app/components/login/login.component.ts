import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
      <div class="w-full max-w-md">

        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                      bg-gradient-to-br from-blue-500 to-indigo-500 mb-4 text-3xl
                      shadow-lg shadow-blue-500/25 animate-glow">
            🔥
          </div>
          <h1 class="font-display text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p class="text-slate-600">Sign in to start creating with AI</p>
        </div>

        <!-- Form card -->
        <div class="glass rounded-2xl p-8">

          <!-- Error message -->
          <div *ngIf="error"
               class="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {{ error }}
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input id="email" type="email" [(ngModel)]="email" name="email"
                     class="input-field" placeholder="you@example.com" required autocomplete="email" />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input id="password" type="password" [(ngModel)]="password" name="password"
                     class="input-field" placeholder="••••••••" required autocomplete="current-password" />
            </div>

            <button type="submit" [disabled]="loading"
                    class="btn-primary w-full flex items-center justify-center gap-2">
              <svg *ngIf="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ loading ? 'Signing in…' : 'Sign In' }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-600">
            Don't have an account?
            <a routerLink="/register" class="text-blue-600 hover:text-blue-500 font-medium">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.loading = true;
    this.error = '';
    try {
      await this.auth.signIn(this.email, this.password);
      this.router.navigate(['/generate']);
    } catch (err: any) {
      // Provide a clearer message if it's an email confirmation issue
      if (err.message === 'Email not confirmed') {
        this.error = 'Please check your email and click the confirmation link before signing in.';
      } else {
        this.error = err.message || 'Sign-in failed. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }
}

