import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { Observable, of, tap } from 'rxjs'
import Keycloak from 'keycloak-js'
import { AdminService } from './admin.service'
import { UserDto } from '../core/api'

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'email', 'firstName', 'lastName', 'roles', 'emailVerified', 'lastLoginAt']
  dataSource = new MatTableDataSource<UserDto>([])
  users$: Observable<UserDto[]> = of([])
  currentUserId: string = ''
  keycloak = inject(Keycloak)

  constructor(private adminService: AdminService) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.keycloak.tokenParsed?.sub ?? ''
    
    this.users$ = this.adminService.usersWithAutoLoad$.pipe(
      tap((users) => this.dataSource.data = users)
    )
  }
}
