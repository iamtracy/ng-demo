import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, switchMap, EMPTY } from 'rxjs';
import { MessagesService, MessageDto, CreateMessageDto } from '../api';

@Injectable({
  providedIn: 'root'
})
export class MessagesStateService {
  private readonly _messages$ = new BehaviorSubject<MessageDto[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);

  // Public observables
  readonly messages$ = this._messages$.asObservable();
  readonly loading$ = this._loading$.asObservable();
  readonly error$ = this._error$.asObservable();

  constructor(private messagesService: MessagesService) {}

  /**
   * Load all messages and update the state
   */
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

  /**
   * Create a new message and update the state
   */
  createMessage(createMessageDto: CreateMessageDto): Observable<MessageDto> {
    return this.messagesService.messageControllerCreate(createMessageDto).pipe(
      tap({
        next: (newMessage) => {
          const currentMessages = this._messages$.value;
          // Add new message and sort by ID
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

  /**
   * Update a message and update the state
   */
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

  /**
   * Delete a message and update the state
   */
  deleteMessage(id: number): Observable<any> {
    return this.messagesService.messageControllerDelete(id).pipe(
      tap({
        next: (response) => {
          const currentMessages = this._messages$.value;
          // Use the passed id since the response might not have the exact structure
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

  /**
   * Refresh messages (useful for manual refresh)
   */
  refresh(): void {
    this.loadMessages().subscribe();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error$.next(null);
  }
} 