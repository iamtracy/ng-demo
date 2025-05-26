import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Observable, of, tap, map } from 'rxjs'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { FormsModule } from '@angular/forms'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import Keycloak from 'keycloak-js'
import { HomeService } from './home.service'
import { MessageDto } from '../core/api'

interface ExtendedMessage extends MessageDto {
  editing?: boolean
  editMessage?: string
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzDividerModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  @ViewChild('messageInput') messageInput!: ElementRef
  
  displayedColumns: string[] = ['id', 'message', 'createdAt', 'updatedAt', 'delete']
  messages$: Observable<ExtendedMessage[]> = of([])
  currentUserId = ''
  currentlyEditing: ExtendedMessage | null = null
  keycloak = inject(Keycloak)

  form = new FormGroup({
    message: new FormControl('')
  })

  constructor(
    private homeService: HomeService
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.keycloak.tokenParsed?.sub ?? ''
    
    this.messages$ = this.homeService.messagesWithAutoLoad$.pipe(
      map(messages => messages.map(msg => ({
        ...msg,
        editing: false,
        editMessage: undefined
      } as ExtendedMessage)))
    )
  }

  canEdit(element: ExtendedMessage): boolean {
    return element.userId === this.currentUserId
  }

  deleteGreeting(id: number) {
    this.homeService.deleteGreeting(id).subscribe()
  }

  onSubmit() {
    if (!this.form.value.message) return
    
    this.homeService.createGreeting(this.form.value.message)
    .pipe(
      tap(() => this.form.reset())
    )
    .subscribe()
  }

  startEdit(element: ExtendedMessage): void {
    if (!this.canEdit(element)) return

    // Cancel any existing edit
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

  async saveEdit(element: ExtendedMessage): Promise<void> {
    if (!this.canEdit(element)) return

    try {
      this.homeService.updateGreeting(element.id, element.editMessage!).subscribe()
      element.message = element.editMessage!
      element.editing = false
      this.currentlyEditing = null
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  cancelEdit(element: ExtendedMessage): void {
    element.editing = false
    delete element.editMessage
    this.currentlyEditing = null
  }
}
