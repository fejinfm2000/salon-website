import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ContentEditorComponent } from './features/admin/content-editor/content-editor.component';
import { LoginComponent } from './features/admin/login/login.component';
import { HomeComponent } from './features/public/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, title: 'SalonPro - Modern Management' },
    { path: 'admin/login', component: LoginComponent, title: 'Admin Login' },
    { path: 'admin/editor', component: ContentEditorComponent, canActivate: [authGuard], title: 'Content Editor' },
    { path: '**', redirectTo: '' }
];
