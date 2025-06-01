#!/usr/bin/env tsx

// =============================================================================
// 🚀 ng-demo AWS Deployment Script
// =============================================================================

import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { COLORS } from './utils.js'

interface DeployOptions {
  environment: 'dev' | 'staging' | 'prod'
  region?: string
  skipBuild?: boolean
  destroy?: boolean
  verbose?: boolean
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const INFRA_DIR = join(PROJECT_ROOT, 'infrastructure')

// =============================================================================
// 🎯 MAIN DEPLOYMENT FUNCTIONS
// =============================================================================

async function deploy(options: DeployOptions): Promise<void> {
  try {
    printHeader(options)
    await validatePrerequisites()
    
    if (options.destroy) {
      await destroyStack(options)
      return
    }

    if (!options.skipBuild) {
      await buildApplication()
    }

    await deployInfrastructure(options)
    await printSummary(options)

  } catch (error) {
    printError('Deployment failed', error as Error)
    process.exit(1)
  }
}

function printHeader(options: DeployOptions): void {
  console.log(`${COLORS.PRIMARY}`)
  console.log('='.repeat(60))
  console.log('🚀 ng-demo AWS Deployment')
  console.log('='.repeat(60))
  console.log(`${COLORS.NC}`)
  
  printInfo(`Environment: ${options.environment}`)
  printInfo(`Region: ${options.region || 'default'}`)
  printInfo(`Action: ${options.destroy ? 'DESTROY' : 'DEPLOY'}`)
  printInfo(`AWS Account ID: ${process.env.AWS_ACCOUNT_ID}`)
  printInfo(`AWS Region: ${process.env.AWS_DEFAULT_REGION}`)
  console.log()
}

async function validatePrerequisites(): Promise<void> {
  printInfo('🔍 Validating prerequisites...')

  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' })
    printSuccess('AWS CLI configured')
  } catch {
    throw new Error('AWS CLI not configured. Please run "aws configure" first.')
  }

  try {
    execSync('docker info', { stdio: 'pipe' })
    printSuccess('Docker is running')
  } catch {
    throw new Error('Docker is not running. Please start Docker first.')
  }

  if (!existsSync(INFRA_DIR)) {
    throw new Error('Infrastructure directory not found')
  }

  try {
    execSync('npx cdk --version', { stdio: 'pipe', cwd: INFRA_DIR })
    printSuccess('CDK is available')
  } catch {
    throw new Error('CDK not found. Please install dependencies in infrastructure/')
  }

  console.log()
}

async function buildApplication(): Promise<void> {
  printInfo('🏗️  Building application Docker image...')
  
  try {
    const buildCmd = 'docker build -t ng-demo-app:latest .'
    
    if (process.stdout.isTTY) {
      await runCommand(buildCmd, PROJECT_ROOT)
    } else {
      execSync(buildCmd, { 
        cwd: PROJECT_ROOT,
        stdio: 'pipe'
      })
    }
    
    printSuccess('Docker image built successfully')
  } catch (error) {
    throw new Error(`Failed to build Docker image: ${(error as Error).message}`)
  }
  
  console.log()
}

async function deployInfrastructure(options: DeployOptions): Promise<void> {
  printInfo('☁️  Deploying infrastructure...')
  
  const stackName = `NgDemo-${capitalizeFirst(options.environment)}`
  const env = buildEnvironment(options)
  
  try {
    printInfo('Installing CDK dependencies...')
    execSync('npm ci', {
      cwd: INFRA_DIR,
      stdio: 'pipe',
      env
    })

    printInfo('Bootstrapping CDK...')
    execSync('npx cdk bootstrap', {
      cwd: INFRA_DIR,
      stdio: 'pipe',
      env
    })

    const deployCmd = `npx cdk deploy ${stackName} --require-approval never`
    
    if (process.stdout.isTTY) {
      await runCommand(deployCmd, INFRA_DIR, env)
    } else {
      execSync(deployCmd, {
        cwd: INFRA_DIR,
        stdio: 'inherit',
        env
      })
    }
    
    printSuccess('Infrastructure deployed successfully')
  } catch (error) {
    throw new Error(`Failed to deploy infrastructure: ${(error as Error).message}`)
  }
  
  console.log()
}

async function destroyStack(options: DeployOptions): Promise<void> {
  const stackName = `NgDemo-${capitalizeFirst(options.environment)}`
  
  printWarning(`⚠️  DESTROYING stack: ${stackName}`)
  
  if (options.environment === 'prod') {
    printError('Production stack destruction is disabled for safety')
    printInfo('If you really need to destroy prod, do it manually:')
    printInfo(`cd infrastructure && npx cdk destroy ${stackName} --force`)
    process.exit(1)
  }

  try {
    const destroyCmd = `npx cdk destroy ${stackName} --force`
    const env = buildEnvironment(options)
    
    await runCommand(destroyCmd, INFRA_DIR, env)
    printSuccess('Stack destroyed successfully')
  } catch (error) {
    throw new Error(`Failed to destroy stack: ${(error as Error).message}`)
  }
}

