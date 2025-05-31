import { registerLocaleData } from '@angular/common'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import en from '@angular/common/locales/en'
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async' 
import { provideRouter } from '@angular/router'
import { 
  UserOutline, 
  CrownOutline, 
  LogoutOutline,
  PlusOutline,
  DeleteOutline,
  EditOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  CheckOutline,
  CloseOutline
} from '@ant-design/icons-angular/icons'
import {
  AutoRefreshTokenService,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular'
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n'
import { provideNzIcons } from 'ng-zorro-antd/icon'

import { environment } from '../environments/environment'

import { routes } from './app.routes'

registerLocaleData(en)

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: `${window.location.origin}/assets/silent-check-sso.html`,
        scope: 'openid profile email roles',
        pkceMethod: 'S256'
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
          urlPattern: /\/api/i,
          httpMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        }
      ]
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideNzI18n(en_US),
    provideNzIcons([
      UserOutline,
      CrownOutline,
      LogoutOutline,
      PlusOutline,
      DeleteOutline,
      EditOutline,
      CheckCircleOutline,
      CloseCircleOutline,
      CheckOutline,
      CloseOutline
    ]),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync()
  ]
}
