import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, tap } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly _greetings$ = new BehaviorSubject<any[]>([]);
  readonly greetings$ = this._greetings$.asObservable();

  constructor(private http: HttpClient) {}

  getGreetings() {
    return this.http.get('/api/greetings').pipe(
      tap((response: any) => this._greetings$.next(response.data))
    )
  }

  createGreeting(message: string) {
    return this.http.post('/api/greetings', { message }).pipe(
      tap((response: any) => this._greetings$.next([response.data, ...this._greetings$.value as any]))
    )
  }
}