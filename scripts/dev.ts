import {
  COLORS,
  runCommand,
  ensureDockerIsRunning,
  startDockerServices,
  waitForServer,
  createCleanupHandler,
  createErrorHandler,
  showDevelopmentBanner,
} from './utils'

async function start(): Promise<void> {
  await ensureDockerIsRunning()
  await startDockerServices()

  showDevelopmentBanner()
  console.log(`${COLORS.CUP_OF_TEA}[☕] Brewing digital tea and warming up servers...${COLORS.NC}`)

  let clientPid: number | undefined, serverPid: number | undefined, watcherPid: number | undefined
  const pids: (number | undefined)[] = [clientPid, serverPid, watcherPid]

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
  } catch (err) {
    exitWithError('CLIENT INSTALLATION FAILED:', err as Error)
  }

  try {
    runCommand('npm', ['run', 'start'], {
      cwd: 'client',
      prefix: 'CLIENT',
      prefixColor: 'IMPROBABILITY',
      capturePid: pid => (clientPid = pid),
    })
  } catch (err) {
    exitWithError('CLIENT FAILED TO START:', err as Error)
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
  // runCommand('npm', ['run', 'watch-api'], {
  //   cwd: 'client',
  //   prefix: 'BABEL FISH',
  //   prefixColor: 'CUP_OF_TEA',
  //   capturePid: pid => (watcherPid = pid),
  // }).catch(err => {
  //   console.warn(`${COLORS.SARCASM}[⚠️] API watcher failed, but continuing anyway: ${err.message}${COLORS.NC}`)
  // })

  pids[0] = clientPid
  pids[1] = serverPid
  pids[2] = watcherPid

  process.on('SIGINT', cleanupHandler)
}

start().catch(err => {
  console.error(`${COLORS.PANIC}[FATAL ERROR] │ ${err.message}${COLORS.NC}`)
  process.exit(1)
}) 
