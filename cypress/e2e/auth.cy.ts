describe('Authentication', () => {
  beforeEach(() => {
    cy.clearAllCookies()
  })

  it('should login as admin user via UI flow', () => {
    cy.login('admin')
    
    // Wait for the user data to load and admin menu to appear
    cy.get('[data-cy="admin-menu-item"]', { timeout: 10000 }).should('be.visible')
  })

  it('should login as regular user via UI flow', () => {
    cy.login('user')
    
    cy.get('[data-cy="admin-menu-item"]').should('not.exist')
    cy.get('[data-cy="home-menu-item"]').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.login('user')
    
    cy.get('[data-cy="logout-button"]').click()
    
    const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8080'
    const keycloakHost = new URL(keycloakUrl).host
    cy.url().should('include', keycloakHost, { timeout: 15000 })
  })

  it('should handle invalid credentials', () => {
    const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8080'
    const baseUrl = Cypress.config('baseUrl') || 'http://localhost:4200'
    const redirectUri = encodeURIComponent(`${baseUrl}/`)
    
    cy.visit('/')
    
    cy.origin(keycloakUrl, { args: { redirectUri } }, ({ redirectUri }) => {
      cy.visit(`/realms/ng-demo/protocol/openid-connect/auth?client_id=ng-demo-client&redirect_uri=${redirectUri}&response_type=code&scope=openid`)
      
      cy.get('#username').type('invalid')
      cy.get('#password').type('invalid')
      cy.get('#kc-login').click()
      
      cy.get('.alert-error, .kc-feedback-text').should('be.visible')
    })
  })
}) 