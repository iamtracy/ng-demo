import { 
  DeleteOutline,
  EditOutline,
  CheckOutline,
  CloseOutline
} from '@ant-design/icons-angular/icons'
import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator'
import Keycloak from 'keycloak-js'
import { provideNzIcons } from 'ng-zorro-antd/icon'
import { of } from 'rxjs'

import { MessageDto } from '../api'

import { HomeComponent } from './home.component'
import { HomeService } from './home.service'

describe('HomeComponent', () => {
  let spectator: SpectatorRouting<HomeComponent>
  let homeService: jasmine.SpyObj<HomeService>

  const mockMessages: MessageDto[] = [
    {
      id: 1,
      message: 'Test message 1',
      userId: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      message: 'Test message 2',
      userId: 'user2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const keycloakMock = {
    tokenParsed: {
      sub: 'user1',
      preferred_username: 'testUser',
      given_name: 'Test',
      family_name: 'User'
    }
  }

  const homeServiceMock = {
    messagesWithAutoLoad$: of(mockMessages),
    createGreeting: jasmine.createSpy('createGreeting').and.returnValue(of({})),
    updateGreeting: jasmine.createSpy('updateGreeting').and.returnValue(of({})),
    deleteGreeting: jasmine.createSpy('deleteGreeting').and.returnValue(of({}))
  }

  const createComponent = createRoutingFactory({
    component: HomeComponent,
    providers: [
      { provide: Keycloak, useValue: keycloakMock },
      { provide: HomeService, useValue: homeServiceMock },
      provideNzIcons([
        DeleteOutline,
        EditOutline,
        CheckOutline,
        CloseOutline
      ])
    ]
  })

  beforeEach(async () => {
    spectator = createComponent()
    homeService = spectator.inject(HomeService) as jasmine.SpyObj<HomeService>
    await spectator.fixture.whenStable()
    spectator.detectChanges()
  })

  it('should create', () => {
    expect(spectator.component).toBeTruthy()
  })

  it('should load messages on init', () => {
    const messages = spectator.queryAll('tbody tr')
    expect(messages.length).toBe(2)
  })

  it('should show edit buttons only for user\'s own messages', () => {
    const firstRowButtons = spectator.queryAll('tbody tr:first-child nz-button-group button')
    const secondRowButtons = spectator.queryAll('tbody tr:last-child nz-button-group button')
    
    expect(firstRowButtons.length).toBe(2) // Edit and Delete for own message
    expect(secondRowButtons.length).toBe(0) // No buttons for other's message
  })

  it('should not allow editing others\' messages', () => {
    const messageCell = spectator.query('tbody tr:last-child .editable-cell')
    spectator.click(messageCell!)
    spectator.detectChanges()

    const input = spectator.query('tbody tr:last-child input[nz-input]')
    expect(input).toBeFalsy()
  })

  it('should delete message', () => {
    const deleteButton = spectator.query('tbody tr:first-child button[nzDanger]')
    spectator.click(deleteButton!)
    spectator.detectChanges()

    expect(homeService.deleteGreeting).toHaveBeenCalledWith(1)
  })

  it('should create new message', () => {
    const input = spectator.query('.form-section input')
    spectator.typeInElement('New message', input!)
    spectator.detectChanges()

    const form = spectator.query('form')
    spectator.dispatchFakeEvent(form!, 'submit')
    spectator.detectChanges()

    expect(homeService.createGreeting).toHaveBeenCalledWith('New message')
  })
})
