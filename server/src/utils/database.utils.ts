import { execSync } from 'child_process'

import { Logger } from '@nestjs/common'

import { getWorkingDirectory, isProduction, isTest } from './common.utils'

const logger = new Logger('DatabaseUtils')

function generatePrismaClient(workingDir: string): void {
  logger.log('🔧 Generating Prisma client...')
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: workingDir,
    env: process.env,
  })
  logger.log('✅ Prisma client generated')
}

function runDatabaseMigrations(workingDir: string): void {
  logger.log('📦 Running database migrations...')
  if (isProduction() || isTest()) {
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
}

function seedDatabase(workingDir: string): void {
  if (!isProduction()) {
    logger.log('🌱 Seeding database...')
    execSync('npm run seed', {
      stdio: 'inherit',
      cwd: workingDir,
      env: process.env,
    })
    logger.log('✅ Database seeded')
  }
}

export function initializeDatabase(): Promise<void> {
  const workingDir = getWorkingDirectory()

  try {
    logger.log('🗄️ Initializing database...')
    logger.log(`📁 Working directory: ${workingDir}`)

    generatePrismaClient(workingDir)
    runDatabaseMigrations(workingDir)
    seedDatabase(workingDir)

    logger.log('🎉 Database initialization successful!')
    return Promise.resolve()
  } catch (error) {
    logger.error('💥 Database initialization failed:', error)
    return Promise.reject(error as Error)
  }
}
