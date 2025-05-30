import { getThemeSync } from '@intelika/swagger-theme'
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import chalk from 'chalk'
import * as dotenv from 'dotenv'
import { Response } from 'express'

import { AppModule } from './app.module'
import { initializeDatabase } from './utils'

dotenv.config()

void bootstrap()

function createSwaggerConfig(): ReturnType<DocumentBuilder['build']> {
  return new DocumentBuilder()
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
}

function setupSwagger(
  app: INestApplication,
  config: ReturnType<typeof createSwaggerConfig>,
): void {
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
}

function getRandomHitchhikerLog(): string {
  const logs = [
    'Computing ultimate answer... 42 milliseconds response time',
    'Babel fish translation services online... mostly harmless',
    'Heart of Gold improbability drive: 1 in 2^276,709 against',
    'Vogon poetry detector: No threatening verse detected',
    'Towel location services: Always know where your towel is',
    'Pan Galactic Gargle Blaster mixer: Preparing cosmic cocktails',
    'Infinite Improbability Drive: Making the impossible probable',
    'Restaurant at the End of the Universe: Reservations available',
    'Magrathea planet factory: Custom worlds built to order',
    'Slartibartfast fjord design studio: Award-winning coastlines',
    'Zaphod Beeblebrox ego monitor: Confidence levels at maximum',
    "Marvin the Paranoid Android: Life? Don't talk to me about life",
    'Guide entry compiler: 42 new entries added to database',
    'Hyperspace bypass construction: Demolition permits filed',
    'Milliways temporal stabilizer: Time is an illusion, lunchtime doubly so',
    'Arthur Dent confusion matrix: Probability of understanding = 0.001%',
    'Ford Prefect research mode: Investigating local drinking establishments',
    'Trillian logic processor: The only sane person in the galaxy online',
    'Golgafrinchan B-Ark passenger manifest: Telephone sanitizers aboard',
    'Bistromath navigation: Calculating restaurant bill complexity',
    "Somebody Else's Problem field generator: SEP field at 99.7% efficiency",
    'Total Perspective Vortex: Showing you your place in the universe',
    'Electronic Thumb: Hitchhiking probability calculator active',
    'Nutrimatic drink dispenser: Almost, but not quite, entirely unlike tea',
    'Sirius Cybernetics Corporation: Share and Enjoy! (Complaints Dept.)',
  ]
  return logs[Math.floor(Math.random() * logs.length)]
}

function createServerBanner(port: string): string {
  const clientPort = process.env.CLIENT_PORT ?? '4200'
  const nodeEnv = process.env.NODE_ENV ?? 'mostly harmless'

  return `
      ${chalk.hex('#FF0000')(`
    ╔════════════════════════════════════════════════════════════════════════════════════╗
    ║                                                                                    ║
    ║  ██████╗  ██████╗ ███╗   ██╗██╗████████╗    ██████╗  █████╗ ███╗   ██║██╗ ██████╗  ║
    ║  ██╔══██╗██╔═══██╗████╗  ██║╚═╝╚══██╔══╝    ██╔══██╗██╔══██╗████╗  ██║██║██╔════╝  ║
    ║  ██║  ██║██║   ██║██╔██╗ ██║       ██║       ██████╔╝███████║██╔██╗ ██║██║██║      ║
    ║  ██║  ██║██║   ██║██║╚██╗██║       ██║       ██╔═══╝ ██╔══██║██║╚██╗██║██║██║      ║
    ║  ██████╔╝╚██████╔╝██║ ╚████║       ██║       ██║     ██║  ██║██║ ╚████║██║╚██████╗ ║
    ║  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝       ╚═╝       ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝ ║
    ║                                                                                    ║
    ╚════════════════════════════════════════════════════════════════════════════════════╝
      `)}

    ${chalk.hex('#26A7DE')('════════════════════════ SYSTEM STATUS ═══════════════════════════════════════════════')}

    ${chalk.hex('#FFFFFF')('🐋 Universe Mode:       ')} ${chalk.hex('#FFD700')(nodeEnv)}
    ${nodeEnv !== 'production' ? chalk.hex('#FFD700')('🫖  Main Application:    ') + ' ' + chalk.hex('#FFFFFF')(`http://localhost:${clientPort}`) : ''}
    ${chalk.hex('#FFD700')('🌌 Space-Time Port:     ')} ${chalk.hex('#FFFFFF')(`http://localhost:${port}`)}
    ${chalk.hex('#FFD700')('📖 Guide Entry:         ')} ${chalk.hex('#FFFFFF')(`http://localhost:${port}/api/docs`)}
    ${chalk.hex('#FFD700')('🐬 Babel Fish JSON:     ')} ${chalk.hex('#FFFFFF')(`http://localhost:${port}/api/docs-json`)}

    ${chalk.hex('#26A7DE')('══════════════════════════════════════════════════════════════════════════════════════')}

    ${chalk.hex('#FFD700')('🤖 Deep Thought:        ')} ${chalk.hex('#FFFFFF')(getRandomHitchhikerLog())}

    ${chalk.hex('#26A7DE')('══════════════════════════════════════════════════════════════════════════════════════')}

    ${chalk.hex('#FFD700')('💡 Tip:')} ${chalk.hex('#FFFFFF')('The answer to life, the universe, and everything is 42!')}
    `
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

  const serverBanner = createServerBanner(port)

  await app.listen(Number(port))
  Logger.log(serverBanner)
}
