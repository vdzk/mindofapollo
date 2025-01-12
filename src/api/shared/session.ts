"use server"

import { redirect } from "@solidjs/router";
import { useSession } from "vinxi/http";
import { getRecordById } from "~/api/shared/select";

type UserSession = {
  userId?: number;
};

// TODO: store secret in .env file
export const getSession = () => useSession<UserSession>({password: 'secret_secret_secret_secret_secret_secret_secret_secret_secret'})

export const login = async (userId: number) => {
  const session = await getSession();
  await session.update({userId});

  // TODO: this seems to do nothing
  return redirect('/');
}

export const logout = async () => {
  const session = await getSession();
  await session.clear();
}

export const getUserId = async () => {
  const session = await getSession()
  return session.data.userId
}

export const getUser = async () => {
  // Temporary workaround for this issue
  // https://github.com/nksaraf/vinxi/issues/208
  // await new Promise(r => setTimeout(r, 200))
  const userId = await getUserId()
  if (userId) {
    return await getRecordById('person', userId)
  } else {
    return undefined
  }
};
