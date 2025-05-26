import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router'
import { AuthGuardData, createAuthGuard } from 'keycloak-angular'

const isAdminAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { keycloak } = authData

  return keycloak.hasRealmRole('admin')
}

export const canActivateAdminRole = createAuthGuard<CanActivateFn>(isAdminAccessAllowed) 