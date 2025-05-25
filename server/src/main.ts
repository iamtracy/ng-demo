import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import chalk from 'chalk'

import { AppModule } from './app.module'
import { TransformInterceptor } from './interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT ?? 3000

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }))

  app.useGlobalInterceptors(new TransformInterceptor())

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

  await app.listen(port)

  const serverBanner = `
    ${chalk.cyan(`
      ____                           
      / ___|  ___ _ ____   _____ _ __ 
      \\___ \\ / _ \\ '__\\ \\ / / _ \\ '__|
      ___) |  __/ |   \\ V /  __/ |   
      |____/ \\___|_|    \\_/ \\___|_|   
    `)}
    ${chalk.green('========================================')}
    ${chalk.yellow('🚀 Server Status:')} ${chalk.green('Online')}
    ${chalk.yellow('🌍 Port:')} ${chalk.green(port)}
    ${chalk.yellow('🔥 Environment:')} ${chalk.green(process.env.NODE_ENV || 'development')}
    ${chalk.yellow('📚 API Docs:')} ${chalk.green(`http://localhost:${port}/api/docs`)}
    ${chalk.green('========================================')}
  `

  Logger.log(serverBanner)
}
bootstrap()
