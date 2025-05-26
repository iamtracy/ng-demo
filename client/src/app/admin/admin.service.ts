import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, startWith, switchMap, tap } from 'rxjs'

import { UserDto, UsersService } from '../api'

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly _users$ = new BehaviorSubject<UserDto[]>([])
  readonly users$ = this._users$.asObservable()

  constructor(private usersService: UsersService) { }

  private getAllUsers() {
    return this.usersService.userControllerGetAllUsers().pipe(
      tap((users: UserDto[]) => this._users$.next(users))
    )
  }
  
  get usersWithAutoLoad$(): Observable<UserDto[]> {
    return this.users$.pipe(
      startWith([]),
      switchMap((currentUsers) => {
        if (currentUsers.length === 0) {
          return this.getAllUsers()
        }
        return this.users$
      })
    )
  }
}
