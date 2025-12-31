import { Meta, Title } from '@angular/platform-browser';
import { PageContent } from '../models/content.models';

export function updateSeo(titleService: Title, metaService: Meta, data: PageContent) {
    if (data.title) {
        titleService.setTitle(data.title);
    }
    if (data.metaDescription) {
        metaService.updateTag({ name: 'description', content: data.metaDescription });
    }
}
