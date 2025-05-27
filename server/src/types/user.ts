import { JwtPayload } from 'jsonwebtoken'

export interface OIDCTokenPayload extends JwtPayload {
  given_name?: string
  family_name?: string
  preferred_username?: string
  email?: string
  email_verified?: boolean
  realm_access?: {
    roles: string[]
  }
  resource_access?: Record<string, { roles: string[] }>
}
