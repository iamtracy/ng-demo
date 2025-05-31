import { readFileSync, writeFileSync } from 'node:fs'
import { COLORS } from './utils'

const HOSTS_FILE = '/etc/hosts'
const DOMAINS = {
  KEYCLOAK: 'auth.localhost',
  APP_SERVER: 'app.localhost'
}

const HOST_ENTRIES = [
  `127.0.0.1 ${DOMAINS.KEYCLOAK}`,
  `127.0.0.1 ${DOMAINS.APP_SERVER}`
]

const HOSTS_MARKER_START = '# ng-demo-hosts-start'
const HOSTS_MARKER_END = '# ng-demo-hosts-end'

function readHostsFile(): string {
  try {
    return readFileSync(HOSTS_FILE, 'utf8')
  } catch (error) {
    console.error(`${COLORS.ERROR}[ERROR] Failed to read hosts file: ${(error as Error).message}${COLORS.NC}`)
    console.error(`${COLORS.ERROR}        Make sure you have permission to read ${HOSTS_FILE}${COLORS.NC}`)
    process.exit(1)
  }
}

function writeHostsFile(content: string): void {
  try {
    writeFileSync(HOSTS_FILE, content, 'utf8')
  } catch (error) {
    console.error(`${COLORS.ERROR}[ERROR] Failed to write hosts file: ${(error as Error).message}${COLORS.NC}`)
    console.error(`${COLORS.ERROR}        Make sure you run this script with sudo privileges${COLORS.NC}`)
    process.exit(1)
  }
}

function hasExistingEntries(hostsContent: string): boolean {
  return hostsContent.includes(HOSTS_MARKER_START)
}

function removeExistingEntries(hostsContent: string): string {
  const startIndex = hostsContent.indexOf(HOSTS_MARKER_START)
  if (startIndex === -1) return hostsContent
  
  const endIndex = hostsContent.indexOf(HOSTS_MARKER_END)
  if (endIndex === -1) {
    console.warn(`${COLORS.WARNING}[WARN] Found start marker but no end marker in hosts file${COLORS.NC}`)
    return hostsContent
  }
  
  // Remove the section including the markers and any trailing newline
  const before = hostsContent.substring(0, startIndex)
  const after = hostsContent.substring(endIndex + HOSTS_MARKER_END.length)
  
  return before + after.replace(/^\n/, '')
}

function addHostEntries(): void {
  console.log(`${COLORS.INFO}[INFO] Adding host entries for ng-demo...${COLORS.NC}`)
  
  const hostsContent = readHostsFile()
  
  // Remove existing entries if they exist
  const cleanedContent = removeExistingEntries(hostsContent)
  
  // Add our entries
  const newContent = cleanedContent + 
    (cleanedContent.endsWith('\n') ? '' : '\n') +
    `${HOSTS_MARKER_START}\n` +
    HOST_ENTRIES.join('\n') + '\n' +
    `${HOSTS_MARKER_END}\n`
  
  writeHostsFile(newContent)
  
  console.log(`${COLORS.SUCCESS}[SUCCESS] Host entries added successfully:${COLORS.NC}`)
  HOST_ENTRIES.forEach(entry => {
    console.log(`${COLORS.INFO}          ${entry}${COLORS.NC}`)
  })
}

function removeHostEntries(): void {
  console.log(`${COLORS.INFO}[INFO] Removing host entries for ng-demo...${COLORS.NC}`)
  
  const hostsContent = readHostsFile()
  
  if (!hasExistingEntries(hostsContent)) {
    console.log(`${COLORS.INFO}[INFO] No ng-demo host entries found${COLORS.NC}`)
    return
  }
  
  const cleanedContent = removeExistingEntries(hostsContent)
  writeHostsFile(cleanedContent)
  
  console.log(`${COLORS.SUCCESS}[SUCCESS] Host entries removed successfully${COLORS.NC}`)
}

function listHostEntries(): void {
  const hostsContent = readHostsFile()
  
  if (!hasExistingEntries(hostsContent)) {
    console.log(`${COLORS.INFO}[INFO] No ng-demo host entries found${COLORS.NC}`)
    return
  }
  
  console.log(`${COLORS.PRIMARY}[INFO] Current ng-demo host entries:${COLORS.NC}`)
  HOST_ENTRIES.forEach(entry => {
    console.log(`${COLORS.INFO}       ${entry}${COLORS.NC}`)
  })
}

function checkPermissions(): void {
  try {
    // Test if we can read the hosts file
    readHostsFile()
    
    // Test if we can write (we'll do a dry run by trying to write the same content)
    const content = readFileSync(HOSTS_FILE, 'utf8')
    writeFileSync(HOSTS_FILE, content, 'utf8')
    
  } catch (error) {
    console.error(`${COLORS.ERROR}[ERROR] Insufficient permissions to modify hosts file${COLORS.NC}`)
    console.error(`${COLORS.ERROR}        Please run this script with sudo:${COLORS.NC}`)
    console.error(`${COLORS.ERROR}        sudo npm run setup:hosts${COLORS.NC}`)
    process.exit(1)
  }
}

function showUsage(): void {
  console.log(`${COLORS.PRIMARY}[INFO] ng-demo Host Setup Script${COLORS.NC}`)
  console.log(`${COLORS.INFO}Usage: npm run setup:hosts [command]${COLORS.NC}`)
  console.log(`${COLORS.INFO}`)
  console.log(`${COLORS.INFO}Commands:${COLORS.NC}`)
  console.log(`${COLORS.INFO}  add     Add host entries for ng-demo${COLORS.NC}`)
  console.log(`${COLORS.INFO}  remove  Remove host entries for ng-demo${COLORS.NC}`)
  console.log(`${COLORS.INFO}  list    List current ng-demo host entries${COLORS.NC}`)
  console.log(`${COLORS.INFO}  check   Check if entries exist${COLORS.NC}`)
  console.log(`${COLORS.INFO}`)
  console.log(`${COLORS.INFO}Host entries that will be managed:${COLORS.NC}`)
  HOST_ENTRIES.forEach(entry => {
    console.log(`${COLORS.MUTED}  ${entry}${COLORS.NC}`)
  })
}

async function main(): Promise<void> {
  const command = process.argv[2]
  
  if (!command) {
    showUsage()
    return
  }
  
  switch (command) {
    case 'add':
      checkPermissions()
      addHostEntries()
      break
      
    case 'remove':
      checkPermissions()
      removeHostEntries()
      break
      
    case 'list':
      listHostEntries()
      break
      
    case 'check':
      const hostsContent = readHostsFile()
      const hasEntries = hasExistingEntries(hostsContent)
      console.log(`${COLORS.INFO}[INFO] ng-demo host entries: ${hasEntries ? 'PRESENT' : 'NOT FOUND'}${COLORS.NC}`)
      break
      
    default:
      console.error(`${COLORS.ERROR}[ERROR] Unknown command: ${command}${COLORS.NC}`)
      showUsage()
      process.exit(1)
  }
}

export { DOMAINS }

main().catch(err => {
    console.error(`${COLORS.ERROR}[ERROR] ${err.message}${COLORS.NC}`)
    process.exit(1)
})