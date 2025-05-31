import { readFileSync } from 'node:fs'
import { COLORS } from './utils'
import { DOMAINS } from './setup-hosts'

const HOSTS_FILE = '/etc/hosts'
const HOSTS_MARKER_START = '# ng-demo-hosts-start'

function checkHostEntries(): boolean {
  try {
    const hostsContent = readFileSync(HOSTS_FILE, 'utf8')
    return hostsContent.includes(HOSTS_MARKER_START)
  } catch (error) {
    console.error(`${COLORS.ERROR}[ERROR] Cannot read hosts file: ${(error as Error).message}${COLORS.NC}`)
    return false
  }
}

function showHostSetupInstructions(): void {
  console.log(`${COLORS.WARNING}[SETUP] Host entries required for E2E tests${COLORS.NC}`)
  console.log(`${COLORS.INFO}`)
  console.log(`${COLORS.INFO}To resolve JWT issuer validation issues, ng-demo needs these host entries:${COLORS.NC}`)
  console.log(`${COLORS.MUTED}  127.0.0.1 ${DOMAINS.KEYCLOAK}${COLORS.NC}`)
  console.log(`${COLORS.MUTED}  127.0.0.1 ${DOMAINS.APP_SERVER}${COLORS.NC}`)
  console.log(`${COLORS.INFO}`)
  console.log(`${COLORS.INFO}Please run one of these commands to add the entries:${COLORS.NC}`)
  console.log(`${COLORS.SUCCESS}  sudo npm run setup:hosts:add${COLORS.NC}`)
  console.log(`${COLORS.INFO}`)
  console.log(`${COLORS.INFO}After adding host entries, re-run the E2E tests:${COLORS.NC}`)
  console.log(`${COLORS.SUCCESS}  npm run test:e2e${COLORS.NC}`)
  console.log(`${COLORS.INFO}`)
  console.log(`${COLORS.MUTED}To remove entries later: sudo npm run setup:hosts:remove${COLORS.NC}`)
}

async function main(): Promise<void> {
  console.log(`${COLORS.PRIMARY}[INFO] ng-demo E2E Test Setup${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Checking host file configuration...${COLORS.NC}`)
  
  if (!checkHostEntries()) {
    showHostSetupInstructions()
    process.exit(1)
  }
  
  console.log(`${COLORS.SUCCESS}[SUCCESS] Host entries are configured correctly${COLORS.NC}`)
  console.log(`${COLORS.INFO}[INFO] Domain mappings:${COLORS.NC}`)
  console.log(`${COLORS.INFO}         Keycloak: ${DOMAINS.KEYCLOAK}:8080${COLORS.NC}`)
  console.log(`${COLORS.INFO}         App Server: ${DOMAINS.APP_SERVER}:3000${COLORS.NC}`)
  console.log(`${COLORS.SUCCESS}[SUCCESS] Ready to run E2E tests!${COLORS.NC}`)
}

if (require.main === module) {
  main().catch(err => {
    console.error(`${COLORS.ERROR}[ERROR] ${err.message}${COLORS.NC}`)
    process.exit(1)
  })
} 