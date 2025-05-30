import { execSync } from 'child_process'
import * as path from 'path'

import { Logger } from '@nestjs/common'
const logger = new Logger('DatabaseUtils')

export function initializeDatabase(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production'
  const isTest = process.env.NODE_ENV === 'test'

  const workingDir =
    isProduction || isTest ? '/app' : path.resolve(__dirname, '../../../')

  try {
    logger.log('🗄️ Initializing database...')
    logger.log(`📁 Working directory: ${workingDir}`)
    logger.log('📦 Running database migrations...')

    if (isProduction || isTest) {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        cwd: workingDir,
        env: process.env,
      })
    } else {
      execSync('npx prisma migrate dev', {
        stdio: 'inherit',
        cwd: workingDir,
        env: process.env,
      })
    }
    logger.log('✅ Database migrations completed')
    logger.log('🎉 Database initialization successful!')
    return Promise.resolve()
  } catch (error) {
    logger.error('💥 Database initialization failed:', error)
    return Promise.reject(error as Error)
  }
}
