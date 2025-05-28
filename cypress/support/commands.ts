/// <reference types="cypress" />

type UserType = 'admin' | 'user' | 'user2'

Cypress.Commands.add('login', (userType: UserType) => {
  cy.fixture('users').then((users) => {
    const user = users[userType]
    const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8080'
    const baseUrl = Cypress.config('baseUrl') || 'http://localhost:3000'
    
    cy.visit('/')
    
    cy.origin(keycloakUrl, { args: { username: user.username, password: user.password } }, ({ username, password }) => {
      cy.log(`Logging in user: ${username}`)
      cy.url().then((currentUrl) => cy.log(`Current URL: ${currentUrl}`))

      cy.get('#kc-form-login').should('be.visible')
      
      cy.get('#username').should('be.visible').clear().type(username)
      
      cy.get('#password').should('be.visible').clear().type(password)
      
      cy.get('#kc-login').should('be.visible').click()
    })
    
    cy.url({ timeout: 15000 }).should('not.include', new URL(keycloakUrl).host)
    cy.url().should('include', new URL(baseUrl).host)
    
    cy.get('body', { timeout: 10000 }).should('be.visible')
  })
})
