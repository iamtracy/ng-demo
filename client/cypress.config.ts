import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    env: {
      apiUrl: 'http://localhost:3000',
      keycloakUrl: 'http://localhost:8080',
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
