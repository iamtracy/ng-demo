import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { map } from 'rxjs'

import { MenuService } from './menu.service'

@Component({
  selector: 'app-menu',
  standalone: true,
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
export class MenuComponent {
  private menuService = inject(MenuService)

  user$ = this.menuService.userWithAutoLoad$
  hasAdminRole$ = this.user$.pipe(
    map(user => ((user?.roles as unknown) as string[])?.includes('admin') ?? false)
  )

  async logout() {
    try {
      await this.menuService.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }
}
