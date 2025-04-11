import { Language } from "./translation"

export type Option<TId, TGroupId = any> = {
  id: TId; // Generic ID type
  label: string; // Descriptive label for the option
  groupId?: TGroupId; // Optional group identifier with independent type
}

export const authRoles = ['admin', 'invited'] as const;
export type AuthRole = typeof authRoles[number];

export interface UserSession {
  authenticated?: boolean
  userName: string
  userId: number
  authRole: AuthRole
  language: Language
}
export interface LinkData {
  route: string
  params?: Record<string, any>
}

export type GenericInputEvent = { target: { value: string; name: string } }