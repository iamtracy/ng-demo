interface User {
  iss?: string
  sub: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  email: string
  email_verified: boolean
  preferred_username: string
  given_name: string
  family_name: string
  name?: string
  nickname?: string
  picture?: string
  website?: string
  gender?: string
  birthdate?: string
  zoneinfo?: string
  locale?: string
  updated_at?: number
  realm_access?: {
    roles: string[]
  }
  resource_access?: Record<
    string,
    {
      roles: string[]
    }
  >
  scope?: string
  sid?: string
  typ?: string
  azp?: string
  session_state?: string
  acr?: string
  allowed_origins?: string[]
  [key: string]: unknown
}

export type { User }
