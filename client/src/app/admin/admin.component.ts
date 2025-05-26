import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Observable, of } from 'rxjs'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzIconModule } from 'ng-zorro-antd/icon'
import Keycloak from 'keycloak-js'
import { AdminService } from './admin.service'
import { UserDto } from '../core/api'

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzIconModule
  ],
  templateUrl: './admin.component.html',
  styles: [`
    .no-roles {
      color: #999;
      font-style: italic;
    }
  `]
})
export class AdminComponent implements OnInit {
  users$: Observable<UserDto[]> = of([])
  currentUserId: string = ''
  keycloak = inject(Keycloak)

  constructor(private adminService: AdminService) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.keycloak.tokenParsed?.sub ?? ''
    
    this.users$ = this.adminService.usersWithAutoLoad$
  }
}
