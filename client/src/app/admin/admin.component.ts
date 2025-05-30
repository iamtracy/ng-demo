import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core'
import { NotificationService } from '@app/shared'
import Keycloak from 'keycloak-js'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { Observable, of } from 'rxjs'

import { UserDto } from '../api'

import { AdminService } from './admin.service'

@Component({
  selector: 'app-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzButtonModule,
    NzPopconfirmModule
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
  deletingUserId: string | null = null
  keycloak = inject(Keycloak)
  readonly adminService = inject(AdminService)
  private readonly notificationService = inject(NotificationService)

  ngOnInit(): void {
    this.currentUserId = this.keycloak.tokenParsed?.sub ?? ''
    
    this.users$ = this.adminService.usersWithAutoLoad$
  }
}
