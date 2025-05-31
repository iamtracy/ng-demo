import { execSync } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'
import { 
  COLORS, 
  ENV,
  createErrorHandler,
} from './utils'
import { readFileSync } from 'node:fs'

const HOSTS_FILE = '/etc/hosts'
const HOSTS_MARKER_START = '# ng-demo-hosts-start'

function checkHostEntries(): boolean {
  try {
    const hostsContent = readFileSync(HOSTS_FILE, 'utf8')
    return hostsContent.includes(HOSTS_MARKER_START)
  } catch (error) {
    console.warn(`${COLORS.WARNING}[WARN] Cannot read hosts file: ${(error as Error).message}${COLORS.NC}`)
    return false
  }
}

function showHostSetupWarning(): void {
  console.log(`${COLORS.WARNING}⚠️  Host entries not found - this may cause JWT validation issues${COLORS.NC}`)
  console.log(`${COLORS.INFO}   To fix authentication issues, run: sudo npm run setup:hosts:add${COLORS.NC}`)
  console.log()
}

async function waitForHealthy(containerName: string, timeout: number, maxRetries: number): Promise<void> {
  console.log(`${COLORS.INFO}⏳ Waiting for ${containerName} to be healthy...${COLORS.NC}`)
  
  let retries = 0
  
  while (retries < maxRetries) {
    try {
      const result = execSync(`docker inspect ${containerName} --format="{{.State.Health.Status}}"`, { 
        stdio: 'pipe',
        encoding: 'utf8'
      }).trim()
      
      if (result === 'healthy') {
        console.log(`${COLORS.SUCCESS}✅ ${containerName} is healthy${COLORS.NC}`)
        return
      }
    } catch {
      // Container might not exist yet
    }
    
    retries++
    const progress = Math.round((retries / maxRetries) * 100)
    if (retries % 6 === 0) { // Log every 30 seconds
      console.log(`${COLORS.INFO}   ${containerName} starting... ${progress}% (${retries * 5}s)${COLORS.NC}`)
    }
    
    if (retries >= maxRetries) {
      throw new Error(`${containerName} failed to become healthy after ${maxRetries * 5} seconds`)
    }
    
    await wait(5000)
  }
}

async function start(): Promise<void> {
  console.log(`${COLORS.PRIMARY}🧪 Starting E2E Test Environment${COLORS.NC}`)
  console.log()

  // Check host entries
  if (!checkHostEntries()) {
    showHostSetupWarning()
  }

  const pids: (number | undefined)[] = []
  const exitWithError = createErrorHandler(pids)

  try {
    // Step 1: Start Docker services
    console.log(`${COLORS.INFO}🐳 Starting Docker services...${COLORS.NC}`)
    
    execSync('docker compose -f docker-compose.test.yml up -d', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        KEYCLOAK_CLIENT_SECRET: ENV.KEYCLOAK_CLIENT_SECRET
      }
    })

    // Step 2: Wait for services to be healthy
    console.log(`${COLORS.INFO}⏳ Waiting for services to be healthy...${COLORS.NC}`)
    await waitForHealthy('ng-demo-app-test', ENV.HEALTH_CHECK_TIMEOUT, ENV.HEALTH_CHECK_MAX_RETRIES)

    // Step 3: Run Cypress tests
    console.log()
    console.log(`${COLORS.PRIMARY}🔬 Running Cypress E2E Tests${COLORS.NC}`)
    console.log()

    execSync('npx cypress run', {
      stdio: 'inherit',
      env: {
        ...process.env,
        CYPRESS_baseUrl: ENV.CYPRESS_BASE_URL,
        CYPRESS_keycloakUrl: ENV.CYPRESS_KEYCLOAK_URL,
        KEYCLOAK_CLIENT_SECRET: ENV.KEYCLOAK_CLIENT_SECRET
      }
    })

    console.log()
    console.log(`${COLORS.SUCCESS}✅ E2E tests completed successfully!${COLORS.NC}`)

  } catch (error) {
    console.error(`${COLORS.ERROR}❌ E2E tests failed: ${(error as Error).message}${COLORS.NC}`)
    exitWithError('E2E Tests', error as Error)
  } finally {
    // Step 4: Cleanup
    console.log()
    console.log(`${COLORS.INFO}🧹 Cleaning up...${COLORS.NC}`)
    
    try {
      execSync('npm run test:e2e:clean', { stdio: 'inherit' })
    } catch (cleanupError) {
      console.warn(`${COLORS.WARNING}⚠️  Cleanup warning: ${(cleanupError as Error).message}${COLORS.NC}`)
    }
    
    console.log(`${COLORS.SUCCESS}✨ Cleanup completed${COLORS.NC}`)
  }
}

start().catch(err => {
  console.error(`${COLORS.ERROR}[ERROR] Fatal error: ${err.message}${COLORS.NC}`)
  process.exit(1)
})
 