async function printSummary(options: DeployOptions): Promise<void> {
  const stackName = `NgDemo-${capitalizeFirst(options.environment)}`
  
  printSuccess('🎉 Deployment completed successfully!')
  console.log()
  
  printInfo('📊 Deployment Summary:')
  console.log(`  Environment: ${options.environment}`)
  console.log(`  Stack: ${stackName}`)
  console.log(`  Region: ${options.region || process.env.CDK_DEFAULT_REGION || 'us-east-1'}`)
  console.log()
  
  printInfo('🔗 Useful commands:')
  console.log(`  Check status: cd infrastructure && npm run status`)
  console.log(`  View logs: cd infrastructure && npm run logs`)
  console.log(`  Show differences: cd infrastructure && npm run diff`)
  console.log()
  
  try {
    const env = buildEnvironment(options)
    const outputsCmd = `aws cloudformation describe-stacks --stack-name ${stackName} --query 'Stacks[0].Outputs' --output json`
    
    const outputs = execSync(outputsCmd, {
      cwd: INFRA_DIR,
      stdio: 'pipe',
      env,
      encoding: 'utf8'
    })
    
    const parsedOutputs = JSON.parse(outputs)
    if (parsedOutputs && parsedOutputs.length > 0) {
      printInfo('📋 Stack Outputs:')
      parsedOutputs.forEach((output: any) => {
        console.log(`  ${output.OutputKey}: ${output.OutputValue}`)
      })
      console.log()
    }
  } catch {
    // Ignore errors getting outputs
  }
  
  if (options.environment !== 'prod') {
    printWarning('⚠️  Don\'t forget to configure Keycloak realm settings if this is a first deployment!')
  }
}

// =============================================================================
// 🛠️ UTILITY FUNCTIONS
// =============================================================================

function buildEnvironment(options: DeployOptions): NodeJS.ProcessEnv {
  const env = { ...process.env }
  
  if (options.region) {
    env.CDK_DEFAULT_REGION = options.region
  }
  
  if (!env.CDK_DEFAULT_ACCOUNT) {
    try {
      const account = execSync('aws sts get-caller-identity --query Account --output text', { 
        stdio: 'pipe',
        encoding: 'utf8'
      }).trim()
      env.CDK_DEFAULT_ACCOUNT = account
    } catch {
      // Will be handled by CDK if needed
    }
  }
  
  return env
}

async function runCommand(command: string, cwd: string, env?: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ')
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      env: env || process.env
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

function printInfo(message: string): void {
  console.log(`${COLORS.INFO}[INFO]${COLORS.NC} ${message}`)
}

function printSuccess(message: string): void {
  console.log(`${COLORS.SUCCESS}[SUCCESS]${COLORS.NC} ${message}`)
}

function printWarning(message: string): void {
  console.log(`${COLORS.WARNING}[WARNING]${COLORS.NC} ${message}`)
}

function printError(message: string, error?: Error): void {
  console.log(`${COLORS.ERROR}[ERROR]${COLORS.NC} ${message}`)
  if (error && error.message) {
    console.log(`${COLORS.ERROR}        ${error.message}${COLORS.NC}`)
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// =============================================================================
// 🎛️ COMMAND LINE INTERFACE
// =============================================================================

function parseArgs(): DeployOptions {
  const args = process.argv.slice(2)
  const options: DeployOptions = {
    environment: 'dev'
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '-e':
      case '--environment':
        const env = args[++i]
        if (!['dev', 'staging', 'prod'].includes(env)) {
          throw new Error(`Invalid environment: ${env}. Must be dev, staging, or prod.`)
        }
        options.environment = env as 'dev' | 'staging' | 'prod'
        break
        
      case '-r':
      case '--region':
        options.region = args[++i]
        break
        
      case '--skip-build':
        options.skipBuild = true
        break
        
      case '--destroy':
        options.destroy = true
        break
        
      case '--verbose':
        options.verbose = true
        break
        
      case '-h':
      case '--help':
        showHelp()
        process.exit(0)
        break
        
      default:
        throw new Error(`Unknown option: ${arg}`)
    }
  }

  return options
}

function showHelp(): void {
  console.log(`
${COLORS.PRIMARY}ng-demo AWS Deployment Script${COLORS.NC}

Usage: npm run deploy [OPTIONS]

Options:
    -e, --environment   Environment to deploy (dev|staging|prod) [default: dev]
    -r, --region        AWS region [default: CDK_DEFAULT_REGION or us-east-1]
    --skip-build        Skip Docker image build
    --destroy           Destroy the stack instead of deploying
    --verbose           Enable verbose output
    -h, --help          Show this help message

Examples:
    npm run deploy -- -e dev                    # Deploy to development
    npm run deploy -- -e prod -r us-west-2      # Deploy to production in us-west-2
    npm run deploy -- --destroy -e dev          # Destroy development stack
    npm run deploy -- --skip-build -e staging   # Deploy staging without rebuilding image

Environment Variables:
    CDK_DEFAULT_ACCOUNT    AWS Account ID
    CDK_DEFAULT_REGION     AWS Region
`)
}

// =============================================================================
// 🚀 MAIN EXECUTION
// =============================================================================

async function main(): Promise<void> {
  try {
    const options = parseArgs()
    await deploy(options)
  } catch (error) {
    console.error(`${COLORS.ERROR}[ERROR]${COLORS.NC} ${(error as Error).message}`)
    process.exit(1)
  }
}

main().catch(console.error)

export { deploy, type DeployOptions } 