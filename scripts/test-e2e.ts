import { execSync } from 'node:child_process'
import {
  COLORS,
  ENV,
  ensureDockerIsRunning,
  createErrorHandler,
  showProductionBanner,
} from './utils'

async function start(): Promise<void> {
  await ensureDockerIsRunning()
  
  showProductionBanner()
  console.log(`${COLORS.CUP_OF_TEA}[☕] Starting E2E testing with Docker Compose...${COLORS.NC}`)

  const pids: (number | undefined)[] = []
  const exitWithError = createErrorHandler(pids)

  const cleanupHandler = () => {
    console.log(`\n${COLORS.HYPERINTELLIGENT}
    ╔════════════════════════════════════════╗
    ║    ✴️  Emergency Protocols Activated    ║
    ╠════════════════════════════════════════╣
    ║    🛬 Returning to Earth (or Magrathea)║
    ╚════════════════════════════════════════╝
${COLORS.NC}`)
    
    try {
      console.log(`${COLORS.SARCASM}[🧹] Cleaning up Docker Compose test environment...${COLORS.NC}`)
      execSync('npm run test:e2e:docker:clean', { stdio: 'inherit' })
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
    console.log(`${COLORS.HYPERINTELLIGENT}[🧹] Cleaning up any existing test environment...${COLORS.NC}`)
    try {
      execSync('npm run test:e2e:docker:clean', { stdio: 'inherit' })
    } catch {
      // Ignore if no existing services
    }

    // =============================================================================
    // DISPLAY TEST INFORMATION
    // =============================================================================
    console.log(`${COLORS.HYPERINTELLIGENT}
╔══════════════════════════════════════════════════════════════════════════╗
║                    🌌 CYPRESS DOCKER COMPOSE EXECUTION 🌌               ║
║                                                                          ║
║  "The ships hung in the sky in much the same way that bricks don't."    ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  🚀 Test Network:    ${'Docker Compose Isolated Network'.padEnd(45)} ║
║  🛸 App URL:         ${'http://app-test:3000 (internal)'.padEnd(45)} ║
║  🔐 Keycloak URL:    ${'http://keycloak-test:8080 (internal)'.padEnd(45)} ║
║  🌍 Environment:     ${`${process.env.NODE_ENV} (containerized)`.padEnd(45)} ║
║                                                                          ║
║  "Don't Panic" - The Hitchhiker's Guide to the Galaxy                   ║
╚══════════════════════════════════════════════════════════════════════════╝
${COLORS.NC}`)

    // =============================================================================
    // RUN DOCKER COMPOSE E2E TESTS
    // =============================================================================
    console.log(`${COLORS.IMPROBABILITY}[🐳] Running Docker Compose E2E test suite...${COLORS.NC}`)
    
    try {
      execSync('npm run test:e2e:docker', { 
        stdio: 'inherit',
        timeout: 600_000  // 10 minutes timeout
      })
      
      console.log(`${COLORS.TOWEL}[🎉] All E2E tests passed! All systems are go!${COLORS.NC}`)
      
      // Automatic cleanup on success
      console.log(`${COLORS.CUP_OF_TEA}[🧹] Cleaning up test environment...${COLORS.NC}`)
      execSync('npm run test:e2e:docker:clean', { stdio: 'inherit' })
      console.log(`${COLORS.HYPERINTELLIGENT}[✅] Test environment cleaned up successfully${COLORS.NC}`)

    } catch (err) {
      console.log(`${COLORS.PANIC}[💥] E2E tests failed: ${(err as Error).message}${COLORS.NC}`)
      
      try {
        console.log(`${COLORS.PANIC}[📋] Service logs during test failure:${COLORS.NC}`)
        execSync('npm run test:e2e:docker:logs', { stdio: 'inherit' })
      } catch {
        console.log(`${COLORS.PANIC}[❌] Could not retrieve service logs${COLORS.NC}`)
      }
      
      cleanupHandler()
      exitWithError('E2E TESTS FAILED:', err as Error)
    }

    console.log(`${COLORS.HYPERINTELLIGENT}
╔══════════════════════════════════════════════════════════════════════════╗
║                           🎉 MISSION ACCOMPLISHED 🎉                    ║
║                                                                          ║
║  All E2E tests have passed successfully!                                ║
║  The Heart of Gold is ready for production.                             ║
║                                                                          ║
║  "So long, and thanks for all the fish!"                                ║
╚══════════════════════════════════════════════════════════════════════════╝
${COLORS.NC}`)

  } catch (err) {
    cleanupHandler()
    exitWithError('E2E TEST EXECUTION FAILED:', err as Error)
  }
}

start().catch(err => {
  console.error(`${COLORS.PANIC}[FATAL ERROR] │ ${err.message}${COLORS.NC}`)
  process.exit(1)
})
 