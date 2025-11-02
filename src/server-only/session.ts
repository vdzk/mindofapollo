import { useSession } from "vinxi/http";
import { AuthRole, UserSession } from "~/types";
import { UserActor } from "~/components/expl/types";
import { _getRecordById } from "./select";
import { Language } from "~/translation";

export const getSession = () => useSession<UserSession>({
  // TODO: warn if the session password is not set
  password: process.env.SESSION_PASSWORD ?? "0".repeat(32)
})

export const logout = async () => {
  const session = await getSession()
  await session.clear()
}

export const getUserId = async () => {
  const session = await getSession()
  return session.data.userId
}

export const getUserSession = async () => {
  const session = await getSession()
  return session.data
}

export const getAuthRole = async () => {
  const session = await getSession()
  return session.data.authRole ?? 'anonymous'
}

export const getUserLanguage = async () => {
  const session = await getSession()
  return session.data.language
}

export const belongsTo = async (roles: string[]) => {
  const authRole = await getAuthRole()
  if (authRole === 'admin') return true
  return roles.includes(authRole)
}

export const getUserActorUser = async (): Promise<UserActor['user']> => {
  const session = await getSession()
  return {
    id: session.data.userId,
    name: session.data.userName,
    auth_role: session.data.authRole
  }
}

export const _updateUserSession = async (userId: number) => {
  const session = await getSession()
  const person = await _getRecordById('person', userId, ['name', 'auth_role_id', 'language'], false)
  if (!person) return
  const authRole = await _getRecordById(
    'auth_role',
    person.auth_role_id as number,
    ['name']
  );
  if (!authRole) return
  await session.update({
    authenticated: true,
    userId,
    userName: person.name as string,
    authRole: authRole.name as AuthRole,
    language: person.language as Language
  })
  return session.data
}

