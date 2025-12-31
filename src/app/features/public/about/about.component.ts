import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { Observable } from 'rxjs'; // Type as any for speed or interface

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, AsyncPipe],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent {
    private contentService = inject(ContentService);
    // Using any for flexibility or specific if reused
    data$ = this.contentService.getContent<any>('about');
}
