import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router'
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected readonly keycloak: KeycloakService,
    protected override readonly router: Router
  ) {
    super(router, keycloak)
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url
      })
      return false
    }

    const requiredRoles = route.data['roles']

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    return requiredRoles.every((role: string) => this.roles.includes(role))
  }
} 