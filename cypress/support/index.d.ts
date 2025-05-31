/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {    
      login(userType: UserType): Chainable<void>
    }
  }
}

export {} 