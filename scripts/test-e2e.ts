import { execSync } from 'node:child_process'
import {
  COLORS,
  ENV,
  ensureDockerIsRunning,
  startDockerServices,
  createErrorHandler,
  showProductionBanner,
  showColorfulDockerLogs,
  startContinuousLogMonitoring,
} from './utils'

async function start(): Promise<void> {
  await ensureDockerIsRunning()
  await startDockerServices()

  showProductionBanner()
  console.log(`${COLORS.CUP_OF_TEA}[☕] Brewing production-grade tea and building Docker image...${COLORS.NC}`)

  let containerName: string | undefined
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
    
    if (containerName) {
      try {
        console.log(`${COLORS.SARCASM}[🧹] Stopping Docker container: ${containerName}${COLORS.NC}`)
        execSync(`docker stop ${containerName}`, { stdio: 'ignore' })
        execSync(`docker rm ${containerName}`, { stdio: 'ignore' })
      } catch {
        // Ignore cleanup errors
      }
    }
    process.exit(0)
  }

  // =============================================================================
  // DOCKER BUILD
  // =============================================================================
  try {
    console.log(`${COLORS.IMPROBABILITY}[🐳] Building Docker image for production...${COLORS.NC}`)
    
    const buildArgs = [
      `--build-arg API_URL=""`,
      `--build-arg KEYCLOAK_URL="${ENV.KEYCLOAK_AUTH_SERVER_URL}"`,
      `--build-arg KEYCLOAK_REALM="${ENV.KEYCLOAK_REALM}"`,
      `--build-arg KEYCLOAK_CLIENT_ID="${ENV.KEYCLOAK_CLIENT_ID}"`
    ].join(' ')
    
    execSync(`docker build ${buildArgs} -t ng-demo-e2e .`, {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    console.log(`${COLORS.IMPROBABILITY}[✅] Docker image build complete!${COLORS.NC}`)
  } catch (err) {
    exitWithError('DOCKER BUILD FAILED:', err as Error)
  }

  // =============================================================================
  // DOCKER RUN
  // =============================================================================
  try {
    console.log(`${COLORS.HYPERINTELLIGENT}[🚀] Starting Docker container...${COLORS.NC}`)
    
    containerName = `ng-demo-e2e-${Date.now()}`
    
    const isCI = process.env.GITHUB_ACTIONS === 'true'
    
    console.log(`${COLORS.CUP_OF_TEA}[🔧] Environment: ${isCI ? 'CI (GitHub Actions)' : 'Local Development'}${COLORS.NC}`)
    
    let dockerRunCmd: string
    if (isCI) {
      console.log(`${COLORS.HYPERINTELLIGENT}[🌐] Using CI networking configuration...${COLORS.NC}`)
      
      const containerDatabaseUrl = ENV.DATABASE_URL.replace('localhost', 'host.docker.internal')
      const containerKeycloakUrl = ENV.KEYCLOAK_AUTH_SERVER_URL.replace('localhost', 'host.docker.internal')
      
      dockerRunCmd = `docker run -d --name ${containerName} --add-host=host.docker.internal:host-gateway -p 3000:3000 -e DATABASE_URL="${containerDatabaseUrl}" -e KEYCLOAK_CLIENT_SECRET="${ENV.KEYCLOAK_CLIENT_SECRET}" -e KEYCLOAK_AUTH_SERVER_URL="${containerKeycloakUrl}" -e KEYCLOAK_REALM="${ENV.KEYCLOAK_REALM}" -e KEYCLOAK_CLIENT_ID="${ENV.KEYCLOAK_CLIENT_ID}" -e PORT=${ENV.PORT} -e NODE_ENV=production ng-demo-e2e`
      
      console.log(`${COLORS.CUP_OF_TEA}[📋] CI Docker command: ${dockerRunCmd}${COLORS.NC}`)
    } else {
      console.log(`${COLORS.HYPERINTELLIGENT}[🌐] Using local development networking configuration...${COLORS.NC}`)
      
      const containerDatabaseUrl = ENV.DATABASE_URL.replace('localhost', 'host.docker.internal')
      const containerKeycloakUrl = ENV.KEYCLOAK_AUTH_SERVER_URL
      
      dockerRunCmd = `docker run -d --name ${containerName} --add-host=localhost:host-gateway -p 3000:3000 -e DATABASE_URL="${containerDatabaseUrl}" -e KEYCLOAK_CLIENT_SECRET="${ENV.KEYCLOAK_CLIENT_SECRET}" -e KEYCLOAK_AUTH_SERVER_URL="${containerKeycloakUrl}" -e KEYCLOAK_REALM="${ENV.KEYCLOAK_REALM}" -e KEYCLOAK_CLIENT_ID="${ENV.KEYCLOAK_CLIENT_ID}" -e PORT=${ENV.PORT} -e NODE_ENV=production ng-demo-e2e`
      
      console.log(`${COLORS.CUP_OF_TEA}[📋] Local Docker command: ${dockerRunCmd}${COLORS.NC}`)
    }
    
    console.log(`${COLORS.IMPROBABILITY}[🐳] Starting Docker container with networking: ${isCI ? 'bridge+host.docker.internal' : 'bridge+host-gateway'}${COLORS.NC}`)
    
    execSync(dockerRunCmd, {
      stdio: 'inherit'
    })
    
    console.log(`${COLORS.HYPERINTELLIGENT}[✅] Docker container started: ${containerName}${COLORS.NC}`)
    
    console.log(`${COLORS.CUP_OF_TEA}[📋] Initial container logs:${COLORS.NC}`)
    if (containerName) {
      showColorfulDockerLogs(containerName, '🚀 CONTAINER STARTUP LOGS 🚀', 'HYPERINTELLIGENT', 30)
    }
  } catch (err) {
    exitWithError('DOCKER RUN FAILED:', err as Error)
  }

  // =============================================================================
  // WAIT FOR CONTAINER TO BE READY
  // =============================================================================
  console.log(`${COLORS.SARCASM}[⏳] Waiting for Docker container to finish calculating Pi...${COLORS.NC}`)
  
  let retries = 0
  const maxRetries = ENV.HEALTH_CHECK_MAX_RETRIES
  let containerReady = false
  
  console.log(`${COLORS.CUP_OF_TEA}[🔍] Checking container status...${COLORS.NC}`)
  while (retries < 10) {
    try {
      const result = execSync(`docker ps --filter "name=${containerName}" --filter "status=running" --format "{{.Names}}"`, { encoding: 'utf8' })
      if (result.trim() === containerName) {
        console.log(`${COLORS.HYPERINTELLIGENT}[✅] Container is running${COLORS.NC}`)
        break
      }
    } catch {
      // Container not running yet
    }
    
    retries++
    console.log(`${COLORS.SARCASM}[⌛] Waiting for container to start... (${retries}/10)${COLORS.NC}`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (retries >= 10) {
      console.log(`${COLORS.PANIC}[📋] Container failed to start. Logs:${COLORS.NC}`)
      if (containerName) {
        showColorfulDockerLogs(containerName, '🐳 DOCKER CONTAINER LOGS 🐳', 'HYPERINTELLIGENT')
      }
      exitWithError('CONTAINER START FAILED:', new Error('Container did not start within 10 seconds'))
    }
  }

  retries = 0
  console.log(`${COLORS.CUP_OF_TEA}[🔍] Waiting for application to be ready...${COLORS.NC}`)
  
  while (retries < maxRetries && !containerReady) {
    try {
      const containerStatus = execSync(`docker ps --filter "name=${containerName}" --filter "status=running" --format "{{.Status}}"`, { encoding: 'utf8' })
      if (!containerStatus.trim()) {
        console.log(`${COLORS.PANIC}[💥] Container stopped running! Logs:${COLORS.NC}`)
        if (containerName) {
          showColorfulDockerLogs(containerName, '💥 CONTAINER CRASH LOGS 💥', 'PANIC')
        }
        exitWithError('CONTAINER STOPPED:', new Error('Container stopped unexpectedly'))
      }
      
      try {
        execSync(`curl -f -s http://localhost:${ENV.PORT}/api/docs-json > /dev/null`, { stdio: 'ignore' })
        containerReady = true
        break
      } catch (curlError) {
        try {
          const response = execSync(`curl -s -w "%{http_code}" http://localhost:${ENV.PORT}/api/docs-json`, { encoding: 'utf8' })
          console.log(`${COLORS.SARCASM}[🔍] HTTP response: ${response}${COLORS.NC}`)
        } catch {
          console.log(`${COLORS.SARCASM}[🔍] No HTTP response (connection refused)${COLORS.NC}`)
        }
        
        if (retries % 3 === 0 && containerName) {
          console.log(`${COLORS.CUP_OF_TEA}[📋] Recent container logs (attempt ${retries}):${COLORS.NC}`)
          showColorfulDockerLogs(containerName, '🔍 HEALTH CHECK LOGS 🔍', 'CUP_OF_TEA', 15)
        }
      }
    } catch (error) {
      console.log(`${COLORS.SARCASM}[🔍] Health check error: ${(error as Error).message}${COLORS.NC}`)
    }
    
    retries++
    console.log(`${COLORS.SARCASM}[⌛] Still calculating... (${COLORS.TOWEL}${Math.round((retries / maxRetries) * 100)}%${COLORS.SARCASM} complete) - Attempt ${retries}/${maxRetries}${COLORS.NC}`)
    
    if (retries >= maxRetries) {
      console.error(`${COLORS.PANIC}[💥] Application failed to start after ${maxRetries} attempts${COLORS.NC}`)
      
      try {
        console.log(`${COLORS.PANIC}[📋] Container logs:${COLORS.NC}`)
        if (containerName) {
          showColorfulDockerLogs(containerName, '🔍 HEALTH CHECK FAILURE LOGS 🔍', 'SARCASM')
        }
      } catch {
        console.log(`${COLORS.PANIC}[❌] Could not retrieve container logs${COLORS.NC}`)
      }
      
      try {
        console.log(`${COLORS.PANIC}[🔍] Checking what's listening on port ${ENV.PORT}:${COLORS.NC}`)
        execSync(`netstat -tlnp | grep :${ENV.PORT} || lsof -i :${ENV.PORT} || echo "Nothing listening on port ${ENV.PORT}"`, { stdio: 'inherit' })
      } catch {
        console.log(`${COLORS.PANIC}[❌] Could not check port status${COLORS.NC}`)
      }
      
      exitWithError('CONTAINER HEALTH CHECK FAILED:', new Error(`Application not ready after ${maxRetries} attempts`))
    }
    
    await new Promise(resolve => setTimeout(resolve, ENV.HEALTH_CHECK_TIMEOUT))
  }
  
  console.log(`${COLORS.HYPERINTELLIGENT}[🎯] Docker container ready! Deep Thought has finished its calculations.${COLORS.NC}`)

  console.log(`${COLORS.TOWEL}[✨] Production Status: All Systems Go!${COLORS.NC}`)
  console.log(`${COLORS.HYPERINTELLIGENT}[🐳] Docker container: ${containerName}${COLORS.NC}`)
  console.log(`${COLORS.HYPERINTELLIGENT}[🌐] Production application available at: http://localhost:${ENV.PORT}${COLORS.NC}`)
  console.log(`${COLORS.HYPERINTELLIGENT}[📚] API Documentation: http://localhost:${ENV.PORT}/api/docs${COLORS.NC}`)
  console.log(`${COLORS.HYPERINTELLIGENT}[🔐] Keycloak Admin: ${ENV.KEYCLOAK_AUTH_SERVER_URL}${COLORS.NC}`)
  console.log(`${COLORS.SARCASM}[📡] Monitoring production transmissions...${COLORS.NC}`)
  console.log(`${COLORS.CUP_OF_TEA}[🧭] Press Ctrl+C to dematerialize gracefully${COLORS.NC}`)

  // =============================================================================
  // PRODUCTION TESTS
  // =============================================================================
  console.log(`${COLORS.CUP_OF_TEA}[🧪] Running Docker production tests...${COLORS.NC}`)
  try {
    execSync(`curl -s http://localhost:${ENV.PORT}/api/docs-json > /dev/null`, { stdio: 'ignore' })
    console.log(`${COLORS.HYPERINTELLIGENT}[✅] API documentation endpoint: OK${COLORS.NC}`)
    
    execSync(`curl -s http://localhost:${ENV.PORT}/ | grep -q "ng-demo"`, { stdio: 'ignore' })
    console.log(`${COLORS.HYPERINTELLIGENT}[✅] Static file serving: OK${COLORS.NC}`)
    
    execSync(`curl -s http://localhost:${ENV.PORT}/api/docs | grep -q "swagger"`, { stdio: 'ignore' })
    console.log(`${COLORS.HYPERINTELLIGENT}[✅] Swagger documentation: OK${COLORS.NC}`)
    
    console.log(`${COLORS.TOWEL}[🎉] Docker production tests passed! The Restaurant is open for business.${COLORS.NC}`)
  } catch (err) {
    console.log(`${COLORS.SARCASM}[⚠️] Some production tests failed, but the container is running: ${(err as Error).message}${COLORS.NC}`)
    
    try {
      console.log(`${COLORS.SARCASM}[📋] Recent container logs:${COLORS.NC}`)
      if (containerName) {
        showColorfulDockerLogs(containerName, '☕ PRODUCTION TEST LOGS ☕', 'CUP_OF_TEA', 20)
      }
    } catch {
      console.log(`${COLORS.PANIC}[❌] Could not retrieve container logs${COLORS.NC}`)
    }
  }

  // =============================================================================
  // CYPRESS E2E TESTS
  // =============================================================================
  console.log(`${COLORS.IMPROBABILITY}[🧪] Running Cypress E2E tests via Docker Compose...${COLORS.NC}`)
  
  console.log(`${COLORS.CUP_OF_TEA}[📋] Container logs before Cypress tests:${COLORS.NC}`)
  if (containerName) {
    showColorfulDockerLogs(containerName, '🧪 PRE-CYPRESS LOGS 🧪', 'IMPROBABILITY', 20)
  }
  
  console.log(`${COLORS.HYPERINTELLIGENT}
╔══════════════════════════════════════════════════════════════════════════╗
║                    🌌 CYPRESS DOCKER COMPOSE EXECUTION 🌌               ║
║                                                                          ║
║  "The ships hung in the sky in much the same way that bricks don't."    ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  🚀 Base URL:     ${'http://localhost:3000'.padEnd(45)} ║
║  🛸 API URL:      ${'http://localhost:3000'.padEnd(45)} ║
║  🔐 Keycloak URL: ${'http://localhost:8080 (frontend)'.padEnd(45)} ║
║  🔧 Backend Auth: ${'http://host.docker.internal:8080'.padEnd(45)} ║
║  🌍 Environment:  ${'production'.padEnd(45)} ║
║                                                                          ║
║  "Don't Panic" - The Hitchhiker's Guide to the Galaxy                   ║
╚══════════════════════════════════════════════════════════════════════════╝
${COLORS.NC}`)
  
  try {
    console.log(`${COLORS.CUP_OF_TEA}[🔍] Pre-flight check: Testing application accessibility...${COLORS.NC}`)
    execSync(`curl -f -s http://localhost:${ENV.PORT}/ > /dev/null`, { stdio: 'ignore' })
    console.log(`${COLORS.HYPERINTELLIGENT}[✅] Application is accessible for Cypress tests${COLORS.NC}`)
  } catch {
    console.log(`${COLORS.PANIC}[❌] Application not accessible - skipping Cypress tests${COLORS.NC}`)
    return
  }
  
  try {
    console.log(`${COLORS.IMPROBABILITY}[🐳] Starting Cypress container via Docker Compose...${COLORS.NC}`)
    
    const stopLogMonitoring = containerName ? startContinuousLogMonitoring(containerName) : () => {}
    
    try {
      execSync('docker compose --profile testing run --rm cypress', { 
        stdio: 'inherit',
        timeout: 180_000
      })
      
      console.log(`${COLORS.TOWEL}[🎉] Cypress E2E tests passed! All systems are go!${COLORS.NC}`)
    } finally {
      stopLogMonitoring()
    }
  } catch (err) {
    console.log(`${COLORS.PANIC}[💥] Cypress E2E tests failed: ${(err as Error).message}${COLORS.NC}`)
    
    console.log(`${COLORS.PANIC}[📋] Container logs during test failure:${COLORS.NC}`)
    if (containerName) {
      showColorfulDockerLogs(containerName, '💥 CYPRESS FAILURE LOGS 💥', 'PANIC', 50)
    }
    
    if (containerName) {
      try {
        console.log(`${COLORS.SARCASM}[🧹] Cleaning up Docker container: ${containerName}${COLORS.NC}`)
        execSync(`docker stop ${containerName}`, { stdio: 'ignore' })
        execSync(`docker rm ${containerName}`, { stdio: 'ignore' })
      } catch {
        // Ignore cleanup errors
      }
    }
    
    exitWithError('CYPRESS E2E TESTS FAILED:', err as Error)
  }

  process.on('SIGINT', cleanupHandler)
}

start().catch(err => {
  console.error(`${COLORS.PANIC}[FATAL ERROR] │ ${err.message}${COLORS.NC}`)
  process.exit(1)
})
 