import { Component, inject, effect, Renderer2, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, filter, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  // Detect if we are on any admin pages (login/editor/etc) to hide header/footer
  isAdminPage = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url.includes('/admin')),
      startWith(this.router.url.includes('/admin'))
    ),
    { initialValue: this.router.url.includes('/admin') }
  );

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const isLogin = this.isAdminPage();
        if (isLogin) {
          this.renderer.addClass(this.document.body, 'admin-mode');
        } else {
          this.renderer.removeClass(this.document.body, 'admin-mode');
        }
      }
    });
  }
}
