import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { HomePageData } from '../../../core/models/content.models';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Meta, Title } from '@angular/platform-browser';
import { updateSeo } from '../../../core/utils/seo.utils';
import { HowItWorksComponent } from '../how-it-works/how-it-works.component';
import { FeaturesComponent } from '../features/features.component';
import { PricingComponent } from '../pricing/pricing.component';
import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, AsyncPipe, RouterLink, HowItWorksComponent, FeaturesComponent, PricingComponent, AboutComponent, ContactComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    private contentService = inject(ContentService);
    private title = inject(Title);
    private meta = inject(Meta);

    data$: Observable<HomePageData> = this.contentService.getContent<HomePageData>('home').pipe(
        tap(data => updateSeo(this.title, this.meta, data))
    );
}
