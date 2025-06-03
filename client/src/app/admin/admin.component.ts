import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { injectQuery } from '@tanstack/angular-query-experimental'
import Keycloak from 'keycloak-js'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'

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
export class AdminComponent {
  private readonly keycloak = inject(Keycloak)
  readonly adminService = inject(AdminService)
  readonly currentUserId = this.keycloak.tokenParsed?.sub ?? ''
 
  query = injectQuery(() => ({
    queryKey: ['users'],
    queryFn: (): Promise<UserDto[]> => this.adminService.getUsers(),
  }))
}
