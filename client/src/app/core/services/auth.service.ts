import { Injectable } from '@angular/core'
import { KeycloakService } from 'keycloak-angular'
import { KeycloakProfile } from 'keycloak-js'
import { from, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private keycloak: KeycloakService) {}

  public init(): Promise<boolean> {
    return this.keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'my-app',
        clientId: 'my-app-client'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: []
    })
  }

  public login(): Promise<void> {
    return this.keycloak.login()
  }

  public logout(): Promise<void> {
    return this.keycloak.logout(window.location.origin)
  }

  public async isLoggedIn(): Promise<boolean> {
    return Promise.resolve(await this.keycloak.isLoggedIn())
  }

  public getProfile(): Promise<KeycloakProfile> {
    return this.keycloak.loadUserProfile()
  }

  public getRoles(): string[] {
    return this.keycloak.getUserRoles()
  }
} 