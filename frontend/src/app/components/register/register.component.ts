import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
            ✨
          </div>
          <h1 class="font-display text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p class="text-slate-600">Start generating stunning AI art today</p>
        </div>

        <!-- Form card -->
        <div class="glass rounded-2xl p-8">

          <!-- Success message -->
          <div *ngIf="success"
               class="mb-6 px-5 py-4 rounded-xl bg-green-500/10 border-2 border-green-500/40 text-green-400">
            <p class="font-bold text-lg mb-1">🎉 Account almost ready!</p>
            <p class="text-sm">Account is created successfully. Click on sign in.</p>
          </div>

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
                     class="input-field" placeholder="Min 6 characters" required minlength="6"
                     autocomplete="new-password" />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input id="confirmPassword" type="password" [(ngModel)]="confirmPassword" name="confirmPassword"
                     class="input-field" placeholder="••••••••" required autocomplete="new-password" />
            </div>

            <button type="submit" [disabled]="loading"
                    class="btn-primary w-full flex items-center justify-center gap-2">
              <svg *ngIf="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ loading ? 'Creating account…' : 'Create Account' }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-600">
            Already have an account?
            <a routerLink="/login" class="text-blue-600 hover:text-blue-500 font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = '';
    this.success = false;

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.signUp(this.email, this.password);
      this.success = true;
    } catch (err: any) {
      this.error = err.message || 'Registration failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
