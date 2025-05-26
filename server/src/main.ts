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

  const serverBanner = `
      ${chalk.hex('#26A7DE')(`
         ____    ___   _   _ _ _____ 
        |  _ \\  / _ \\ | \\ | ( )_   _|
        | | | || | | ||  \\| |/  | |  
        | |_| || |_| || |\\  |   | |  
        |____/  \\___/ |_| \\_|   |_|  
         ____   _    _   _ ___ ____ 
        |  _ \\ / \\  | \\ | |_ _/ ___|
        | |_) / _ \\ |  \\| || | |    
        |  __/ ___ \\| |\\  || | |___ 
        |_|/_/   \\_\\_| \\_|___\\____|
      `)}
      ${chalk.hex('#26A7DE')('═══════════════════════ SYSTEM STATUS ══════════════════════════════════════════════')}
      ${chalk.hex('#FFD700')('🚀 Improbability Drive: ')} ${chalk.hex('#00FF00')('Engaged')}
      ${chalk.hex('#FFD700')('🐋 Infinite Universe:   ')} ${chalk.hex('#FFFFFF')(process.env.NODE_ENV ?? 'mostly harmless')}
      ${process.env.NODE_ENV !== 'production' ? chalk.hex('#FFD700')('🫖  Main Application:    ') + ' ' + chalk.hex('#FFFFFF')('http://localhost:4200') + chalk.hex('#FFD700')(' (Share & Enjoy™)') : ''}
      ${chalk.hex('#FFD700')('🌌 Space-Time Port:     ')} ${chalk.hex('#FFFFFF')(`http://localhost:${portStr}`)}
      ${chalk.hex('#FFD700')('📖 Guide Entry:         ')} ${chalk.hex('#FFFFFF')(`http://localhost:${portStr}/api/docs`)}
      ${chalk.hex('#FFD700')('🐬 Babel Fish JSON:     ')} ${chalk.hex('#FFFFFF')(`http://localhost:${portStr}/api/docs-json`)}
      ${chalk.hex('#26A7DE')('════════════════════════════════════════════════════════════════════════════════════')}
      ${chalk.hex('#FFD700')('🤖 Deep Thought:        ')} ${chalk.hex('#FFFFFF')('Computing ultimate answer... 42 milliseconds response time')}
      ${chalk.hex('#26A7DE')('════════════════════════════════════════════════════════════════════════════════════')}
      ${chalk.hex('#FFD700')('Note:')} ${chalk.hex('#FFFFFF')("In case of server panic, DON'T PANIC!")}
    `

  await app.listen(port)
  Logger.log(serverBanner)
}
