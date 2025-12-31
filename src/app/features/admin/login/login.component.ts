import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    username = '';
    password = '';
    error = '';

    private authService = inject(AuthService);
    private router = inject(Router);

    onSubmit() {
        this.authService.login(this.username, this.password).subscribe(success => {
            if (success) {
                this.router.navigate(['/admin/editor']);
            } else {
                this.error = 'Invalid credentials';
            }
        });
    }
}
