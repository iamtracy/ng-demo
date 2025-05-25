import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthService } from '../core/services/auth.service'
import { KeycloakProfile } from 'keycloak-js'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <div class="welcome-section">
        <h1>Welcome, {{ userProfile?.firstName || 'Guest' }}!</h1>
        <p class="role-badge" *ngFor="let role of roles">{{ role }}</p>
      </div>

      <div class="profile-section" *ngIf="userProfile">
        <h2>Your Profile</h2>
        <div class="profile-details">
          <div class="detail-item">
            <label>Username:</label>
            <span>{{ userProfile.username }}</span>
          </div>
          <div class="detail-item">
            <label>Email:</label>
            <span>{{ userProfile.email }}</span>
          </div>
          <div class="detail-item">
            <label>Name:</label>
            <span>{{ userProfile.firstName }} {{ userProfile.lastName }}</span>
          </div>
        </div>
      </div>

      <div class="admin-section" *ngIf="isAdmin">
        <h2>Admin Dashboard</h2>
        <div class="admin-stats">
          <div class="stat-card">
            <h3>Total Users</h3>
            <p class="stat">2</p>
          </div>
          <div class="stat-card">
            <h3>Active Sessions</h3>
            <p class="stat">1</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .role-badge {
      background: #4CAF50;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .profile-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .profile-details {
      display: grid;
      gap: 1rem;
    }

    .detail-item {
      display: grid;
      grid-template-columns: 120px 1fr;
      align-items: center;
    }

    .detail-item label {
      font-weight: 500;
      color: #666;
    }

    .admin-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 2rem;
    }

    .admin-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-card h3 {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .stat {
      font-size: 2rem;
      font-weight: bold;
      color: #2196F3;
      margin: 0.5rem 0 0;
    }
  `]
})
export class HomeComponent implements OnInit {
  userProfile: KeycloakProfile | null = null
  roles: string[] = []
  isAdmin = false

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    try {
      this.userProfile = await this.authService.getProfile()
      this.roles = this.authService.getRoles()
      this.isAdmin = this.roles.includes('admin')
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }
}
