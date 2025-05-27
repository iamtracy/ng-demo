/// <reference types="cypress" />


declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login to Keycloak via UI flow
       * @param username - Keycloak username
       * @param password - Keycloak password
       */
      login(username: string, password: string): Chainable<void>
      
      /**
       * Login using predefined user fixtures
       * @param userType - Type of user from fixtures ('admin' | 'user' | 'user2')
       */
      loginAsUser(userType: UserType): Chainable<void>
      
      /**
       * Login with user object from fixture
       * @param user - User object with username and password
       */
      loginWithUser(user: { username: string; password: string }): Chainable<void>
      
      /**
       * Login via Keycloak API (programmatic)
       * @param username - Keycloak username
       * @param password - Keycloak password
       */
      loginApi(username: string, password: string): Chainable<void>
      
      /**
       * API login using fixtures
       * @param userType - Type of user from fixtures ('admin' | 'user' | 'user2')
       */
      loginApiAsUser(userType: 'admin' | 'user' | 'user2'): Chainable<void>
      
      /**
       * Logout from Keycloak
       */
      logout(): Chainable<void>
    }
  }
}

export {} 