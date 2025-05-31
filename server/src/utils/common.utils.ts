import * as path from 'path'

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

export function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === undefined ||
    process.env.NODE_ENV === ''
  )
}

export function getWorkingDirectory(): string {
  return isProduction() || isTest()
    ? '/app'
    : path.resolve(__dirname, '../../../')
}

export function getEnvironment(): string {
  return process.env.NODE_ENV ?? 'development'
}
