import { spawn, execSync } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'
import readline from 'node:readline'
import { config } from 'dotenv'
import { DOMAINS, type Colors } from './constants'

config()

// =============================================================================
// 🎨 TYPES & INTERFACES
// =============================================================================

export interface RunCommandOptions {
  cwd?: string
  prefix?: string
  prefixColor?: keyof Colors
  capturePid?: (pid: number) => void
  env?: NodeJS.ProcessEnv
}

// =============================================================================
// 🌈 COLOR CONSTANTS
// =============================================================================

export const COLORS: Colors = {
  PRIMARY: '\x1b[38;5;57m',
  SUCCESS: '\x1b[38;5;135m',
  ERROR: '\x1b[1;91m',
  WARNING: '\x1b[1;93m',
  INFO: '\x1b[1;96m',
  MUTED: '\x1b[1;90m',
  NC: '\x1b[0m',
}

// =============================================================================
// 🔧 ENVIRONMENT CONFIGURATION
// =============================================================================

function getEnvVar(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue
}

export const ENV = {
  PORT: getEnvVar('PORT', '3000'),
  CLIENT_PORT: getEnvVar('CLIENT_PORT', '4200'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  DATABASE_URL: getEnvVar('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/ng_demo_db?sslmode=no-verify'),
  POSTGRES_USER: getEnvVar('POSTGRES_USER', 'postgres'),
  POSTGRES_PASSWORD: getEnvVar('POSTGRES_PASSWORD', 'postgres'),
  POSTGRES_DB: getEnvVar('POSTGRES_DB', 'ng_demo_db'),
  POSTGRES_PORT: getEnvVar('POSTGRES_PORT', '5432'),
  
  KEYCLOAK_AUTH_SERVER_URL: getEnvVar('KEYCLOAK_AUTH_SERVER_URL', `http://${DOMAINS.KEYCLOAK}:8080`),
  KEYCLOAK_REALM: getEnvVar('KEYCLOAK_REALM', 'ng-demo'),
  KEYCLOAK_CLIENT_ID: getEnvVar('KEYCLOAK_CLIENT_ID', 'ng-demo-client'),
  KEYCLOAK_CLIENT_SECRET: getEnvVar('KEYCLOAK_CLIENT_SECRET', 'ng-demo-secret'),
  KEYCLOAK_PORT: getEnvVar('KEYCLOAK_PORT', '8080'),
  KC_BOOTSTRAP_ADMIN_USERNAME: getEnvVar('KC_BOOTSTRAP_ADMIN_USERNAME', 'admin'),
  KC_BOOTSTRAP_ADMIN_PASSWORD: getEnvVar('KC_BOOTSTRAP_ADMIN_PASSWORD', 'admin'),
  
  KEYCLOAK_DB_NAME: getEnvVar('KEYCLOAK_DB_NAME', 'keycloak'),
  KEYCLOAK_DB_USER: getEnvVar('KEYCLOAK_DB_USER', 'keycloak'),
  KEYCLOAK_DB_PASSWORD: getEnvVar('KEYCLOAK_DB_PASSWORD', 'keycloak'),
  KEYCLOAK_DB_PORT: getEnvVar('KEYCLOAK_DB_PORT', '5433'),
  
  KC_LOG_LEVEL: getEnvVar('KC_LOG_LEVEL', 'INFO'),
  
  HEALTH_CHECK_TIMEOUT: parseInt(getEnvVar('HEALTH_CHECK_TIMEOUT', '5000')),
  HEALTH_CHECK_MAX_RETRIES: parseInt(getEnvVar('HEALTH_CHECK_MAX_RETRIES', '60')),

  CYPRESS_BASE_URL: getEnvVar('CYPRESS_BASE_URL', `http://${DOMAINS.APP_SERVER}:3000`),
  CYPRESS_KEYCLOAK_URL: getEnvVar('CYPRESS_KEYCLOAK_URL', `http://${DOMAINS.KEYCLOAK}:8080`),
}

// =============================================================================
// 🛠️ UTILITY FUNCTIONS
// =============================================================================

export const log = (color: keyof Colors, prefix: string, msg: string): void => {
  console.log(`${COLORS[color]}[${prefix}] ${msg}${COLORS.NC}`)
}

export function runCommand(
  cmd: string, 
  args: string[] = [], 
  opts: RunCommandOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts })

    if (proc.pid && opts.capturePid) {
      opts.capturePid(proc.pid)
    }

    readline.createInterface({ input: proc.stdout }).on('line', line => {
      log(opts.prefixColor || 'SUCCESS', opts.prefix || cmd, line)
    })

    readline.createInterface({ input: proc.stderr }).on('line', line => {
      log('ERROR', `${opts.prefix || cmd} ERR`, line)
    })

    proc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} exited with code ${code}`))
    })
  })
}

// =============================================================================
// 🐳 DOCKER UTILITIES
// =============================================================================

export async function ensureDockerIsRunning(): Promise<void> {
  try {
    execSync('docker info', { stdio: 'ignore' })
    execSync('docker compose version', { stdio: 'ignore' })
  } catch {
    console.error(`${COLORS.ERROR}[ERROR] Docker is not running. Please ensure Docker and Docker Compose v2 are installed and running.${COLORS.NC}`)
    process.exit(1)
  }
}

export async function cleanupConflicts(): Promise<void> {
  console.log(`${COLORS.INFO}[INFO] Checking for conflicting containers...${COLORS.NC}`)
  try {
    const containers = execSync('docker ps -a --format "{{.Names}}"', { encoding: 'utf8' })
    const targets = containers
      .split('\n')
      .filter(name => name.match(/(postgres|keycloak)/))
      .filter(Boolean)

    if (targets.length > 0) {
      console.log(`${COLORS.WARNING}[WARN] Removing conflicting containers: ${targets.join(', ')}${COLORS.NC}`)
      execSync(`docker rm -f ${targets.join(' ')}`, { stdio: 'inherit' })
    }
  } catch {
    // Ignore if nothing to remove
  }
}

export async function startDockerServices(): Promise<void> {
  console.log(`${COLORS.INFO}[INFO] Stopping existing Docker services...${COLORS.NC}`)
  execSync('docker compose down --remove-orphans', { stdio: 'inherit' })

  console.log(`${COLORS.INFO}[INFO] Cleaning up containers...${COLORS.NC}`)
  execSync('docker container prune -f', { stdio: 'inherit' })

  await cleanupConflicts()

  console.log(`${COLORS.SUCCESS}[INFO] Starting Docker services...${COLORS.NC}`)
  execSync('docker compose up -d', { stdio: 'inherit' })
}

// =============================================================================
// ⏳ SERVER UTILITIES
// =============================================================================

export async function waitForServer(): Promise<void> {
  const serverUrl = `http://localhost:${ENV.PORT}/api/docs-json`
  console.log(`${COLORS.INFO}[INFO] Waiting for server to initialize at ${serverUrl}...${COLORS.NC}`)
  
  let retries = 0
  const maxRetries = ENV.HEALTH_CHECK_MAX_RETRIES
  
  while (retries < maxRetries) {
    try {
      execSync(`curl -s ${serverUrl}`, { stdio: 'ignore' })
      break
    } catch {
      retries++
      const progress = Math.round((retries / maxRetries) * 100)
      const dots = '.'.repeat((retries % 4) + 1)
      console.log(`${COLORS.INFO}[INFO] Server starting${dots} ${progress}% ready${COLORS.NC}`)
      
      if (retries >= maxRetries) {
        console.error(`${COLORS.ERROR}[ERROR] Server failed to start after ${maxRetries} attempts${COLORS.NC}`)
        process.exit(1)
      }
      
      await wait(ENV.HEALTH_CHECK_TIMEOUT)
    }
  }
  console.log(`${COLORS.SUCCESS}[SUCCESS] Server is ready and responding${COLORS.NC}`)
}

