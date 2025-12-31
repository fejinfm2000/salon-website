import { Component, inject, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-content-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './content-editor.component.html',
    styleUrls: ['./content-editor.scss']
})
export class ContentEditorComponent {
    files = [
        { id: 'home', label: 'Home Page', icon: '🏠' },
        { id: 'how-it-works', label: 'How It Works', icon: '⚙️' },
        { id: 'features', label: 'Features', icon: '✨' },
        { id: 'pricing', label: 'Pricing', icon: '💰' },
        { id: 'about', label: 'About Us', icon: 'ℹ️' },
        { id: 'contact', label: 'Contact', icon: '📧' }
    ];

    selectedFileId = '';
    jsonContent = '';
    isSaving = false;
    isLoading = false;
    isSidebarVisible = signal(false);

    private contentService = inject(ContentService);
    private authService = inject(AuthService);
    private router = inject(Router);

    get lineNumbers() {
        return this.jsonContent.split('\n').map((_, i) => i + 1);
    }

    selectFile(id: string) {
        this.selectedFileId = id;
        this.isLoading = true;
        this.isSidebarVisible.set(false); // Close sidebar on selection (mobile)
        this.contentService.getContent<any>(id).subscribe({
            next: (data) => {
                this.jsonContent = JSON.stringify(data, null, 2);
                this.isLoading = false;
            },
            error: () => {
                alert('Error loading content.');
                this.isLoading = false;
            }
        });
    }

    save() {
        if (!this.selectedFileId) return;

        try {
            const parsed = JSON.parse(this.jsonContent);
            this.isSaving = true;

            // Simulate API call
            setTimeout(() => {
                console.log('Saving content for', this.selectedFileId, parsed);
                this.isSaving = false;
                alert('Success! Content updated (simulated).');
            }, 1000);

        } catch (e) {
            alert('Invalid JSON! Please check your syntax.');
        }
    }

    getSelectedFileLabel() {
        return this.files.find(f => f.id === this.selectedFileId)?.label || 'Select a section';
    }

    copyToClipboard() {
        if (!this.jsonContent) return;

        navigator.clipboard.writeText(this.jsonContent).then(() => {
            const btn = document.querySelector('.copy-btn');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span>✅ Copied!</span>';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            }
        });
    }

    viewSite() {
        this.router.navigate(['/']);
    }

    toggleSidebar() {
        this.isSidebarVisible.update(v => !v);
    }

    syncScroll(textarea: HTMLTextAreaElement, lineNumbers: HTMLDivElement) {
        lineNumbers.scrollTop = textarea.scrollTop;
    }

    logout() {
        this.authService.logout();
    }
}
