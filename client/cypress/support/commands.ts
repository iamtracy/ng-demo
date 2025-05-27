/// <reference types="cypress" />

type UserType = 'admin' | 'user' | 'user2'

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/')
  
  // Wait for redirect to Keycloak and handle login
  cy.url().then((url) => {
    if (url.includes('localhost:8080')) {
      // Wait for the login form to be fully loaded
      cy.get('#kc-form-login', { timeout: 10000 }).should('be.visible')
      
      // Clear and type username
      cy.get('#username').should('be.visible').clear().type(username)
      
      // Clear and type password
      cy.get('#password').should('be.visible').clear().type(password)
      
      // Click login button
      cy.get('#kc-login').should('be.visible').click()
      
      // Wait for redirect back to app
      cy.url().should('include', 'localhost:4200', { timeout: 15000 })
      
      // Verify authentication
      cy.window().its('localStorage').invoke('getItem', 'kc-token').should('exist')
    }
  })
})

// Login using predefined user fixtures
Cypress.Commands.add('loginAsUser', (userType: UserType) => {
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

// Login with user object from fixture
Cypress.Commands.add('loginWithUser', (user: any) => {
  cy.clearAllCookies()
  cy.visit('/')
  
  cy.url().then((url) => {
    if (url.includes('localhost:8080')) {
      cy.get('#kc-form-login', { timeout: 10000 }).should('be.visible')
      cy.get('#username').should('be.visible').clear().type(user.username)
      cy.get('#password').should('be.visible').clear().type(user.password)
      cy.get('#kc-login').should('be.visible').click()
      
      cy.url().should('include', 'localhost:4200', { timeout: 15000 })
      cy.window().its('localStorage').invoke('getItem', 'kc-token').should('exist')
    }
  })
})

// API login - programmatic authentication (no cross-origin issues)
Cypress.Commands.add('loginApi', (username: string, password: string) => {
  const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8080'
  const realm = 'ng-demo'
  const clientId = 'ng-demo-client'
  
  cy.request({
    method: 'POST',
    url: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
    form: true,
    body: {
      grant_type: 'password',
      client_id: clientId,
      username: username,
      password: password,
    },
  }).then((response) => {
    expect(response.status).to.eq(200)
    const { access_token, refresh_token } = response.body
    
    // Visit the app first, then set tokens
    cy.visit('/')
    cy.window().then((win) => {
      win.localStorage.setItem('kc-token', access_token)
      win.localStorage.setItem('kc-refresh-token', refresh_token)
    })
  })
})

// API login using fixtures
Cypress.Commands.add('loginApiAsUser', (userType: 'admin' | 'user' | 'user2') => {
  cy.fixture('users').then((users) => {
    const user = users[userType]
    
    const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8080'
    const realm = 'ng-demo'
    const clientId = 'ng-demo-client'
    
    cy.request({
      method: 'POST',
      url: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
      form: true,
      body: {
        grant_type: 'password',
        client_id: clientId,
        username: user.username,
        password: user.password,
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      const { access_token, refresh_token } = response.body
      
      cy.visit('/')
      cy.window().then((win) => {
        win.localStorage.setItem('kc-token', access_token)
        win.localStorage.setItem('kc-refresh-token', refresh_token)
      })
    })
  })
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('kc-token')
    win.localStorage.removeItem('kc-refresh-token')
  })
  
  const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8080'
  const realm = 'ng-demo'
  const redirectUri = encodeURIComponent('http://localhost:4200/')
  
  cy.visit(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout?redirect_uri=${redirectUri}`)
})