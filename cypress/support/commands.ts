/// <reference types="cypress" />

type UserType = 'admin' | 'user1' | 'user2'

Cypress.Commands.add('login', (userType: UserType) => {
  cy.fixture('users').then((users) => {
    const user = users[userType]
    const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8080'
    const baseUrl = Cypress.config('baseUrl') || 'http://localhost:4200'
    
    cy.log(`🔐 Starting login for user: ${userType}`)
    cy.log(`📍 Using Keycloak URL: ${keycloakUrl}`)
    cy.log(`🏠 Using Base URL: ${baseUrl}`)
    
    // Visit the app and wait for redirect to Keycloak
    cy.visit('/')
    
    // Wait for either Keycloak login form or successful authentication
    cy.url({ timeout: 10000 }).then((currentUrl) => {
      cy.log(`🌐 Current URL after visit: ${currentUrl}`)
      
      if (currentUrl.includes('keycloak')) {
        // We're on Keycloak login page - perform login
        cy.log('📝 Found Keycloak login page, performing authentication...')
        
        cy.origin(keycloakUrl, { args: { username: user.username, password: user.password } }, ({ username, password }) => {
          cy.log(`👤 Logging in user: ${username}`)
          
          // Wait for login form to be visible
          cy.get('#kc-form-login', { timeout: 10000 }).should('be.visible')
          
          cy.get('#username').should('be.visible').clear().type(username)
          cy.get('#password').should('be.visible').clear().type(password)
          cy.get('#kc-login').should('be.visible').click()
        })
        
        // Wait for redirect back to app
        cy.url({ timeout: 15000 }).should('not.include', 'keycloak')
        cy.url().should('include', new URL(baseUrl).host)
        
      } else if (currentUrl.includes(new URL(baseUrl).host)) {
        // We're already authenticated or app is not requiring login
        cy.log('🎉 Already on app domain - checking if authenticated...')
        
        // Check if we can see authenticated content
        cy.get('body', { timeout: 10000 }).should('be.visible')
        
      } else {
        // Unexpected state
        cy.log(`❌ Unexpected URL: ${currentUrl}`)
        throw new Error(`Unexpected URL state: ${currentUrl}`)
      }
    })
    
    cy.get('body', { timeout: 10000 }).should('be.visible')
    cy.log(`✅ Login completed for user: ${userType}`)
  })
})
