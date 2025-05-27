import { Injectable, inject } from '@angular/core'
import Keycloak from 'keycloak-js'
import { BehaviorSubject, tap, Observable } from 'rxjs'

import { UserDto, UsersService } from '../api'

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _user$ = new BehaviorSubject<UserDto | null>(null)
  readonly user$ = this._user$.asObservable()
  
  private _initialized = false
  private keycloak = inject(Keycloak)
  
  constructor(private usersService: UsersService) {}

  get userWithAutoLoad$(): Observable<UserDto | null> {
    if (!this._initialized) {
      this._initialized = true
      this.usersService.userControllerGetCurrentUser().pipe(
        tap((user: UserDto) => this._user$.next(user))
      ).subscribe()
    }
    return this.user$
  }

  getUsers() {
    return this.usersService.userControllerGetCurrentUser().pipe(
      tap((user: UserDto) => this._user$.next(user))
    )
  }

  async logout(): Promise<void> {
    try {
      this._user$.next(null)
      this._initialized = false
      
      await this.keycloak.logout()
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }
}