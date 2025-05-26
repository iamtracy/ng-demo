import { Injectable } from '@angular/core'
import { BehaviorSubject, map, tap, Observable, startWith, switchMap } from 'rxjs'
import { MessageDto, MessagesService } from '../core/api'

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly _messages$ = new BehaviorSubject<MessageDto[]>([])
  readonly messages$ = this._messages$.asObservable()

  constructor(private messagesService: MessagesService) {}

  get messagesWithAutoLoad$(): Observable<MessageDto[]> {
    return this._messages$.pipe(
      startWith([]),
      switchMap((currentMessages) => {
        if (currentMessages.length === 0) {
          return this.getGreetings()
        }
        return this.messages$
      })
    )
  }

  getAllUsers() {
    return this.messagesService.messageControllerFindAll().pipe(
      tap((response: MessageDto[]) => this._messages$.next(response))
    )
  }

  getGreetings() {
    return this.messagesService.messageControllerFindAll().pipe(
      tap((response: MessageDto[]) => this._messages$.next(response))
    )
  }

  createGreeting(message: string) {
    return this.messagesService.messageControllerCreate({
      message
    }).pipe(
      map((response: MessageDto) => [response, ...this._messages$.value].sort((a: MessageDto, b: MessageDto) => b.id - a.id)),
      tap((response: MessageDto[]) => this._messages$.next(response))
    )
  }

  updateGreeting(id: number, message: string) {
    return this.messagesService.messageControllerUpdate(id, {
      message
    }).pipe(
      map((response: MessageDto) => this._messages$.value.map((greeting: MessageDto) => greeting.id === id ? response : greeting)),
      tap((response: MessageDto[]) => this._messages$.next(response))
    )
  }

  deleteGreeting(id: number) {
    return this.messagesService.messageControllerDelete(id).pipe(
      map(() => this._messages$.value.filter((greeting: MessageDto) => greeting.id !== id)),
      tap((filteredGreetings: MessageDto[]) => this._messages$.next(filteredGreetings))
    )
  }
}