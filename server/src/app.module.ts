import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GreetingsModule } from './greetings/greetings.module'
import * as dotenv from 'dotenv'
import { AuthGuard, PolicyEnforcementMode } from 'nest-keycloak-connect'
import { KeycloakConnectModule } from 'nest-keycloak-connect'
import { TokenValidation } from 'nest-keycloak-connect'
import { APP_GUARD } from '@nestjs/core'

dotenv.config({ path: '../.env' })

if (!process.env.KEYCLOAK_REALM || !process.env.KEYCLOAK_CLIENT_ID || !process.env.KEYCLOAK_CLIENT_SECRET) {
  throw new Error('Missing Keycloak configuration')
}
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        synchronize: configService.get('NODE_ENV') === 'development', // Disable in production
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
    }),
    GreetingsModule,
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
