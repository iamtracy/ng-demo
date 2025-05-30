import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms'
import { NotificationService } from '@app/shared'
import Keycloak from 'keycloak-js'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzTableModule } from 'ng-zorro-antd/table'
import { catchError, map, Observable, of, tap } from 'rxjs'

import { MessageDto } from '../api'

import { HomeService } from './home.service'

interface Message extends MessageDto {
  editing?: boolean
  editMessage?: string
}

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzTableModule,
    NzDividerModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styles: [
    `
      .form-section {
        max-width: 350px;
      }
      
      .author-name {
        font-weight: 500;
        color: #1890ff;
      }
      
      .editable-cell {
        cursor: pointer;
      }
      
      .editable-cell:hover .edit-icon {
        opacity: 1;
      }
      
      .edit-icon {
        opacity: 0.5;
        margin-left: 8px;
        transition: opacity 0.2s;
      }
      
      .not-owner {
        cursor: default;
      }
    `
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild('messageInput') messageInput!: ElementRef
  readonly homeService = inject(HomeService)
  keycloak = inject(Keycloak)
  
  displayedColumns: string[] = ['id', 'message', 'createdAt', 'updatedAt', 'delete']
  messages$: Observable<Message[]> = of([])
  currentUserId = ''
  currentlyEditing: Message | null = null

  form = new FormGroup({
    message: new FormControl('', [Validators.required]),
  })

  notificationService = inject(NotificationService)

  get isAdmin(): boolean {
    return this.keycloak.tokenParsed?.realm_access?.roles?.includes('admin') ?? false
  }

  get shouldShowAuthorColumn(): boolean {
    return this.isAdmin
  }

  ngOnInit(): void {
    this.currentUserId = this.keycloak.tokenParsed?.sub ?? ''
    
    this.messages$ = this.homeService.messagesWithAutoLoad$.pipe(
      map(messages => messages.map(msg => ({
        ...msg,
        editing: false,
        editMessage: undefined
      })))
    )
  }

  canEdit(element: Message): boolean {
    return element.userId === this.currentUserId
  }

  deleteGreeting(id: number): void {
    this.homeService.deleteGreeting(id).pipe(
      tap(() => {
        this.notificationService.deleteSuccess('Message')
      }),
      catchError((error) => {
        this.notificationService.deleteError('Message')
        return of(error)
      })
    ).subscribe()
  }

  onSubmit(): void {
    if (!this.form.value.message) return
    
    this.homeService.createGreeting(this.form.value.message)
    .pipe(
      tap(() => {
        this.form.reset()
        this.notificationService.saveSuccess('Message')
      }),
      catchError((error) => {
        this.notificationService.saveError('Message')
        return of(error)
      })
    )
    .subscribe()
  }

  startEdit(element: Message): void {
    if (!this.canEdit(element)) return

    if (this.currentlyEditing && this.currentlyEditing.id !== element.id) {
      this.cancelEdit(this.currentlyEditing)
    }

    element.editing = true
    element.editMessage = element.message
    this.currentlyEditing = element
    
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus()
      }
    })
  }

  async saveEdit(element: Message): Promise<void> {
    if (!this.canEdit(element)) return

    try {
      this.homeService.updateGreeting(element.id, element.editMessage!).pipe(
        tap(() => {
          element.message = element.editMessage!
          element.editing = false
          this.currentlyEditing = null
          this.notificationService.updateSuccess('Message')
        }),
        catchError((error) => {
          this.notificationService.updateError('Message')
          return of(error)
        })
      ).subscribe()
      element.message = element.editMessage!
      element.editing = false
      this.currentlyEditing = null
    } catch (error) {
      console.error('Error saving message:', error)
      this.notificationService.updateError('Message')
    }
  }

  cancelEdit(element: Message): void {
    element.editing = false
    delete element.editMessage
    this.currentlyEditing = null
  }
}
