export {}

// Create a type for the roles
export type Roles = 'admin' | 'user' | 'accountant'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}