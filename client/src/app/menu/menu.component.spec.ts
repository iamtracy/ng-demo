import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator'
import Keycloak from 'keycloak-js'

import { MenuComponent } from './menu.component'

describe('MenuComponent', () => {
  let spectator: SpectatorRouting<MenuComponent>
  
  const keycloakMock = {
    hasRealmRole: jasmine.createSpy('hasRealmRole'),
    authenticated: true,
    token: 'mock-token',
    realmAccess: {
      roles: ['user', 'admin']
    },
    tokenParsed: {
      ['preferred_username']: 'testUser',
      ['given_name']: 'Test',
      ['family_name']: 'User',
      email: 'test@example.com',
      realm_access: {
        roles: ['user', 'admin']
      }
    },
    init: jasmine.createSpy('init').and.resolveTo(true),
    updateToken: jasmine.createSpy('updateToken').and.resolveTo(true),
    login: jasmine.createSpy('login'),
    logout: jasmine.createSpy('logout'),
    register: jasmine.createSpy('register')
  }

  const createComponent = createRoutingFactory({
    component: MenuComponent,
    providers: [
      { provide: Keycloak, useValue: keycloakMock }
    ]
  })

  beforeEach(async () => {
    keycloakMock.hasRealmRole.and.callFake((role: string) => {
      return keycloakMock.realmAccess?.roles.includes(role) ?? false
    })
    
    spectator = createComponent()
    await spectator.fixture.whenStable()
    spectator.detectChanges()
  })

  it('should create', () => {
    expect(spectator.component).toBeTruthy()
  })

  it('should check admin role', () => {
    expect(spectator.component.hasAdminRole()).toBe(true)
    expect(keycloakMock.hasRealmRole).toHaveBeenCalledWith('admin')
  })

  it('should handle logout', () => {
    spectator.click('[data-testid="logout-button"]')
    expect(keycloakMock.logout).toHaveBeenCalled()
  })

  it('should show full name when available', () => {
    const displayName = spectator.query('[data-testid="user-display"]')?.textContent?.trim()
    expect(displayName).toContain('Test User')
  })

  it('should show admin menu items only for admin users', () => {
    keycloakMock.hasRealmRole.and.returnValue(true)
    spectator.detectChanges()
    const adminElements = spectator.queryAll('[data-testid="admin-menu-item"]')
    expect(adminElements.length).toBe(1)

    keycloakMock.hasRealmRole.and.returnValue(false)
    spectator.detectChanges()
    const noAdminElements = spectator.queryAll('[data-testid="admin-menu-item"]')
    expect(noAdminElements.length).toBe(0)
  })

  it('should show authenticated menu items', () => {
    const authElements = spectator.queryAll('[data-testid="auth-menu-item"]')
    expect(authElements.length).toBe(1)
  })

  it('should not show admin items when user lacks role', () => {
    keycloakMock.realmAccess!.roles = ['user']
    keycloakMock.hasRealmRole.and.callFake((role: string) => {
      return keycloakMock.realmAccess?.roles.includes(role) ?? false
    })
    
    spectator.detectChanges()
    expect(spectator.component.hasAdminRole()).toBe(false)
    const adminElements = spectator.queryAll('[data-testid="admin-menu-item"]')
    expect(adminElements.length).toBe(0)
  })
})