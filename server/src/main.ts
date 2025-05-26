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
    .setTitle('Messages API')
    .setDescription('The messages API description')
    .setVersion('1.0')
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
  SwaggerModule.setup('api/docs', app, document)

  app
    .getHttpAdapter()
    .get('/api/docs-json', (_req, res: Response) => res.json(document))

  await app.listen(port)

  const serverBanner = `
    ${chalk.hex('#26A7DE')(`
      ____                           
      / ___|  ___ _ ____   _____ _ __ 
      \\___ \\ / _ \\ '__\\ \\ / / _ \\ '__|
      ___) |  __/ |   \\ V /  __/ |   
      |____/ \\___|_|    \\_/ \\___|_|   
    `)}
    ${chalk.hex('#26A7DE')('========================================')}
    ${chalk.hex('#FFD700')('🚀 Server Status:')} ${chalk.hex('#FFFFFF')('Online')}
    ${chalk.hex('#FFD700')('🌍 API Port:')} ${chalk.hex('#FFFFFF')(portStr)}
    ${chalk.hex('#FFD700')('🔥 Environment:')} ${chalk.hex('#FFFFFF')(process.env.NODE_ENV ?? 'development')}
    ${chalk.hex('#FFD700')('📚 API Docs:')} ${chalk.hex('#FFFFFF')(`http://localhost:${portStr}/api/docs`)}
    ${chalk.hex('#FFD700')('📄 Swagger JSON:')} ${chalk.hex('#FFFFFF')(`http://localhost:${portStr}/api/docs-json`)}
    ${chalk.hex('#26A7DE')('========================================')}
  `

  Logger.log(serverBanner)
}
