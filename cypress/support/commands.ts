/// <reference types="cypress" />

type UserType = 'admin' | 'user1' | 'user2'

Cypress.Commands.add('login', (userType: UserType) => {
  cy.fixture('users').then((users) => {
    const user = users[userType]
    const keycloakUrl = Cypress.env('keycloakUrl')
    
    cy.log(`🔐 Logging in user: ${userType}`)
    
    cy.visit('/', { timeout: 15000 })
    cy.wait(2000)
    
    cy.url({ timeout: 15000 }).then((currentUrl) => {
      if (currentUrl.includes('keycloak') || currentUrl.includes('auth')) {
        cy.origin(keycloakUrl, { args: { username: user.username, password: user.password } }, ({ username, password }) => {
          cy.get('#kc-form-login', { timeout: 10000 }).should('be.visible')
          cy.get('#username').clear().type(username)
          cy.get('#password').clear().type(password)
          cy.get('#kc-login').click()
        })
        
        cy.url({ timeout: 15000 }).should('not.include', 'keycloak')
      }
    })
    
    cy.get('[data-cy="logout-button"]', { timeout: 10000 }).should('be.visible')
    cy.log(`✅ Login completed for user: ${userType}`)
  })
})
