import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthGuard, PolicyEnforcementMode, TokenValidation, KeycloakConnectModule, RoleGuard, ResourceGuard } from 'nest-keycloak-connect'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MessagesModule } from './messages/message.module'
import { UserModule } from './user/user.module'
import { UserSyncInterceptor } from './user/user-sync.interceptor'

import * as dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const KEYCLOAK_CONFIG = {
  authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'my-app',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'my-app-client',
  secret: process.env.KEYCLOAK_CLIENT_SECRET,
}

if (!KEYCLOAK_CONFIG.secret) {
  throw new Error('Missing Keycloak client secret')
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KeycloakConnectModule.register({
      authServerUrl: KEYCLOAK_CONFIG.authServerUrl,
      realm: KEYCLOAK_CONFIG.realm,
      clientId: KEYCLOAK_CONFIG.clientId,
      secret: KEYCLOAK_CONFIG.secret,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.OFFLINE,
      bearerOnly: false,
      useNestLogger: true
    }),
    MessagesModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserSyncInterceptor,
    },
  ],
})
export class AppModule {}
