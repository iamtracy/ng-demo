import { spawn, execSync } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'
import readline from 'node:readline'
import { config } from 'dotenv'

config()

// =============================================================================
// 🎨 TYPES & INTERFACES
// =============================================================================

export interface Colors {
  IMPROBABILITY: string
  HYPERINTELLIGENT: string
  PANIC: string
  TOWEL: string
  CUP_OF_TEA: string
  SARCASM: string
  NC: string
}

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
  IMPROBABILITY: '\x1b[38;5;57m',
  HYPERINTELLIGENT: '\x1b[38;5;135m',
  PANIC: '\x1b[1;91m',
  TOWEL: '\x1b[1;97m',
  CUP_OF_TEA: '\x1b[1;96m',
  SARCASM: '\x1b[1;90m',
  NC: '\x1b[0m',
}

// =============================================================================
// 🔧 ENVIRONMENT CONFIGURATION
// =============================================================================

function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`${COLORS.PANIC}
    ╔═══════════════════════════════════════════════════════════╗
    ║                🚨 CONFIGURATION ERROR 🚨                  ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Missing required environment variable: ${name.padEnd(20)} ║
    ║                                                           ║
    ║  Please check your .env file and ensure all required      ║
    ║  variables are set.                                       ║
    ╚═══════════════════════════════════════════════════════════╝
${COLORS.NC}`)
    process.exit(1)
  }
  return value
}

function getEnvVar(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue
}

export const ENV = {
  PORT: getEnvVar('PORT', '3000'),
  CLIENT_PORT: getEnvVar('CLIENT_PORT', '4200'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  DATABASE_URL: getRequiredEnvVar('DATABASE_URL'),
  POSTGRES_USER: getEnvVar('POSTGRES_USER', 'postgres'),
  POSTGRES_PASSWORD: getEnvVar('POSTGRES_PASSWORD', 'postgres'),
  POSTGRES_DB: getEnvVar('POSTGRES_DB', 'ng_demo_db'),
  POSTGRES_PORT: getEnvVar('POSTGRES_PORT', '5432'),
  
  KEYCLOAK_AUTH_SERVER_URL: getEnvVar('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080'),
  KEYCLOAK_REALM: getEnvVar('KEYCLOAK_REALM', 'ng-demo'),
  KEYCLOAK_CLIENT_ID: getEnvVar('KEYCLOAK_CLIENT_ID', 'ng-demo-client'),
  KEYCLOAK_CLIENT_SECRET: getRequiredEnvVar('KEYCLOAK_CLIENT_SECRET'),
  KEYCLOAK_PORT: getEnvVar('KEYCLOAK_PORT', '8080'),
  KC_BOOTSTRAP_ADMIN_USERNAME: getEnvVar('KC_BOOTSTRAP_ADMIN_USERNAME', 'admin'),
  KC_BOOTSTRAP_ADMIN_PASSWORD: getEnvVar('KC_BOOTSTRAP_ADMIN_PASSWORD', 'admin'),
  
  KEYCLOAK_DB_NAME: getEnvVar('KEYCLOAK_DB_NAME', 'keycloak'),
  KEYCLOAK_DB_USER: getEnvVar('KEYCLOAK_DB_USER', 'keycloak'),
  KEYCLOAK_DB_PASSWORD: getEnvVar('KEYCLOAK_DB_PASSWORD', 'keycloak'),
  KEYCLOAK_DB_PORT: getEnvVar('KEYCLOAK_DB_PORT', '5433'),
  
  KC_LOG_LEVEL: getEnvVar('KC_LOG_LEVEL', 'INFO'),
  
  HEALTH_CHECK_TIMEOUT: parseInt(getEnvVar('HEALTH_CHECK_TIMEOUT', '2000')),
  HEALTH_CHECK_MAX_RETRIES: parseInt(getEnvVar('HEALTH_CHECK_MAX_RETRIES', '30')),
}

// =============================================================================
// 🛠️ UTILITY FUNCTIONS
// =============================================================================

export const log = (color: keyof Colors, prefix: string, msg: string): void => {
  console.log(`${COLORS[color]}[${prefix}] │${COLORS.NC} ${msg}`)
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
      log(opts.prefixColor || 'HYPERINTELLIGENT', opts.prefix || cmd, line)
    })

    readline.createInterface({ input: proc.stderr }).on('line', line => {
      log('PANIC', `${opts.prefix || cmd} ERR`, line)
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
    console.error(`${COLORS.PANIC}
    ╔═══════════════════════════════════════════════════════════╗
    ║     🚫 INFINITE IMPROBABILITY DRIVE MALFUNCTION           ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Please ensure Docker and Docker Compose v2 are running   ║
    ║  before attempting to traverse the galaxy.                ║
    ║                                                           ║
    ║  Error Code: 42                                           ║
    ╚═══════════════════════════════════════════════════════════╝
${COLORS.NC}`)
    process.exit(1)
  }
}

