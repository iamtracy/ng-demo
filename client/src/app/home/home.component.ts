import { CommonModule } from '@angular/common'
import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { FormsModule } from '@angular/forms'
import Keycloak from 'keycloak-js'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzTableModule } from 'ng-zorro-antd/table'
import { map, Observable, of, tap } from 'rxjs'

import { MessageDto } from '../api'

import { HomeService } from './home.service'

interface Message extends MessageDto {
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
  messages$: Observable<Message[]> = of([])
  currentUserId = ''
  currentlyEditing: Message | null = null
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
      })))
    )
  }

  canEdit(element: Message): boolean {
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
      this.homeService.updateGreeting(element.id, element.editMessage!).subscribe()
      element.message = element.editMessage!
      element.editing = false
      this.currentlyEditing = null
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  cancelEdit(element: Message): void {
    element.editing = false
    delete element.editMessage
    this.currentlyEditing = null
  }
}
