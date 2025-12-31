import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { FormsModule } from '@angular/forms'; // For simple form handling

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, AsyncPipe, FormsModule],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
    private contentService = inject(ContentService);
    data$ = this.contentService.getContent<any>('contact');

    onSubmit(event: Event) {
        event.preventDefault();
        alert('Thank you for contacting us! We will get back to you shortly.');
    }
}
