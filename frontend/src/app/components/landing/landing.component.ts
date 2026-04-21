import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="relative w-full h-screen overflow-hidden bg-surface-900">
      
      <!-- Spline 3D Background -->
      <div class="absolute inset-0 z-0">
        <spline-viewer url="https://prod.spline.design/HYvF9wGd6dXYLsPU/scene.splinecode"></spline-viewer>
      </div>

      <!-- 
        Invisible click overlay covering the left side of the screen.
        This ensures the "Get started" text/button inside the Spline scene 
        is securely clickable across all devices without needing Spline JS events,
        while leaving the right side of the screen open for 3D interaction.
      -->
      <div class="absolute inset-0 z-10 pointer-events-none flex">
        <div class="w-full md:w-[45%] h-full pointer-events-auto cursor-pointer" 
             (click)="goToLogin()" 
             title="Get Started">
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-top: -5rem; /* Offset navbar padding from app.component.ts */
    }
    
    spline-viewer {
      width: 100%;
      height: 100%;
      outline: none;
    }
  `],
})
export class LandingComponent {
  private router = inject(Router);

  goToLogin() {
    this.router.navigate(['/login']);
  }
}


