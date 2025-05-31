import { defineConfig } from 'cypress'

import { DOMAINS } from './scripts/constants'

export default defineConfig({
  e2e: {
    baseUrl: `http://${DOMAINS.APP_SERVER}:3000`,
    env: {
      keycloakUrl: `http://${DOMAINS.KEYCLOAK}:8080`,
    },
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    experimentalOriginDependencies: true,
  },
})