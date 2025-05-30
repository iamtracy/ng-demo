/// <reference types="cypress" />

type UserType = 'admin' | 'user1' | 'user2'

declare global {
  namespace Cypress {
    interface Chainable {    
      login(userType: UserType): Chainable<void>
    }
  }
}

export {} 