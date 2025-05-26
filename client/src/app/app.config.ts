import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import {
  AutoRefreshTokenService,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular'

import { routes } from './app.routes'
import { apiBaseUrlInterceptor } from './core/interceptors/api-base-url.interceptor'

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'http://localhost:8080',
        realm: 'my-app',
        clientId: 'my-app-client',
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256',
        scope: 'openid profile email roles'
      },
      features: [
        withAutoRefreshToken({
          onInactivityTimeout: 'logout',
          sessionTimeout: 60000
        }),
      ],
      providers: [AutoRefreshTokenService, UserActivityService]
    }),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        {
          urlPattern: /^\/api/i,
          httpMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        }
      ]
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, includeBearerTokenInterceptor]))
  ]
};
