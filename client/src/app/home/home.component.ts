import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { Observable, of, tap } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { FormsModule } from '@angular/forms'
import { MatPaginator } from '@angular/material/paginator'
import Keycloak from 'keycloak-js'
import { HomeService } from './home.service'

interface Message {
  id: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  editing?: boolean;
  editMessage?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styles: [`
    .editable-cell {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }
    .editable-cell:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .edit-icon {
      font-size: 18px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .editable-cell:hover .edit-icon {
      opacity: 0.5;
    }
    .not-owner {
      cursor: not-allowed;
      color: rgba(0, 0, 0, 0.5);
    }
  `]
})
export class HomeComponent implements OnInit {
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  displayedColumns: string[] = ['id', 'message', 'createdAt', 'updatedAt', 'delete']
  dataSource = new MatTableDataSource<Message>([])
  greetings$: Observable<any[]> = of([])
  currentUserId: string = ''
  keycloak = inject(Keycloak)

  form = new FormGroup({
    message: new FormControl('')
  })

  constructor(
    private homeService: HomeService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.keycloak.tokenParsed?.sub ?? ''
    
    this.homeService.getGreetings().subscribe()
    this.greetings$ = this.homeService.greetings$.pipe(
      tap((greetings) => this.dataSource.data = greetings)
    )
  }

  canEdit(element: Message): boolean {
    return element.userId === this.currentUserId;
  }

  deleteGreeting(id: number) {
    const greeting = this.dataSource.data.find(g => g.id === id);
    if (greeting && this.canEdit(greeting)) {
      this.homeService.deleteGreeting(id).subscribe()
    }
  }

  onSubmit() {
    if (!this.form.value.message) return;
    
    this.homeService.createGreeting(this.form.value.message)
    .pipe(
      tap(() => this.form.reset())
    )
    .subscribe()
  }

  startEdit(element: Message): void {
    if (!this.canEdit(element)) return;

    // Cancel any other editing
    this.dataSource.data.forEach(item => {
      if (item !== element && item.editing) {
        this.cancelEdit(item);
      }
    });

    element.editing = true;
    element.editMessage = element.message;
    
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    });
  }

  async saveEdit(element: Message): Promise<void> {
    if (!this.canEdit(element)) return;

    try {
      this.homeService.updateGreeting(element.id, element.editMessage!).subscribe()
      element.message = element.editMessage!;
      element.editing = false;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  cancelEdit(element: Message): void {
    element.editing = false;
    delete element.editMessage;
  }
}
