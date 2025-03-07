export type Option<TId> = {
  id: TId; // Generic ID type
  label: string; // Descriptive label for the option
}

export type AuthRole = 'admin' | 'invited'

export interface UserSession {
  authenticated?: boolean
  userName: string
  userId: number
  authRole: AuthRole
}
export interface LinkData {
  route: string
  params: Record<string, string>
}