export async function cleanupConflicts(): Promise<void> {
  console.log(`${COLORS.HYPERINTELLIGENT}[🗑️] Checking for conflicting containers...${COLORS.NC}`)
  try {
    const containers = execSync('docker ps -a --format "{{.Names}}"', { encoding: 'utf8' })
    const targets = containers
      .split('\n')
      .filter(name => name.match(/(postgres|keycloak)/))
      .filter(Boolean)

    if (targets.length > 0) {
      console.log(`${COLORS.SARCASM}[⚠️] Removing: ${targets.join(', ')}${COLORS.NC}`)
      execSync(`docker rm -f ${targets.join(' ')}`, { stdio: 'inherit' })
    }
  } catch {
    // Ignore if nothing to remove
  }
}

export async function startDockerServices(): Promise<void> {
  console.log(`${COLORS.HYPERINTELLIGENT}[🔄] Resetting the infinite improbability drive...${COLORS.NC}`)
  execSync('docker compose down --remove-orphans', { stdio: 'inherit' })

  console.log(`${COLORS.HYPERINTELLIGENT}[🧹] Cleaning up containers...${COLORS.NC}`)
  execSync('docker container prune -f', { stdio: 'inherit' })

  await cleanupConflicts()

  console.log(`${COLORS.HYPERINTELLIGENT}[🚀] Engaging hyperspace bypass...${COLORS.NC}`)
  execSync('docker compose up -d', { stdio: 'inherit' })
}

// =============================================================================
// ⏳ SERVER UTILITIES
// =============================================================================

export async function waitForServer(): Promise<void> {
  const serverUrl = `http://localhost:${ENV.PORT}/api/docs-json`
  console.log(`${COLORS.SARCASM}[⏳] Waiting for server to finish initializing at ${serverUrl}...${COLORS.NC}`)
  
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
      console.log(`${COLORS.CUP_OF_TEA}[⌛] Server starting${dots} ${COLORS.TOWEL}${progress}%${COLORS.CUP_OF_TEA} ready${COLORS.NC}`)
      
      if (retries >= maxRetries) {
        console.error(`${COLORS.PANIC}[💥] Server failed to start after ${maxRetries} attempts${COLORS.NC}`)
        process.exit(1)
      }
      
      await wait(ENV.HEALTH_CHECK_TIMEOUT)
    }
  }
  console.log(`${COLORS.HYPERINTELLIGENT}[🎯] Server ready! Deep Thought has finished its calculations.${COLORS.NC}`)
}

// =============================================================================
// 🧹 CLEANUP UTILITIES
// =============================================================================

