import { join } from 'path'

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import * as dotenv from 'dotenv'
import {
  AuthGuard,
  KeycloakConnectModule,
  PolicyEnforcementMode,
  ResourceGuard,
  RoleGuard,
  TokenValidation,
} from 'nest-keycloak-connect'

import { MessagesModule } from './messages/message.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserSyncInterceptor } from './user/user-sync.interceptor'
import { UserModule } from './user/user.module'

dotenv.config({ path: '../.env' })

const isProduction = process.env.NODE_ENV === 'production'
const KEYCLOAK_CONFIG = {
  authServerUrl:
    process.env.KEYCLOAK_AUTH_SERVER_URL ?? 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM ?? 'ng-demo',
  clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'ng-demo-client',
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
      useNestLogger: true,
    }),
    ...(isProduction
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'public', 'browser'),
            exclude: ['/api/*'],
          }),
        ]
      : []),
    MessagesModule,
    UserModule,
    PrismaModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: UserSyncInterceptor,
    },
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
  ],
})
export class AppModule {}
