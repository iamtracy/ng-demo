import {
  COLORS,
  runCommand,
  ensureDockerIsRunning,
  startDockerServices,
  waitForServer,
  createCleanupHandler,
  createErrorHandler,
  showDevelopmentBanner,
} from './utils.js'

async function start(): Promise<void> {
  await ensureDockerIsRunning()
  await startDockerServices()

  showDevelopmentBanner()
  console.log(`${COLORS.CUP_OF_TEA}[☕] Brewing digital tea and warming up servers...${COLORS.NC}`)

  let clientPid: number | undefined, serverPid: number | undefined, watcherPid: number | undefined
  const pids = [clientPid, serverPid, watcherPid]

  // Create shared handlers
  const exitWithError = createErrorHandler(pids)
  const cleanupHandler = createCleanupHandler(pids)

  // =============================================================================
  // CLIENT SETUP
  // =============================================================================
  try {
    await runCommand('npm', ['install'], { 
      cwd: 'client', 
      prefix: 'CLIENT', 
      prefixColor: 'IMPROBABILITY' 
    })
    
    runCommand('npm', ['run', 'start'], {
      cwd: 'client',
      prefix: 'CLIENT',
      prefixColor: 'IMPROBABILITY',
      capturePid: pid => (clientPid = pid),
    }).catch(err => exitWithError('CLIENT FAILED TO START:', err))
  } catch (err) {
    exitWithError('CLIENT INSTALLATION FAILED:', err as Error)
  }

  // =============================================================================
  // SERVER SETUP
  // =============================================================================
  try {
    await runCommand('npm', ['install', '--force'], { 
      cwd: 'server', 
      prefix: 'SERVER', 
      prefixColor: 'HYPERINTELLIGENT' 
    })
    
    await runCommand('npm', ['run', 'prisma:generate'], { 
      cwd: 'server', 
      prefix: 'SERVER', 
      prefixColor: 'HYPERINTELLIGENT' 
    })
    
    await runCommand('npm', ['run', 'prisma:migrate'], { 
      cwd: 'server', 
      prefix: 'SERVER', 
      prefixColor: 'HYPERINTELLIGENT' 
    })

    await runCommand('npm', ['run', 'seed'], { 
      cwd: 'server', 
      prefix: 'DEEP THOUGHT', 
      prefixColor: 'TOWEL' 
    })

    runCommand('npm', ['run', 'start'], {
      cwd: 'server',
      prefix: 'SERVER',
      prefixColor: 'HYPERINTELLIGENT',
      capturePid: pid => (serverPid = pid),
    }).catch(err => exitWithError('SERVER FAILED TO START:', err))
  } catch (err) {
    exitWithError('SERVER SETUP FAILED:', err as Error)
  }

  await waitForServer()

  // =============================================================================
  // API WATCHER SETUP
  // =============================================================================
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

  // Update pids array for cleanup
  pids[0] = clientPid
  pids[1] = serverPid
  pids[2] = watcherPid

  process.on('SIGINT', cleanupHandler)
}

start().catch(err => {
  console.error(`${COLORS.PANIC}[FATAL ERROR] │ ${err.message}${COLORS.NC}`)
  process.exit(1)
}) 