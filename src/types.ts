export type Option<TId> = {
  id: TId; // Generic ID type
  label: string; // Descriptive label for the option
}

export type AuthorizationCategory = 'admin' | 'invited'

export interface UserSession {
  userId: number
  authorizationCategory: AuthorizationCategory
}