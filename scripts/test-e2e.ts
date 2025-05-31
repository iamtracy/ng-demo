import { execSync } from 'node:child_process'
import {
  COLORS,
  ENV,
  ensureDockerIsRunning,
  createErrorHandler,
} from './utils'

async function start(): Promise<void> {
  await ensureDockerIsRunning()
  
  console.log(`${COLORS.INFO}[INFO] Starting E2E test suite with local Cypress${COLORS.NC}`)

  const pids: (number | undefined)[] = []
  const exitWithError = createErrorHandler(pids)

  const cleanupHandler = () => {
    console.log(`\n${COLORS.INFO}[INFO] Cleaning up test environment...${COLORS.NC}`)
    
    try {
      execSync('npm run test:e2e:clean', { stdio: 'inherit' })
    } catch {
      // Ignore cleanup errors
    }
    process.exit(0)
  }

  process.on('SIGINT', cleanupHandler)
  process.on('SIGTERM', cleanupHandler)

  try {
    // =============================================================================
    // CLEANUP EXISTING TEST ENVIRONMENT
    // =============================================================================
    console.log(`${COLORS.INFO}[INFO] Cleaning up existing test environment...${COLORS.NC}`)
    try {
      execSync('npm run test:e2e:clean', { stdio: 'inherit' })
    } catch {
      // Ignore if no existing services
    }

    // =============================================================================
    // START DOCKER SERVICES (WITHOUT CYPRESS)
    // =============================================================================
    console.log(`${COLORS.PRIMARY}[INFO] Starting Docker services (infrastructure + app)...${COLORS.NC}`)
    execSync('docker compose -f docker-compose.test.yml up -d app-test', { stdio: 'inherit' })

    // Wait for services to be healthy
    console.log(`${COLORS.INFO}[INFO] Waiting for services to be ready...${COLORS.NC}`)
    let retries = 0
    const maxRetries = 60
    
    while (retries < maxRetries) {
      try {
        try {
          const result = execSync('docker compose -f docker-compose.test.yml ps app-test --format json', { 
            stdio: 'pipe',
            encoding: 'utf8'
          })
          const container = JSON.parse(result.trim())
          if (container.Health === 'healthy') {
            break
          }
        } catch {
          execSync('docker compose -f docker-compose.test.yml ps app-test | grep "healthy"', { stdio: 'ignore' })
          break
        }
        throw new Error('Container not healthy yet')
      } catch {
        retries++
        if (retries % 6 === 0) { // Log every 30 seconds
          console.log(`${COLORS.INFO}[INFO] Services starting... ${Math.round((retries / maxRetries) * 100)}% (${retries * 5}s)${COLORS.NC}`)
        }
        
        if (retries >= maxRetries) {
          console.error(`${COLORS.ERROR}[ERROR] Services failed to start after ${maxRetries * 5} seconds${COLORS.NC}`)
          cleanupHandler()
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    console.log(`${COLORS.SUCCESS}[INFO] All services ready${COLORS.NC}`)

    // =============================================================================
    // DISPLAY TEST CONFIGURATION
    // =============================================================================
    console.log(`${COLORS.PRIMARY}[INFO] Test Configuration:${COLORS.NC}`)
    console.log(`${COLORS.INFO}       Environment: test${COLORS.NC}`)
    console.log(`${COLORS.INFO}       Database: PostgreSQL in Docker (localhost:5432)${COLORS.NC}`)
    console.log(`${COLORS.INFO}       Keycloak: In Docker (localhost:8080)${COLORS.NC}`)
    console.log(`${COLORS.INFO}       Server: In Docker (localhost:3000)${COLORS.NC}`)
    console.log(`${COLORS.INFO}       Cypress: Local execution${COLORS.NC}`)

    // =============================================================================
    // RUN CYPRESS TESTS LOCALLY
    // =============================================================================
    console.log(`${COLORS.PRIMARY}[INFO] Running Cypress E2E tests locally...${COLORS.NC}`)
    
    try {
      execSync('npm run cypress:run', { 
        stdio: 'inherit',
        timeout: 300_000,
        env: {
          ...process.env,
          CYPRESS_baseUrl: ENV.CYPRESS_BASE_URL,
          CYPRESS_keycloakUrl: ENV.CYPRESS_KEYCLOAK_URL,
        }
      })
      
      console.log(`${COLORS.SUCCESS}[SUCCESS] All E2E tests passed successfully${COLORS.NC}`)
      
    } catch (err) {
      console.log(`${COLORS.ERROR}[ERROR] E2E tests failed: ${(err as Error).message}${COLORS.NC}`)
      
      try {
        console.log(`${COLORS.INFO}[INFO] Retrieving service logs...${COLORS.NC}`)
        execSync('npm run test:e2e:logs', { stdio: 'inherit' })
      } catch {
        console.log(`${COLORS.ERROR}[ERROR] Could not retrieve service logs${COLORS.NC}`)
      }
      
      cleanupHandler()
      exitWithError('E2E TESTS FAILED:', err as Error)
    }

    // =============================================================================
    // CLEANUP
    // =============================================================================
    console.log(`${COLORS.INFO}[INFO] Cleaning up test environment...${COLORS.NC}`)
    execSync('npm run test:e2e:clean', { stdio: 'inherit' })
    console.log(`${COLORS.SUCCESS}[SUCCESS] Test environment cleaned up${COLORS.NC}`)

    console.log(`${COLORS.SUCCESS}[SUCCESS] E2E test suite completed successfully${COLORS.NC}`)

  } catch (err) {
    cleanupHandler()
    exitWithError('E2E TEST EXECUTION FAILED:', err as Error)
  }
}

start().catch(err => {
  console.error(`${COLORS.ERROR}[ERROR] Fatal error: ${err.message}${COLORS.NC}`)
  process.exit(1)
})
 