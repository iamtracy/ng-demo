import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router'
import { AuthGuardData, createAuthGuard } from 'keycloak-angular'

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated } = authData

  if (authenticated) {
    return true
  }

  return false
}

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed)