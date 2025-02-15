"use server"
import { useSession } from "vinxi/http";
import { _getRecordById, getRecordById } from "~/api/shared/select";
import { UserSession } from "~/types";

// TODO: store secret in .env file
export const getSession = () => useSession<UserSession>({password: 'secret_secret_secret_secret_secret_secret_secret_secret_secret'})

export const login = async (userId: number) => {
  const person = await _getRecordById('person', userId, ['authorization_category_id'])
  if (!person) return
  const authorizationCategory = await _getRecordById(
    'authorization_category',
    person.authorization_category_id as number,
    ['name']
  )
  if (!authorizationCategory) return
  const session = await getSession()
  await session.update({
    authenticated: true,
    userId,
    authorizationCategory: authorizationCategory.name as UserSession['authorizationCategory']
  }) 
  return session.data
}

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

export const getUser = async () => {
  const userId = await getUserId()
  if (userId) {
    return await getRecordById('person', userId)
  } else {
    return undefined
  }
}
