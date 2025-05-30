import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

import { Logger } from '@nestjs/common'

import {
  getWorkingDirectory,
  isProduction,
  isTest,
  isDevelopment,
} from './common.utils'

const logger = new Logger('DatabaseUtils')

function isPrismaClientGenerated(workingDir: string): boolean {
  const prismaClientPath = path.join(
    workingDir,
    'node_modules',
    '.prisma',
    'client',
  )
  return fs.existsSync(prismaClientPath)
}

function generatePrismaClient(workingDir: string): void {
  // Skip if already generated in development to prevent reload loops
  if (isDevelopment() && isPrismaClientGenerated(workingDir)) {
    logger.log('  ├─ ✅ Prisma client already exists')
    return
  }

  logger.log('  ├─ 🔧 Generating Prisma client...')
  execSync('npx prisma generate', {
    stdio: 'pipe',
    cwd: workingDir,
    env: process.env,
  })
  logger.log('  ├─ ✅ Prisma client ready')
}

function runDatabaseMigrations(workingDir: string): void {
  logger.log('  ├─ 📦 Running database migrations...')
  if (isProduction() || isTest()) {
    execSync('npx prisma migrate deploy', {
      stdio: 'pipe',
      cwd: workingDir,
      env: process.env,
    })
  } else {
    try {
      const status = execSync('npx prisma migrate status', {
        cwd: workingDir,
        env: process.env,
        encoding: 'utf8',
      })

      if (status.includes('Database schema is up to date')) {
        logger.log('  ├─ ✅ Database already up to date')
        return
      }
    } catch {
      // If status check fails, proceed with migration
    }

    execSync('npx prisma migrate dev', {
      stdio: 'pipe',
      cwd: workingDir,
      env: process.env,
    })
  }
  logger.log('  ├─ ✅ Migrations applied')
}

function seedDatabase(workingDir: string): void {
  if (!isProduction()) {
    logger.log('  ├─ 🌱 Seeding database...')
    execSync('npm run seed', {
      stdio: 'pipe',
      cwd: workingDir,
      env: process.env,
    })
    logger.log('  └─ ✅ Database seeded')
  } else {
    logger.log('  └─ ⏭️  Skipping seed (production mode)')
  }
}

export function initializeDatabase(): Promise<void> {
  const workingDir = getWorkingDirectory()

  try {
    logger.log('🗄️ Initializing database...')
    logger.log(`  📁 Working directory: ${workingDir}`)

    generatePrismaClient(workingDir)
    runDatabaseMigrations(workingDir)
    seedDatabase(workingDir)

    logger.log('🎉 Database ready!')
    return Promise.resolve()
  } catch (error) {
    logger.error('💥 Database initialization failed:', error)
    return Promise.reject(error as Error)
  }
}
