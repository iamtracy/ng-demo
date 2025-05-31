import { defineConfig } from 'cypress'

const baseUrl = process.env.CYPRESS_BASE_URL ?? 'http://localhost:4200'
const keycloakUrl = process.env.CYPRESS_KEYCLOAK_URL ?? 'http://localhost:8080'

console.log('baseUrl', baseUrl)
console.log('keycloakUrl', keycloakUrl)


export default defineConfig({
  e2e: {
    baseUrl,
    env: {
      keycloakUrl,
    },
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    experimentalOriginDependencies: true,
  },
})