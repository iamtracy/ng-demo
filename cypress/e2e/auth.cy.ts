describe('Authentication', () => {
  beforeEach(() => {
    cy.clearAllCookies()
  })

  it('should login as admin user via UI flow', () => {
    cy.login('admin')
    
    cy.get('[data-cy="admin-menu-item"]').should('be.visible')
  })

  it('should login as regular user via UI flow', () => {
    cy.login('user1')
    
    cy.get('[data-cy="admin-menu-item"]').should('not.exist')
    cy.get('[data-cy="home-menu-item"]').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.login('user1')
    cy.get('[data-cy="logout-button"]').click()


    const keycloakUrl = Cypress.env('keycloakUrl')
    
    cy.origin(keycloakUrl, { args: { keycloakUrl } }, ({ keycloakUrl }) => {
      cy.url().should('include', keycloakUrl)
    })
  })
}) 