"use server"
import { useSession } from "vinxi/http";
import { getRecordById } from "~/api/shared/select";

type UserSession = {
  userId?: number;
};

// TODO: store secret in .env file
export const getSession = () => useSession<UserSession>({password: 'secret_secret_secret_secret_secret_secret_secret_secret_secret'})

export const login = async (userId: number) => {
  const session = await getSession()
  await session.update({userId})
}

export const logout = async () => {
  const session = await getSession()
  await session.clear()
}

export const getUserId = async () => {
  const session = await getSession()
  return session.data.userId
}

export const getUser = async () => {
  const userId = await getUserId()
  if (userId) {
    return await getRecordById('person', userId)
  } else {
    return undefined
  }
};
