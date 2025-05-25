import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import chalk from 'chalk'
import { Logger } from '@nestjs/common'
import { TransformInterceptor } from './interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT ?? 3000

  // Apply global interceptor
  app.useGlobalInterceptors(new TransformInterceptor())

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
    ${chalk.green('========================================')}
  `

  Logger.log(serverBanner)
}
bootstrap()
