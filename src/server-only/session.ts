import { useSession } from "vinxi/http";
import { UserSession } from "~/types";
import { UserActor } from "~/components/expl/types";

// TODO: store secret in .env file
export const getSession = () => useSession<UserSession>({password: 'secret_secret_secret_secret_secret_secret_secret_secret_secret'})

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
  return session.data.authRole
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