// =============================================================================
// 🧹 CLEANUP UTILITIES
// =============================================================================

export function createCleanupHandler(pids: (number | undefined)[]): () => void {
  return () => {
    console.log(`\n${COLORS.INFO}[INFO] Cleaning up processes...${COLORS.NC}`)
    
    for (const pid of pids) {
      if (pid) {
        try {
          process.kill(pid)
        } catch {}
      }
    }
    process.exit(0)
  }
}

export function createErrorHandler(pids: (number | undefined)[]): (component: string, error: Error) => void {
  return (component: string, error: Error): void => {
    console.error(`${COLORS.ERROR}[ERROR] ${component}: ${error.message}${COLORS.NC}`)
    console.error(`${COLORS.ERROR}        Please check the logs above for more details.${COLORS.NC}`)
    
    for (const pid of pids) {
      if (pid) {
        try {
          process.kill(pid)
        } catch {}
      }
    }
    process.exit(1)
  }
}

// =============================================================================
// 🌌 BANNER UTILITIES
// =============================================================================

export function showDevelopmentBanner(): void {
  console.log(`${COLORS.PRIMARY}[INFO] Development Environment${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Environment: ${ENV.NODE_ENV}${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Client Port: ${ENV.CLIENT_PORT}${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Server Port: ${ENV.PORT}${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Keycloak URL: ${ENV.KEYCLOAK_AUTH_SERVER_URL}${COLORS.NC}`)
}

export function showProductionBanner(): void {
  console.log(`${COLORS.PRIMARY}[INFO] Production Test Environment${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Environment: ${ENV.NODE_ENV}${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Server Port: ${ENV.PORT}${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Keycloak URL: ${ENV.KEYCLOAK_AUTH_SERVER_URL}${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Database: ${ENV.DATABASE_URL.replace(/\/\/.*@/, '//***:***@')}${COLORS.NC}`)
}

// =============================================================================
// 🔧 ENVIRONMENT UTILITIES
// =============================================================================

