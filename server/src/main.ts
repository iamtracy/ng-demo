import { getThemeSync } from '@intelika/swagger-theme'
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as dotenv from 'dotenv'
import { Response } from 'express'

import { AppModule } from './app.module'
import { initializeDatabase } from './utils'

dotenv.config()

void bootstrap()

function createSwaggerConfig(): ReturnType<DocumentBuilder['build']> {
  return new DocumentBuilder()
    .setTitle('NG Demo API')
    .setDescription('REST API for the NG Demo application')
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
}

function setupSwagger(
  app: INestApplication,
  config: ReturnType<typeof createSwaggerConfig>,
): void {
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document, {
    customCss: getThemeSync().toString(),
    customSiteTitle: 'NG Demo API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  app
    .getHttpAdapter()
    .get('/api/docs-json', (_req, res: Response) => res.json(document))
}

function logServerConfiguration(port: string): void {
  const logger = new Logger('Bootstrap')
  const clientPort = process.env.CLIENT_PORT ?? '4200'
  const nodeEnv = process.env.NODE_ENV ?? 'development'

  // Calculate proper spacing for 76-character width
  const boxWidth = 76
  const padLine = (content: string): string => {
    return content + ' '.repeat(boxWidth - content.length)
  }

  const envLine = padLine(`  Environment:     ${nodeEnv}`)
  const clientLine =
    nodeEnv !== 'production'
      ? `║${padLine(`  Client URL:      http://localhost:${clientPort}`)}║`
      : ''
  const serverLine = padLine(`  Server URL:      http://localhost:${port}`)
  const docsLine = padLine(
    `  API Docs:        http://localhost:${port}/api/docs`,
  )
  const schemaLine = padLine(
    `  API Schema:      http://localhost:${port}/api/docs-json`,
  )
  const statusLine = padLine(
    `                   🚀 Server is ready and accepting connections`,
  )

  const banner = `
╔════════════════════════════════════════════════════════════════════════════╗
║                              NG DEMO API                                   ║
╠════════════════════════════════════════════════════════════════════════════╣
║${envLine}║
${clientLine}
║${serverLine}║
║${docsLine}║
║${schemaLine}║
╠════════════════════════════════════════════════════════════════════════════╣
║${statusLine}║
╚════════════════════════════════════════════════════════════════════════════╝`

  logger.log(banner)
}

async function bootstrap(): Promise<void> {
  await initializeDatabase()

  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const port = process.env.PORT ?? '3000'

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
    }),
  )

  const config = createSwaggerConfig()
  setupSwagger(app, config)

  await app.listen(Number(port))
  logServerConfiguration(port)
}
