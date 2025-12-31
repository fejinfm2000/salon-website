import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-how-it-works',
    standalone: true,
    imports: [CommonModule, AsyncPipe],
    templateUrl: './how-it-works.component.html',
    styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
    private contentService = inject(ContentService);
    data$ = this.contentService.getContent<any>('how-it-works');
}
