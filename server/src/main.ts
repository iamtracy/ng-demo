import { getThemeSync } from '@intelika/swagger-theme'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import chalk from 'chalk'
import { Response } from 'express'

import { AppModule } from './app.module'

void bootstrap()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT ?? 3000
  const portStr = String(port)

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle("The Hitchhiker's Guide to the Galaxy API")
    .setDescription('A mostly harmless API for intergalactic message sharing')
    .setVersion('42.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document, {
    customCss: getThemeSync().toString(),
    customSiteTitle: "The Guide API - Don't Panic!",
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  app
    .getHttpAdapter()
    .get('/api/docs-json', (_req, res: Response) => res.json(document))

  const serverBanner = `
      ${chalk.hex('#FF0000')(`
    ╔════════════════════════════════════════════════════════════════════════════════════╗
    ║                                                                                    ║
    ║  ██████╗  ██████╗ ███╗   ██╗██╗████████╗    ██████╗  █████╗ ███╗   ██╗██╗ ██████╗  ║
    ║  ██╔══██╗██╔═══██╗████╗  ██║╚═╝╚══██╔══╝    ██╔══██╗██╔══██╗████╗  ██║██║██╔════╝  ║
    ║  ██║  ██║██║   ██║██╔██╗ ██║       ██║       ██████╔╝███████║██╔██╗ ██║██║██║      ║
    ║  ██║  ██║██║   ██║██║╚██╗██║       ██║       ██╔═══╝ ██╔══██║██║╚██╗██║██║██║      ║
    ║  ██████╔╝╚██████╔╝██║ ╚████║       ██║       ██║     ██║  ██║██║ ╚████║██║╚██████╗ ║
    ║  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝       ╚═╝       ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝ ║
    ║                                                                                    ║
    ╚════════════════════════════════════════════════════════════════════════════════════╝
      `)}
    ${chalk.hex('#26A7DE')('════════════════════════ SYSTEM STATUS ═══════════════════════════════════════════════')}
    ${chalk.hex('#FFFFFF')('🐋 Universe Mode:       ')} ${chalk.hex('#FFD700')(process.env.NODE_ENV ?? 'mostly harmless')}
    ${process.env.NODE_ENV !== 'production' ? chalk.hex('#FFD700')('🫖  Main Application:    ') + ' ' + chalk.hex('#FFFFFF')('http://localhost:4200') + chalk.hex('#FFD700')(' (Share & Enjoy™)') : ''}
    ${chalk.hex('#FFD700')('🌌 Space-Time Port:     ')} ${chalk.hex('#FFFFFF')(`http://localhost:${portStr}`)}
    ${chalk.hex('#FFD700')('📖 Guide Entry:         ')} ${chalk.hex('#FFFFFF')(`http://localhost:${portStr}/api/docs`)}
    ${chalk.hex('#FFD700')('🐬 Babel Fish JSON:     ')} ${chalk.hex('#FFFFFF')(`http://localhost:${portStr}/api/docs-json`)}
    ${chalk.hex('#26A7DE')('══════════════════════════════════════════════════════════════════════════════════════')}
    ${chalk.hex('#FFD700')('🤖 Deep Thought:        ')} ${chalk.hex('#FFFFFF')('Computing ultimate answer... 42 milliseconds response time')}
    ${chalk.hex('#26A7DE')('══════════════════════════════════════════════════════════════════════════════════════')}
    ${chalk.hex('#FFD700')('💡 Tip:')} ${chalk.hex('#FFFFFF')('The answer to life, the universe, and everything is 42!')}
    `

  await app.listen(port)
  Logger.log(serverBanner)
}
