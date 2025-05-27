#!/usr/bin/env node

import { spawn, execSync } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'
import readline from 'node:readline'

// Terminal colors
const COLORS = {
  IMPROBABILITY: '\x1b[38;5;57m',
  HYPERINTELLIGENT: '\x1b[38;5;135m',
  PANIC: '\x1b[1;91m',
  TOWEL: '\x1b[1;97m',
  CUP_OF_TEA: '\x1b[1;96m',
  SARCASM: '\x1b[1;90m',
  NC: '\x1b[0m',
}

const log = (color, prefix, msg) => {
  console.log(`${COLORS[color]}[${prefix}] │${COLORS.NC} ${msg}`)
}

function runCommand(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts })

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

    if (opts.capturePid) opts.capturePid(proc.pid)
  })
}

async function ensureDockerIsRunning() {
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

async function cleanupConflicts() {
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

async function waitForServer() {
  console.log(`${COLORS.SARCASM}[⏳] Waiting for server to finish calculating Pi...${COLORS.NC}`)
  while (true) {
    try {
      execSync('curl -s http://localhost:3000/api/docs-json', { stdio: 'ignore' })
      break
    } catch {
      console.log(`${COLORS.SARCASM}[⌛] Still calculating... (${COLORS.TOWEL}42%${COLORS.SARCASM} complete)${COLORS.NC}`)
      await wait(2000)
    }
  }
  console.log(`${COLORS.HYPERINTELLIGENT}[🎯] Server ready! Deep Thought has finished its calculations.${COLORS.NC}`)
}

async function start() {
  await ensureDockerIsRunning()

  console.log(`${COLORS.HYPERINTELLIGENT}[🔄] Resetting the infinite improbability drive...${COLORS.NC}`)
  execSync('docker compose down --remove-orphans', { stdio: 'inherit' })

  console.log(`${COLORS.HYPERINTELLIGENT}[🧹] Cleaning up containers...${COLORS.NC}`)
  execSync('docker container prune -f', { stdio: 'inherit' })

  await cleanupConflicts()

  console.log(`${COLORS.HYPERINTELLIGENT}[🚀] Engaging hyperspace bypass...${COLORS.NC}`)
  execSync('docker compose up -d', { stdio: 'inherit' })

  console.log(`${COLORS.IMPROBABILITY}
    ╔════════════════════════════════════════════════════════╗
    ║              GALACTIC DEV LAUNCH SYSTEM                ║
    ╠════════════════════════════════════════════════════════╣
    ║    🚀 Powered by Infinite Improbability Drive          ║
    ║    🪐 Consult your towel before launch                 ║
    ╚════════════════════════════════════════════════════════╝
${COLORS.TOWEL}                        🚨 DON'T PANIC 🚨${COLORS.NC}
`)

  console.log(`${COLORS.CUP_OF_TEA}[☕] Brewing digital tea and warming up servers...${COLORS.NC}`)

  let clientPid, serverPid, watcherPid

  // Helper function to cleanup and exit
  const exitWithError = (component, error) => {
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
    
    // Cleanup any running processes
    for (const pid of [clientPid, serverPid, watcherPid]) {
      if (pid) {
        try {
          process.kill(pid)
        } catch {}
      }
    }
    process.exit(1)
  }

  // CLIENT
  try {
    await runCommand('npm', ['install'], { cwd: 'client', prefix: 'CLIENT', prefixColor: 'IMPROBABILITY' })
    
    runCommand('npm', ['run', 'start'], {
      cwd: 'client',
      prefix: 'CLIENT',
      prefixColor: 'IMPROBABILITY',
      capturePid: pid => (clientPid = pid),
    }).catch(err => exitWithError('CLIENT FAILED TO START:', err))
  } catch (err) {
    exitWithError('CLIENT INSTALLATION FAILED:', err)
  }

  // SERVER
  try {
    await runCommand('npm', ['install', '--force'], { cwd: 'server', prefix: 'SERVER', prefixColor: 'HYPERINTELLIGENT' })
    await runCommand('npm', ['run', 'prisma:generate'], { cwd: 'server', prefix: 'SERVER', prefixColor: 'HYPERINTELLIGENT' })
    await runCommand('npm', ['run', 'prisma:migrate'], { cwd: 'server', prefix: 'SERVER', prefixColor: 'HYPERINTELLIGENT' })

    runCommand('npm', ['run', 'start:dev'], {
      cwd: 'server',
      prefix: 'SERVER',
      prefixColor: 'HYPERINTELLIGENT',
      capturePid: pid => (serverPid = pid),
    }).catch(err => exitWithError('SERVER FAILED TO START:', err))
  } catch (err) {
    exitWithError('SERVER SETUP FAILED:', err)
  }

  await waitForServer()

  runCommand('npm', ['run', 'watch-api'], {
    cwd: 'client',
    prefix: 'BABEL FISH',
    prefixColor: 'CUP_OF_TEA',
    capturePid: pid => (watcherPid = pid),
  }).catch(err => {
    console.warn(`${COLORS.SARCASM}[⚠️] API watcher failed, but continuing anyway: ${err.message}${COLORS.NC}`)
  })

  console.log(`${COLORS.TOWEL}[✨] Status: All Systems Go (unless the Vogons are involved)${COLORS.NC}`)
  console.log(`${COLORS.SARCASM}[📡] Monitoring transmissions from both ends of the improbability curve...${COLORS.NC}`)
  console.log(`${COLORS.CUP_OF_TEA}[🧭] Press Ctrl+C to dematerialize gracefully${COLORS.NC}`)

  process.on('SIGINT', () => {
    console.log(`\n${COLORS.HYPERINTELLIGENT}
    ╔════════════════════════════════════════╗
    ║    ✴️  Emergency Protocols Activated    ║
    ╠════════════════════════════════════════╣
    ║    🛬 Returning to Earth (or Magrathea)║
    ╚════════════════════════════════════════╝
${COLORS.NC}`)
    for (const pid of [clientPid, serverPid, watcherPid]) {
      if (pid) {
        try {
          process.kill(pid)
        } catch {}
      }
    }
    process.exit(0)
  })
}

start().catch(err => {
  console.error(`${COLORS.PANIC}[FATAL ERROR] │ ${err.message}${COLORS.NC}`)
  process.exit(1)
})
