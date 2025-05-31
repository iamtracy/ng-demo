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
      prefixColor: 'PRIMARY' 
    })
  } catch (err) {
    exitWithError('CLIENT INSTALLATION FAILED:', err as Error)
  }

  try {
    runCommand('npm', ['run', 'start'], {
      cwd: 'client',
      prefix: 'CLIENT',
      prefixColor: 'PRIMARY',
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
      prefixColor: 'SUCCESS' 
    })

    runCommand('npm', ['run', 'start'], {
      cwd: 'server',
      prefix: 'SERVER',
      prefixColor: 'SUCCESS',
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
    prefix: 'API WATCHER',
    prefixColor: 'INFO',
    capturePid: pid => (watcherPid = pid),
  }).catch(err => {
    console.warn(`${COLORS.WARNING}[WARN] API watcher failed, but continuing anyway: ${err.message}${COLORS.NC}`)
  })

  pids[0] = clientPid
  pids[1] = serverPid
  pids[2] = watcherPid

  process.on('SIGINT', cleanupHandler)
}

start().catch(err => {
  console.error(`${COLORS.ERROR}[ERROR] Fatal error: ${err.message}${COLORS.NC}`)
  process.exit(1)
}) 
