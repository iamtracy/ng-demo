import { Component, inject, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { MatIconModule } from '@angular/material/icon'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { map, Observable, shareReplay } from 'rxjs'
import Keycloak from 'keycloak-js'
import { CommonModule } from '@angular/common'
import { HasRolesDirective } from 'keycloak-angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    HasRolesDirective,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span class="app-title">My App</span>
          <span class="spacer"></span>
          <nav class="nav-links">
            <a mat-button href="/about" *kaHasRoles="['view-profile']">
              <mat-icon>info</mat-icon>
              About
            </a>
            <a mat-button href="/" *kaHasRoles="['view-profile']">
              <mat-icon>home</mat-icon>
              Home
            </a>
          </nav>
          <button mat-flat-button color="warn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-toolbar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .content {
      padding: 20px;
    }
    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .app-title {
      font-size: 1.2em;
      font-weight: 500;
    }
    .nav-links {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-right: 16px;
    }
    .nav-links a {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    mat-icon {
      margin-right: 4px;
    }
    button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class AppComponent {
  private breakpointObserver = inject(BreakpointObserver)
  private readonly keycloak = inject(Keycloak)
  realmRoles: string[] = []

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    )

    async ngOnInit() {
      try {
        this.realmRoles = this.keycloak.realmAccess?.roles || []
        console.log('Realm Roles:', this.realmRoles)
      } catch (error) {
        console.error('Error checking realm roles:', error)
      }
    }

  async logout() {
    try {
      await this.keycloak.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }
}
