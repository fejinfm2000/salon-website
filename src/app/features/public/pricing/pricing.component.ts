import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { PricingPageData } from '../../../core/models/content.models';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-pricing',
    standalone: true,
    imports: [CommonModule, AsyncPipe],
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
    private contentService = inject(ContentService);
    data$ = this.contentService.getContent<PricingPageData>('pricing');
}
