import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router'
import { AuthGuardData, createAuthGuard } from 'keycloak-angular'

const isAdminAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, keycloak } = authData

  if (!authenticated) {
    return false
  }

  const hasAdminRole = keycloak.hasRealmRole('admin')

  return hasAdminRole
}

export const canActivateAdminRole = createAuthGuard<CanActivateFn>(isAdminAccessAllowed) 