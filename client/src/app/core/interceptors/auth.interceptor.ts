import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { KeycloakService } from 'keycloak-angular'
import { from, switchMap } from 'rxjs'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService)
  console.log('Request URL:', req.url)

  // Skip token for Keycloak server and asset requests
  if (req.url.includes('/assets') || req.url.startsWith('http://localhost:8080')) {
    console.log('Skipping auth for:', req.url)
    return next(req)
  }

  return from(keycloak.getToken()).pipe(
    switchMap(token => {
      console.log('Adding token for:', req.url)
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
      return next(authReq)
    })
  )
} 