import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, tap } from 'rxjs'

import { UserDto, UsersService } from '../api'

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly _users$ = new BehaviorSubject<UserDto[]>([])
  readonly users$ = this._users$.asObservable()
  
  private _initialized = false

  constructor(private usersService: UsersService) { }
  
  get usersWithAutoLoad$(): Observable<UserDto[]> {
    if (!this._initialized) {
      this._initialized = true
      this.usersService.userControllerGetAllUsers().pipe(
        tap((users: UserDto[]) => this._users$.next(users))
      ).subscribe()
    }
    return this.users$
  }
}
