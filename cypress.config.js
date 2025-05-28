const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:4200',
    env: {
      apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:3000',
      keycloakUrl: process.env.CYPRESS_KEYCLOAK_URL || 'http://localhost:8080',
    },
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    experimentalOriginDependencies: true,
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
}) 