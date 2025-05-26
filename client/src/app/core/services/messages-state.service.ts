import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MessagesService, MessageDto, CreateMessageDto } from '../api';

@Injectable({
  providedIn: 'root'
})
export class MessagesStateService {
  private readonly _messages$ = new BehaviorSubject<MessageDto[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);

  readonly messages$ = this._messages$.asObservable();
  readonly loading$ = this._loading$.asObservable();
  readonly error$ = this._error$.asObservable();

  constructor(private messagesService: MessagesService) {}

  loadMessages(): Observable<MessageDto[]> {
    this._loading$.next(true);
    this._error$.next(null);
    
    return this.messagesService.messageControllerFindAll().pipe(
      tap({
        next: (messages) => {
          this._messages$.next(messages);
          this._loading$.next(false);
        },
        error: (error) => {
          this._error$.next('Failed to load messages');
          this._loading$.next(false);
          console.error('Error loading messages:', error);
        }
      })
    );
  }

  createMessage(createMessageDto: CreateMessageDto): Observable<MessageDto> {
    return this.messagesService.messageControllerCreate(createMessageDto).pipe(
      tap({
        next: (newMessage) => {
          const currentMessages = this._messages$.value;
          const updatedMessages = [newMessage, ...currentMessages].sort((a, b) => b.id - a.id);
          this._messages$.next(updatedMessages);
        },
        error: (error) => {
          this._error$.next('Failed to create message');
          console.error('Error creating message:', error);
        }
      })
    );
  }

  updateMessage(id: number, updateMessageDto: CreateMessageDto): Observable<MessageDto> {
    return this.messagesService.messageControllerUpdate(id, updateMessageDto).pipe(
      tap({
        next: (updatedMessage) => {
          const currentMessages = this._messages$.value;
          const updatedMessages = currentMessages.map(msg => 
            msg.id === id ? updatedMessage : msg
          );
          this._messages$.next(updatedMessages);
        },
        error: (error) => {
          this._error$.next('Failed to update message');
          console.error('Error updating message:', error);
        }
      })
    );
  }

  deleteMessage(id: number): Observable<unknown> {
    return this.messagesService.messageControllerDelete(id).pipe(
      tap({
        next: () => {
          const currentMessages = this._messages$.value;
          const updatedMessages = currentMessages.filter(msg => msg.id !== id);
          this._messages$.next(updatedMessages);
        },
        error: (error) => {
          this._error$.next('Failed to delete message');
          console.error('Error deleting message:', error);
        }
      })
    );
  }

  refresh(): void {
    this.loadMessages().subscribe();
  }

  clearError(): void {
    this._error$.next(null);
  }
} 