import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from './tsconfig.json'

interface CompilerOptions {
  paths: Record<string, string[]>
}

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  coveragePathIgnorePatterns: ['/node_modules/', '/generated/', '/types/'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(
    (compilerOptions as CompilerOptions).paths,
    { prefix: '<rootDir>/../' },
  ),
}

export default config
