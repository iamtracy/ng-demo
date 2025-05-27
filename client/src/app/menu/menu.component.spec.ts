import { 
  UserOutline, 
  CrownOutline, 
  LogoutOutline,
  PlusOutline,
  DeleteOutline,
  EditOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  CheckOutline,
  CloseOutline
} from '@ant-design/icons-angular/icons'
import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator'
import Keycloak from 'keycloak-js'
import { provideNzIcons } from 'ng-zorro-antd/icon'
import { of } from 'rxjs'

import { UserDto } from '../api'

import { MenuComponent } from './menu.component'
import { MenuService } from './menu.service'

describe('MenuComponent', () => {
  let spectator: SpectatorRouting<MenuComponent>
  let menuService: jasmine.SpyObj<MenuService>
  
  const mockUser: UserDto = {
    id: 'user1',
    email: 'test@example.com',
    username: 'testUser',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    roles: ['user', 'admin'] as unknown as string[][],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }

  const mockUserWithoutAdmin: UserDto = {
    ...mockUser,
    roles: ['user'] as unknown as string[][]
  }

  const keycloakMock = {
    logout: jasmine.createSpy('logout').and.resolveTo()
  }

  const menuServiceMock = {
    userWithAutoLoad$: of(mockUser),
    logout: jasmine.createSpy('logout').and.resolveTo()
  }

  const createComponent = createRoutingFactory({
    component: MenuComponent,
    providers: [
      { provide: Keycloak, useValue: keycloakMock },
      { provide: MenuService, useValue: menuServiceMock },
      provideNzIcons([
        UserOutline,
        CrownOutline,
        LogoutOutline,
        PlusOutline,
        DeleteOutline,
        EditOutline,
        CheckCircleOutline,
        CloseCircleOutline,
        CheckOutline,
        CloseOutline
      ])
    ]
  })

  beforeEach(async () => {
    spectator = createComponent()
    menuService = spectator.inject(MenuService) as jasmine.SpyObj<MenuService>
    await spectator.fixture.whenStable()
    spectator.detectChanges()
  })

  it('should create', () => {
    expect(spectator.component).toBeTruthy()
  })

  it('should handle logout', async () => {
    await spectator.component.logout()
    expect(menuService.logout).toHaveBeenCalled()
  })

  it('should show full name when available', () => {
    const displayName = spectator.query('[data-testid="user-display"]')?.textContent?.trim()
    expect(displayName).toContain('Test User')
  })

  it('should show admin menu items for admin users', () => {
    const adminElements = spectator.queryAll('[data-testid="admin-menu-item"]')
    expect(adminElements.length).toBe(1)
  })

  it('should show authenticated menu items', () => {
    const authElements = spectator.queryAll('[data-testid="auth-menu-item"]')
    expect(authElements.length).toBe(1)
  })

  it('should not show admin items when user lacks admin role', () => {
    const menuServiceMockWithoutAdmin = {
      userWithAutoLoad$: of(mockUserWithoutAdmin),
      logout: jasmine.createSpy('logout').and.resolveTo()
    }

    const createComponentWithoutAdmin = createRoutingFactory({
      component: MenuComponent,
      providers: [
        { provide: Keycloak, useValue: keycloakMock },
        { provide: MenuService, useValue: menuServiceMockWithoutAdmin },
        provideNzIcons([
          UserOutline,
          CrownOutline,
          LogoutOutline,
          PlusOutline,
          DeleteOutline,
          EditOutline,
          CheckCircleOutline,
          CloseCircleOutline,
          CheckOutline,
          CloseOutline
        ])
      ]
    })

    const spectatorWithoutAdmin = createComponentWithoutAdmin()
    spectatorWithoutAdmin.detectChanges()
    
    const adminElements = spectatorWithoutAdmin.queryAll('[data-testid="admin-menu-item"]')
    expect(adminElements.length).toBe(0)
  })
})