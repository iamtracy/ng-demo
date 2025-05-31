/// <reference types="cypress" />

type UserType = 'admin' | 'user1' | 'user2'

Cypress.Commands.add('login', (userType: UserType) => {
  cy.fixture('users').then((users) => {
    const user = users[userType]
    const keycloakUrl = Cypress.env('keycloakUrl')
    
    cy.log(`🔐 Logging in user: ${userType}`)
    
    cy.visit('/', { timeout: 15000 })
    
    // Handle authentication redirect to auth.localhost:8080
    cy.origin('http://auth.localhost:8080', { args: { username: user.username, password: user.password } }, ({ username, password }) => {
      cy.get('#kc-form-login', { timeout: 10000 }).should('be.visible')
      cy.get('#username').clear().type(username)
      cy.get('#password').clear().type(password)
      cy.get('#kc-login').click()
    })
    
    cy.log(`✅ Login completed for user: ${userType}`)
  })
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="logout-button"]').click()
})
