#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'

const log = (msg) => console.log(`[E2E-TEST] ${msg}`)

async function waitForService(url, name, maxAttempts = 30) {
  log(`Waiting for ${name} at ${url}...`)
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync(`curl -s -f ${url}`, { stdio: 'ignore' })
      log(`${name} is ready!`)
      return
    } catch {
      if (attempt === maxAttempts) {
        throw new Error(`${name} failed to start after ${maxAttempts} attempts`)
      }
      log(`${name} not ready, attempt ${attempt}/${maxAttempts}`)
      await wait(2000)
    }
  }
}

async function runE2ETests() {
  log('Starting e2e test setup...')
  
  try {
    // Start Docker services
    log('Starting Docker services...')
    execSync('docker compose up -d postgres keycloak', { stdio: 'inherit' })
    
    // Wait for PostgreSQL
    await wait(5000) // Give containers time to start
    try {
      execSync('timeout 60 bash -c \'until docker exec ng-demo-postgres pg_isready -U postgres; do sleep 2; done\'', { stdio: 'inherit' })
      log('PostgreSQL is ready!')
    } catch (error) {
      log('PostgreSQL check failed, but continuing...')
    }
    
    // Wait for Keycloak
    await waitForService('http://localhost:8080/health/ready', 'Keycloak', 40)
    
    // Setup database
    log('Setting up database...')
    execSync('npm run prisma:generate', { cwd: 'server', stdio: 'inherit' })
    execSync('npm run prisma:migrate', { cwd: 'server', stdio: 'inherit' })
    
    // Start server in background
    log('Starting server...')
    const serverProcess = spawn('npm', ['run', 'start:dev'], {
      cwd: 'server',
      stdio: 'pipe',
      env: {
        ...process.env,
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/ng_demo_db',
        NODE_ENV: 'development',
        KEYCLOAK_CLIENT_SECRET: 'ng-demo-secret',
        KEYCLOAK_AUTH_SERVER_URL: 'http://localhost:8080',
        KEYCLOAK_REALM: 'ng-demo',
        KEYCLOAK_CLIENT_ID: 'ng-demo-client'
      }
    })
    
    serverProcess.stdout.on('data', data => {
      process.stdout.write(`[SERVER] ${data}`)
    })
    
    serverProcess.stderr.on('data', data => {
      process.stderr.write(`[SERVER ERR] ${data}`)
    })
    
    // Wait for server
    await waitForService('http://localhost:3000/api/docs-json', 'Server', 20)
    
    // Start client in background
    log('Starting client...')
    const clientProcess = spawn('npm', ['start'], {
      cwd: 'client',
      stdio: 'pipe'
    })
    
    clientProcess.stdout.on('data', data => {
      process.stdout.write(`[CLIENT] ${data}`)
    })
    
    clientProcess.stderr.on('data', data => {
      process.stderr.write(`[CLIENT ERR] ${data}`)
    })
    
    // Wait for client
    await waitForService('http://localhost:4200', 'Client', 30)
    
    log('All services are ready!')
    log('You can now run Cypress tests with: cd client && npm run test:e2e')
    log('Or run headless tests with: cd client && npm run test:e2e:ci')
    log('Press Ctrl+C to stop all services')
    
    // Keep running until interrupted
    process.on('SIGINT', () => {
      log('Shutting down services...')
      
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGTERM')
      }
      
      if (clientProcess && !clientProcess.killed) {
        clientProcess.kill('SIGTERM')
      }
      
      try {
        execSync('docker compose down', { stdio: 'inherit' })
      } catch (error) {
        log(`Docker cleanup warning: ${error.message}`)
      }
      
      process.exit(0)
    })
    
    // Keep the process alive
    setInterval(() => {}, 1000)
    
  } catch (error) {
    log(`Setup failed: ${error.message}`)
    
    // Cleanup on error
    try {
      execSync('docker compose down', { stdio: 'inherit' })
    } catch {}
    
    process.exit(1)
  }
}

runE2ETests() 