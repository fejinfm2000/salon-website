import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    theme = signal<Theme>('light');

    constructor() {
        // Load from storage or system preference
        const stored = localStorage.getItem('theme') as Theme;
        if (stored) {
            this.theme.set(stored);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.theme.set('dark');
        }

        // Apply theme on change
        effect(() => {
            const currentTheme = this.theme();
            document.documentElement.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
        });
    }

    toggle() {
        this.theme.update(t => t === 'light' ? 'dark' : 'light');
    }
}
