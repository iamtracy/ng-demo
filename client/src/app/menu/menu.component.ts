import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import Keycloak from 'keycloak-js'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzMenuModule } from 'ng-zorro-antd/menu'

@Component({
  selector: 'app-menu',
  imports: [NzIconModule, NzMenuModule, NzButtonModule, RouterModule, CommonModule],
  templateUrl: './menu.component.html',
  styles: [`
    .menu-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
      background: #fff;
      border-bottom: 1px solid #f0f0f0;
    }
  `]
})
export class MenuComponent implements OnInit {
  keycloak = inject(Keycloak)
  router = inject(Router)
  realmRoles: string[] = []

  async ngOnInit() {
    try {
      this.realmRoles = this.keycloak.realmAccess?.roles || []
    } catch (error) {
      console.error('Error checking realm roles:', error)
    }
  }

  hasAdminRole(): boolean {
    return this.keycloak.hasRealmRole('admin')
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route
  }

  getUserDisplayName(): string {
    const token = this.keycloak.tokenParsed
    if (token?.['given_name'] && token?.['family_name']) {
      return `${token['given_name']} ${token['family_name']}`
    }
    return token?.['preferred_username'] || token?.['name'] || 'User'
  }

  async logout() {
    try {
      await this.keycloak.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }
}
