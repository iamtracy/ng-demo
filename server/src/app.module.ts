import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import * as dotenv from 'dotenv'
import { AuthGuard, PolicyEnforcementMode, TokenValidation, KeycloakConnectModule } from 'nest-keycloak-connect'
import { APP_GUARD } from '@nestjs/core'
import { MessagesModule } from './messages/message.module'

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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
