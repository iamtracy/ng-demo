import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import Keycloak from 'keycloak-js'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { Observable, of } from 'rxjs'

import { UserDto } from '../core/api'

import { AdminService } from './admin.service'

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
  currentUserId = ''
  keycloak = inject(Keycloak)

  constructor(private adminService: AdminService) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.keycloak.tokenParsed?.sub ?? ''
    
    this.users$ = this.adminService.usersWithAutoLoad$
  }
}
