import { inject, Injectable } from '@angular/core'
import { BehaviorSubject, map, tap, Observable } from 'rxjs'

import { MessageDto, MessagesService } from '../api'

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly _messages$ = new BehaviorSubject<MessageDto[]>([])
  readonly messages$ = this._messages$.asObservable()
  private _initialized = false
  readonly messagesService = inject(MessagesService)

  get messagesWithAutoLoad$(): Observable<MessageDto[]> {
    if (!this._initialized) {
      this._initialized = true
      this.messagesService.messageControllerFindAll().pipe(
        tap((response: MessageDto[]) => this._messages$.next(response))
      ).subscribe()
    }
    return this.messages$
  }

  getAllUsers(): Observable<MessageDto[]> {
    return this.messagesService.messageControllerFindAll().pipe(
      tap((response: MessageDto[]) => this._messages$.next(response))
    )
  }

  getGreetings(): Observable<MessageDto[]> {
    return this.messagesService.messageControllerFindAll().pipe(
      tap((response: MessageDto[]) => this._messages$.next(response))
    )
  }

  createGreeting(message: string): Observable<MessageDto[]> {
    return this.messagesService.messageControllerCreate({
      message
    }).pipe(
      map((response: MessageDto) => [response, ...this._messages$.value].sort((a: MessageDto, b: MessageDto) => b.id - a.id)),
      tap((response: MessageDto[]) => this._messages$.next(response))
    )
  }

  updateGreeting(id: number, message: string): Observable<MessageDto[]> {
    return this.messagesService.messageControllerUpdate(id, {
      message
    }).pipe(
      map((response: MessageDto) => this._messages$.value.map((greeting: MessageDto) => greeting.id === id ? response : greeting)),
      tap((response: MessageDto[]) => this._messages$.next(response))
    )
  }

  deleteGreeting(id: number): Observable<MessageDto[]> {
    return this.messagesService.messageControllerDelete(id).pipe(
      map(() => this._messages$.value.filter((greeting: MessageDto) => greeting.id !== id)),
      tap((filteredGreetings: MessageDto[]) => this._messages$.next(filteredGreetings))
    )
  }
}