import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

interface AdminCredentials {
    username: string;
    passwordHash: string; // Storing hash or plain for demo (plain as per prompt suggestion "Validate credentials on the frontend only")
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
    isLoggedIn$ = this.loggedIn.asObservable();

    private http = inject(HttpClient);
    private router = inject(Router);

    constructor() { }

    private hasToken(): boolean {
        return !!localStorage.getItem('admin_token');
    }

    login(username: string, password: string): Observable<boolean> {
        return this.http.get<AdminCredentials>('assets/data/admin.json').pipe(
            map(creds => {
                if (creds.username === username && creds.passwordHash === password) { // Simple check
                    localStorage.setItem('admin_token', 'true'); // Dummy token
                    this.loggedIn.next(true);
                    return true;
                }
                return false;
            }),
            catchError(() => of(false))
        );
    }

    logout() {
        localStorage.removeItem('admin_token');
        this.loggedIn.next(false);
        this.router.navigate(['/']);
    }
}
