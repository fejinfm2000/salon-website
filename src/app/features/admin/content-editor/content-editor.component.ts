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

            this.contentService.updateContent(this.selectedFileId, parsed).subscribe({
                next: () => {
                    this.isSaving = false;
                    alert('✅ Content published successfully to GitHub!');
                },
                error: (err) => {
                    this.isSaving = false;
                    alert(`❌ Failed to publish: ${err.error?.error || err.message}`);
                }
            });

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

    deleteFile() {
        if (!this.selectedFileId) return;

        const confirmed = confirm(`Are you sure you want to delete "${this.getSelectedFileLabel()}"? This action cannot be undone.`);
        if (!confirmed) return;

        this.contentService.deleteContent(this.selectedFileId).subscribe({
            next: () => {
                alert('✅ Page deleted successfully from GitHub!');
                // Remove from files list
                this.files = this.files.filter(f => f.id !== this.selectedFileId);
                this.selectedFileId = '';
                this.jsonContent = '';
            },
            error: (err) => {
                alert(`❌ Failed to delete: ${err.error?.error || err.message}`);
            }
        });
    }

    createNewFile() {
        const filename = prompt('Enter the new page name (without .json extension):');
        if (!filename) return;

        // Validate filename
        if (!/^[a-z0-9-]+$/.test(filename)) {
            alert('❌ Invalid filename. Use only lowercase letters, numbers, and hyphens.');
            return;
        }

        // Check if already exists
        if (this.files.some(f => f.id === filename)) {
            alert('❌ A page with this name already exists.');
            return;
        }

        const defaultContent = {
            title: filename.charAt(0).toUpperCase() + filename.slice(1),
            metaDescription: `${filename} page description`
        };

        this.contentService.createContent(filename, defaultContent).subscribe({
            next: () => {
                alert('✅ Page created successfully in GitHub!');
                // Add to files list
                this.files.push({
                    id: filename,
                    label: defaultContent.title,
                    icon: '📄'
                });
                // Select the new file
                this.selectFile(filename);
            },
            error: (err) => {
                alert(`❌ Failed to create: ${err.error?.error || err.message}`);
            }
        });
    }

    syncScroll(textarea: HTMLTextAreaElement, lineNumbers: HTMLDivElement) {
        lineNumbers.scrollTop = textarea.scrollTop;
    }

    logout() {
        this.authService.logout();
    }
}