export function createCleanupHandler(pids: (number | undefined)[]): () => void {
  return () => {
    console.log(`\n${COLORS.HYPERINTELLIGENT}
    ╔════════════════════════════════════════╗
    ║    ✴️  Emergency Protocols Activated    ║
    ╠════════════════════════════════════════╣
    ║    🛬 Returning to Earth (or Magrathea)║
    ╚════════════════════════════════════════╝
${COLORS.NC}`)
    
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
    console.error(`${COLORS.PANIC}
    ╔═══════════════════════════════════════════════════════════╗
    ║                    🚨 LAUNCH FAILURE 🚨                   ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  ${component.padEnd(55)}                                  ║
    ║  ${error.message.slice(0, 55).padEnd(55)}                 ║
    ║                                                           ║
    ║  The Heart of Gold has suffered a critical malfunction.   ║
    ║  Please check the logs above for more details.            ║
    ╚═══════════════════════════════════════════════════════════╝
${COLORS.NC}`)
    
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
  console.log(`${COLORS.IMPROBABILITY}
    ╔════════════════════════════════════════════════════════╗
    ║              GALACTIC DEV LAUNCH SYSTEM                ║
    ╠════════════════════════════════════════════════════════╣
    ║    🚀 Powered by Infinite Improbability Drive          ║
    ║    🪐 Consult your towel before launch                 ║
    ╚════════════════════════════════════════════════════════╝
${COLORS.TOWEL}                        🚨 DON'T PANIC 🚨${COLORS.NC}
`)

  console.log(`${COLORS.CUP_OF_TEA}[🌍] Environment: ${ENV.NODE_ENV}${COLORS.NC}`)
  console.log(`${COLORS.CUP_OF_TEA}[🚀] Client Port: ${ENV.CLIENT_PORT}${COLORS.NC}`)
  console.log(`${COLORS.CUP_OF_TEA}[🌌] Server Port: ${ENV.PORT}${COLORS.NC}`)
  console.log(`${COLORS.CUP_OF_TEA}[🔐] Keycloak: ${ENV.KEYCLOAK_AUTH_SERVER_URL}${COLORS.NC}`)
}

export function showProductionBanner(): void {
  console.log(`${COLORS.IMPROBABILITY}
    ╔════════════════════════════════════════════════════════╗
    ║           GALACTIC PRODUCTION TEST SYSTEM              ║
    ╠════════════════════════════════════════════════════════╣
    ║    🏭 Powered by Production-Grade Improbability        ║
    ║    🪐 Testing the Restaurant at the End of the Universe║
    ╚════════════════════════════════════════════════════════╝
${COLORS.TOWEL}                        🚨 DON'T PANIC 🚨${COLORS.NC}
`)

  console.log(`${COLORS.CUP_OF_TEA}[🌍] Environment: ${ENV.NODE_ENV}${COLORS.NC}`)
  console.log(`${COLORS.CUP_OF_TEA}[🌌] Server Port: ${ENV.PORT}${COLORS.NC}`)
  console.log(`${COLORS.CUP_OF_TEA}[🔐] Keycloak: ${ENV.KEYCLOAK_AUTH_SERVER_URL}${COLORS.NC}`)
  console.log(`${COLORS.CUP_OF_TEA}[🗄️] Database: ${ENV.DATABASE_URL.replace(/\/\/.*@/, '//***:***@')}${COLORS.NC}`)
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
    console.log(`${COLORS[color]}
╔════════════════════════════════════════════════════════════════════════════╗
║                           ${title.padEnd(42)} ║
╚════════════════════════════════════════════════════════════════════════════╝
${COLORS.NC}`)
    
    const logs = execSync(`docker logs --tail ${lines} ${containerName}`, { encoding: 'utf8' })
    
    const coloredLogs = logs
      .split('\n')
      .map(line => {
        if (line.includes('ERROR') || line.includes('error')) {
          return `${COLORS.PANIC}${line}${COLORS.NC}`
        } else if (line.includes('WARN') || line.includes('warn')) {
          return `${COLORS.SARCASM}${line}${COLORS.NC}`
        } else if (line.includes('INFO') || line.includes('info')) {
          return `${COLORS.HYPERINTELLIGENT}${line}${COLORS.NC}`
        } else if (line.includes('DEBUG') || line.includes('debug')) {
          return `${COLORS.CUP_OF_TEA}${line}${COLORS.NC}`
        } else {
          return line
        }
      })
      .join('\n')
    
    console.log(coloredLogs)
    console.log(`${COLORS[color]}╚════════════════════════════════════════════════════════════════════════════╝${COLORS.NC}`)
  } catch (error) {
    console.log(`${COLORS.PANIC}[❌] Could not retrieve logs for container ${containerName}: ${(error as Error).message}${COLORS.NC}`)
  }
}

export function startContinuousLogMonitoring(containerName: string): () => void {
  console.log(`${COLORS.IMPROBABILITY}[📡] Starting continuous log monitoring for ${containerName}...${COLORS.NC}`)
  
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
            console.log(`${COLORS.PANIC}[${timestamp}] 🔴 ${line}${COLORS.NC}`)
          } else if (line.includes('WARN') || line.includes('warn')) {
            console.log(`${COLORS.SARCASM}[${timestamp}] 🟡 ${line}${COLORS.NC}`)
          } else if (line.includes('INFO') || line.includes('info')) {
            console.log(`${COLORS.HYPERINTELLIGENT}[${timestamp}] 🔵 ${line}${COLORS.NC}`)
          } else if (line.trim()) {
            console.log(`${COLORS.CUP_OF_TEA}[${timestamp}] 📝 ${line}${COLORS.NC}`)
          }
        })
      })
      
      logProcess.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(line => line.trim())
        lines.forEach(line => {
          const timestamp = new Date().toISOString().substring(11, 19)
          console.log(`${COLORS.PANIC}[${timestamp}] 🚨 ${line}${COLORS.NC}`)
        })
      })
      
      logProcess.on('close', (code: number) => {
        if (isMonitoring && code !== 0) {
          console.log(`${COLORS.SARCASM}[📡] Log monitoring process exited with code ${code}, restarting...${COLORS.NC}`)
          setTimeout(startMonitoring, 1000)
        }
      })
      
      logProcess.on('error', (error: Error) => {
        if (isMonitoring) {
          console.log(`${COLORS.SARCASM}[📡] Log monitoring error: ${error.message}, restarting...${COLORS.NC}`)
          setTimeout(startMonitoring, 1000)
        }
      })
    } catch (error) {
      if (isMonitoring) {
        console.log(`${COLORS.PANIC}[❌] Failed to start log monitoring: ${(error as Error).message}${COLORS.NC}`)
      }
    }
  }
  
  startMonitoring()
  
  return () => {
    isMonitoring = false
    if (logProcess) {
      try {
        logProcess.kill('SIGTERM')
        console.log(`${COLORS.IMPROBABILITY}[📡] Stopped continuous log monitoring${COLORS.NC}`)
      } catch {
        // Ignore cleanup errors
      }
    }
  }
} 