import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router'; // Kept for future potential use, actually unused in template currently
import { ContentService } from '../../../core/services/content.service';
import { FeaturesPageData } from '../../../core/models/content.models';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-features',
    standalone: true,
    imports: [CommonModule, AsyncPipe],
    templateUrl: './features.component.html',
    styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
    private contentService = inject(ContentService);
    // Casting to FeaturesPageData or any if I lazy
    data$ = this.contentService.getContent<FeaturesPageData>('features');
}
