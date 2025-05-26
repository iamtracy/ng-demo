import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, map, tap } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly _greetings$ = new BehaviorSubject<any[]>([])
  readonly greetings$ = this._greetings$.asObservable()

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get('/users').pipe(
      tap((response: any) => this._greetings$.next(response.data))
    )
  }

  getGreetings() {
    return this.http.get('/messages').pipe(
      tap((response: any) => this._greetings$.next(response.data))
    )
  }

  createGreeting(message: string) {
    return this.http.post('/messages', { message }).pipe(
      map((response: any) => [response.data, ...this._greetings$.value as any].sort((a: any, b: any) => a.id - b.id)),
      tap((response: any) => this._greetings$.next(response))
    )
  }

  updateGreeting(id: number, message: string) {
    return this.http.put(`/messages/${id}`, { message }).pipe(
      map((response: any) => this._greetings$.value.map((greeting: any) => greeting.id === id ? response.data : greeting)),
      tap((response: any) => this._greetings$.next(response))
    )
  }

  deleteGreeting(id: number) {
    return this.http.delete(`/messages/${id}`).pipe(
      map((_: any) => this._greetings$.value.filter((greeting: any) => greeting.id !== id)),
      tap((response: any) => this._greetings$.next(response))
    )
  }
}