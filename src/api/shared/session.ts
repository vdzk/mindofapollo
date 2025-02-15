"use server"
import { useSession } from "vinxi/http";
import { getRecordById } from "~/api/shared/select";
import { UserSession } from "~/types";

// TODO: store secret in .env file
export const getSession = () => useSession<UserSession>({password: 'secret_secret_secret_secret_secret_secret_secret_secret_secret'})

export const login = async (userId: number) => {
  const person = await getRecordById('person', userId)
  if (!person) return
  const authorizationCategory = await getRecordById(
    'authorization_category',
    person.authorization_category_id as number
  )
  if (!authorizationCategory) return
  const session = await getSession()
  await session.update({
    userId,
    authorization_category: authorizationCategory.name as UserSession['authorization_category']
  }) 
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
