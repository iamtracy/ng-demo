import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { tap } from 'rxjs/operators'

interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly _users$ = new BehaviorSubject<User[]>([])
  readonly users$ = this._users$.asObservable()

  constructor(private http: HttpClient) { }

  getAllUsers() {
    return this.http.get('/api/users').pipe(
      tap((response: any) => this._users$.next(response.data))
    )
  }

  getUserById(id: string) {
    return this.http.get<User>(`/api/users/${id}`)
  }

  updateUser(id: string, userData: Partial<User>) {
    return this.http.put<User>(`/api/users/${id}`, userData).pipe(
      tap(() => {
        // Refresh the users list after update
        this.getAllUsers().subscribe()
      })
    )
  }

  deleteUser(id: string) {
    return this.http.delete(`/api/users/${id}`).pipe(
      tap(() => {
        // Refresh the users list after deletion
        this.getAllUsers().subscribe()
      })
    )
  }

  // Get all messages from all users (admin only)
  getAllMessages() {
    return this.http.get<any[]>('/api/messages/admin/all')
  }
}
