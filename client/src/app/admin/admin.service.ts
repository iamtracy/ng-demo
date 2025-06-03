import { inject, Injectable } from '@angular/core'
import { lastValueFrom } from 'rxjs'

import { UserDto, UsersService } from '../api'

@Injectable({
  providedIn: 'root'
})
export class AdminService { 
  private readonly usersService = inject(UsersService)

  getUsers(): Promise<UserDto[]> {    
    return lastValueFrom(this.usersService.userControllerGetAllUsers())
  }
}
