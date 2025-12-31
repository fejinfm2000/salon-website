import { Component, inject, HostListener, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    themeService = inject(ThemeService);
    authService = inject(AuthService);
    router = inject(Router);
    platformId = inject(PLATFORM_ID);

    isMenuOpen = false;
    activeSection = signal<string>('home');
    private isManualNavigating = false;
    sections = ['home', 'how-it-works', 'features', 'pricing', 'about', 'contact'];

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    ngOnInit() {
        // Subscribe to navigation events to catch fragment changes reliably
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const url = event.urlAfterRedirects;
                const fragment = url.split('#')[1];
                if (fragment && this.sections.includes(fragment)) {
                    this.activeSection.set(fragment);

                    // Prevent scroll spy from immediately overriding this
                    this.isManualNavigating = true;
                    setTimeout(() => this.isManualNavigating = false, 1000);
                }
            }
        });

        // Initial check
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => this.onWindowScroll(), 300);
        }
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        if (!isPlatformBrowser(this.platformId) || this.isManualNavigating) {
            return;
        }

        let current = this.activeSection();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const activationLine = 150;

        for (const section of this.sections) {
            const element = document.getElementById(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= activationLine && rect.bottom > activationLine) {
                    current = section;
                    break;
                }
            }
        }

        if (scrollTop < 100) {
            current = 'home';
        } else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            current = 'contact';
        }

        if (this.activeSection() !== current) {
            this.activeSection.set(current);
        }
    }
}
