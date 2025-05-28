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
import { LoggerModule } from 'nestjs-pino'

import { MessagesModule } from './messages/message.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserSyncInterceptor } from './user/user-sync.interceptor'
import { UserModule } from './user/user.module'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

const KEYCLOAK_AUTH_SERVER_URL =
  process.env.KEYCLOAK_AUTH_SERVER_URL ?? 'http://localhost:8080'

const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? 'ng-demo'

const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID ?? 'ng-demo-client'

const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET

if (KEYCLOAK_CLIENT_SECRET === undefined || KEYCLOAK_CLIENT_SECRET === '') {
  throw new Error(
    'KEYCLOAK_CLIENT_SECRET is required. Please set it in your .env file.',
  )
}

const KEYCLOAK_CONFIG = {
  authServerUrl: KEYCLOAK_AUTH_SERVER_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
  secret: KEYCLOAK_CLIENT_SECRET,
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        ...(isProduction
          ? {
              level: 'info',
            }
          : {
              transport: {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              },
            }),
      },
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
