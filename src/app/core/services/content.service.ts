import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ContentService {
    private cache = new Map<string, Observable<any>>();

    constructor(private http: HttpClient) { }

    getContent<T>(fileName: string): Observable<T> {
        if (!this.cache.has(fileName)) {
            // Relative path to avoid absolute path issues in some envs
            const url = `assets/data/${fileName}.json`;
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
}
