import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay, tap, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ContentService {
    private cache = new Map<string, Observable<any>>();
    private http = inject(HttpClient);

    // Use API only in production (deployed on Netlify)
    // In development, always use local files
    private readonly useAPI = false; // Set to true only when deployed
    private readonly apiBase = '/.netlify/functions/content-api';

    getContent<T>(fileName: string): Observable<T> {
        if (!this.cache.has(fileName)) {
            const url = this.useAPI
                ? `${this.apiBase}/${fileName}`
                : `assets/data/${fileName}.json`;

            console.log(`[ContentService] Requesting: ${url}`);

            const obs = this.http.get<T>(url).pipe(
                shareReplay(1),
                tap(
                    data => console.log(`[ContentService] Loaded ${fileName}:`, data),
                    err => console.error(`[ContentService] Error loading ${fileName}:`, err)
                ),
                catchError(err => {
                    console.error(`[ContentService] Failed to load content for ${fileName}`, err);
                    return of({} as T);
                })
            );
            this.cache.set(fileName, obs);
        }
        return this.cache.get(fileName)!;
    }

    updateContent(fileName: string, content: any, message?: string): Observable<any> {
        const url = `${this.apiBase}/${fileName}`;

        return this.http.put(url, { content, message }).pipe(
            tap(() => {
                // Clear cache for this file
                this.cache.delete(fileName);
                console.log(`[ContentService] Updated ${fileName}`);
            }),
            catchError(err => {
                console.error(`[ContentService] Failed to update ${fileName}:`, err);
                throw err;
            })
        );
    }

    createContent(fileName: string, content: any, message?: string): Observable<any> {
        const url = this.apiBase;

        return this.http.post(url, { filename: fileName, content, message }).pipe(
            tap(() => {
                console.log(`[ContentService] Created ${fileName}`);
            }),
            catchError(err => {
                console.error(`[ContentService] Failed to create ${fileName}:`, err);
                throw err;
            })
        );
    }

    deleteContent(fileName: string): Observable<any> {
        const url = `${this.apiBase}/${fileName}`;

        return this.http.delete(url).pipe(
            tap(() => {
                // Clear cache for this file
                this.cache.delete(fileName);
                console.log(`[ContentService] Deleted ${fileName}`);
            }),
            catchError(err => {
                console.error(`[ContentService] Failed to delete ${fileName}:`, err);
                throw err;
            })
        );
    }
}
