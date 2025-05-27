describe('Authentication', () => {
  beforeEach(() => {
    cy.clearAllCookies()
  })

  it('should login as admin user via UI flow', () => {
    cy.loginAsUser('admin')
    cy.get('[data-cy="admin-menu-item"]').should('be.visible')
  })

  it('should login as regular user via UI flow', () => {
    cy.loginAsUser('user')
    
    cy.get('[data-cy="admin-menu-item"]').should('not.exist')
    cy.get('[data-cy="home-menu-item"]').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.loginApiAsUser('user')
    cy.visit('/')
    
    cy.logout()
    
    cy.url().should('not.include', '/dashboard')
  })

  it('should handle invalid credentials', () => {
    cy.visit('/')
    
    cy.origin('http://localhost:8080', () => {
      cy.visit('/realms/ng-demo/protocol/openid-connect/auth?client_id=ng-demo-client&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2F&response_type=code&scope=openid')
      
      cy.get('#username').type('invalid')
      cy.get('#password').type('invalid')
      cy.get('#kc-login').click()
      
      cy.get('.alert-error, .kc-feedback-text').should('be.visible')
    })
  })

  it.skip('should login via API with admin user', () => {
    cy.loginApiAsUser('admin')
    
    cy.visit('/')
    
    cy.get('[data-cy="admin-menu-item"]').should('be.visible')
  })

  it.skip('should login via API with regular user', () => {
    cy.loginApiAsUser('user')
    
    cy.visit('/')
    
    cy.get('[data-cy="admin-menu-item"]').should('not.exist')
    cy.get('[data-cy="home-menu-item"]').should('be.visible')
  })
}) 