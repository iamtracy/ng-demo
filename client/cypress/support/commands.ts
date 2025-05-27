/// <reference types="cypress" />

type UserType = 'admin' | 'user' | 'user2'

Cypress.Commands.add('login', (userType: UserType) => {
  cy.fixture('users').then((users) => {
    const user = users[userType]
    
    cy.visit('/')
    
    cy.origin('http://localhost:8080', { args: { username: user.username, password: user.password } }, ({ username, password }) => {
      cy.log(`Logging in user: ${username}`)
      cy.url().then((currentUrl) => cy.log(`Current URL: ${currentUrl}`))

      cy.get('#kc-form-login', { timeout: 10000 }).should('be.visible')
      
      cy.get('#username').should('be.visible').clear().type(username)
      
      cy.get('#password').should('be.visible').clear().type(password)
      
      cy.get('#kc-login').should('be.visible').click()
    })
  })
})