export function getProductionEnvironment(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: 'production',
    PORT: ENV.PORT,
    DATABASE_URL: ENV.DATABASE_URL,
    KEYCLOAK_CLIENT_SECRET: ENV.KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_AUTH_SERVER_URL: ENV.KEYCLOAK_AUTH_SERVER_URL,
    KEYCLOAK_REALM: ENV.KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID: ENV.KEYCLOAK_CLIENT_ID,
  }
}

export function getDevelopmentEnvironment(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: ENV.NODE_ENV,
    PORT: ENV.PORT,
    CLIENT_PORT: ENV.CLIENT_PORT,
    DATABASE_URL: ENV.DATABASE_URL,
    KEYCLOAK_CLIENT_SECRET: ENV.KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_AUTH_SERVER_URL: ENV.KEYCLOAK_AUTH_SERVER_URL,
    KEYCLOAK_REALM: ENV.KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID: ENV.KEYCLOAK_CLIENT_ID,
  }
}

// =============================================================================
// 🐳 DOCKER LOG UTILITIES
// =============================================================================

export function showColorfulDockerLogs(
  containerName: string,
  title: string,
  color: keyof typeof COLORS,
  lines: number = 50
): void {
  try {
    console.log(`${COLORS[color]}[LOGS] ${title}${COLORS.NC}`)
    
    const logs = execSync(`docker logs --tail ${lines} ${containerName}`, { encoding: 'utf8' })
    
    const coloredLogs = logs
      .split('\n')
      .map(line => {
        if (line.includes('ERROR') || line.includes('error')) {
          return `${COLORS.ERROR}${line}${COLORS.NC}`
        } else if (line.includes('WARN') || line.includes('warn')) {
          return `${COLORS.WARNING}${line}${COLORS.NC}`
        } else if (line.includes('INFO') || line.includes('info')) {
          return `${COLORS.SUCCESS}${line}${COLORS.NC}`
        } else if (line.includes('DEBUG') || line.includes('debug')) {
          return `${COLORS.MUTED}${line}${COLORS.NC}`
        } else {
          return line
        }
      })
      .join('\n')
    
    console.log(coloredLogs)
  } catch (error) {
    console.log(`${COLORS.ERROR}[ERROR] Could not retrieve logs for container ${containerName}: ${(error as Error).message}${COLORS.NC}`)
  }
}

export function startContinuousLogMonitoring(containerName: string): () => void {
  console.log(`${COLORS.INFO}[INFO] Starting log monitoring for ${containerName}...${COLORS.NC}`)
  
  let isMonitoring = true
  let logProcess: any
  
  const startMonitoring = () => {
    try {
      logProcess = spawn('docker', ['logs', '-f', '--tail', '10', containerName], {
        stdio: ['ignore', 'pipe', 'pipe']
      })
      
      logProcess.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(line => line.trim())
        lines.forEach(line => {
          const timestamp = new Date().toISOString().substring(11, 19)
          if (line.includes('ERROR') || line.includes('error')) {
            console.log(`${COLORS.ERROR}[${timestamp}] ERROR: ${line}${COLORS.NC}`)
          } else if (line.includes('WARN') || line.includes('warn')) {
            console.log(`${COLORS.WARNING}[${timestamp}] WARN: ${line}${COLORS.NC}`)
          } else if (line.includes('INFO') || line.includes('info')) {
            console.log(`${COLORS.SUCCESS}[${timestamp}] INFO: ${line}${COLORS.NC}`)
          } else if (line.trim()) {
            console.log(`${COLORS.INFO}[${timestamp}] ${line}${COLORS.NC}`)
          }
        })
      })
      
      logProcess.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(line => line.trim())
        lines.forEach(line => {
          const timestamp = new Date().toISOString().substring(11, 19)
          console.log(`${COLORS.ERROR}[${timestamp}] ERROR: ${line}${COLORS.NC}`)
        })
      })
      
      logProcess.on('close', (code: number) => {
        if (isMonitoring && code !== 0) {
          console.log(`${COLORS.INFO}[INFO] Log monitoring process exited, restarting...${COLORS.NC}`)
          setTimeout(startMonitoring, 1000)
        }
      })
      
      logProcess.on('error', (error: Error) => {
        if (isMonitoring) {
          console.log(`${COLORS.ERROR}[ERROR] Log monitoring error: ${error.message}, restarting...${COLORS.NC}`)
          setTimeout(startMonitoring, 1000)
        }
      })
    } catch (error) {
      if (isMonitoring) {
        console.log(`${COLORS.ERROR}[ERROR] Failed to start log monitoring: ${(error as Error).message}${COLORS.NC}`)
      }
    }
  }
  
  startMonitoring()
  
  return () => {
    isMonitoring = false
    if (logProcess) {
      try {
        logProcess.kill('SIGTERM')
        console.log(`${COLORS.INFO}[INFO] Stopped log monitoring${COLORS.NC}`)
      } catch {
        // Ignore cleanup errors
      }
    }
  }
} 