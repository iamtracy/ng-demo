import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'
import { KeycloakService } from 'keycloak-angular'

import { routes } from './app.routes';

function initializeKeycloak(keycloak: KeycloakService) {
  
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'my-app',
        clientId: 'my-app-client'
      },
      initOptions: {
        onLoad: 'login-required',
        token: '123',
        checkLoginIframe: false
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: []
    })
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ]
};
