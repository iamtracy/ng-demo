// =============================================================================
// 🏠 HOST DOMAIN CONFIGURATION
// =============================================================================
export const DOMAINS = {
  KEYCLOAK: 'auth.localhost',
  FRONTEND: 'app.localhost',
  APP_SERVER: 'app.localhost'
} as const

// =============================================================================
// 🎨 COLOR CONFIGURATION
// =============================================================================
export interface Colors {
  PRIMARY: string
  SUCCESS: string
  ERROR: string
  WARNING: string
  INFO: string
  MUTED: string
  NC: string
}

export const COLORS: Colors = {
  PRIMARY: '\x1b[1;34m',    // Bold Blue
  SUCCESS: '\x1b[1;32m',    // Bold Green
  ERROR: '\x1b[1;31m',      // Bold Red
  WARNING: '\x1b[1;33m',    // Bold Yellow
  INFO: '\x1b[0;36m',       // Cyan
  MUTED: '\x1b[0;37m',      // Light Gray
  NC: '\x1b[0m'             // No Color
} 