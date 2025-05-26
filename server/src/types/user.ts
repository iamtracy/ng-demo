interface User {
  sub: string
  email: string
  preferred_username: string
  email_verified: boolean
  given_name: string
  family_name: string
  realm_access?: {
    roles: string[]
  }
}

export type { User }