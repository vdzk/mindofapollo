"use server"

import { redirect } from "@solidjs/router";
import { useSession } from "vinxi/http";
import { getRecordById } from "./db";

type UserSession = {
  userId?: string;
};

// TODO: store secret in .env file
const getSession = () => useSession({password: 'secret_secret_secret_secret_secret_secret_secret_secret_secret'})

export const login = async (userId: string) => {
  const session = await getSession();
  await session.update((d: UserSession) => (d.userId = userId));
  
  // TODO: this seems to do nothing
  return redirect('/');
}

export const logout = async () => {
  const session = await getSession();
  await session.update((d: UserSession) => (d.userId = undefined));
}

export const getUser = async () => {
  // Temporary workaround for this issue
  // https://github.com/nksaraf/vinxi/issues/208
  // await new Promise(r => setTimeout(r, 200))
  const session = await getSession()
  const { userId } = session.data as UserSession
  if (userId) {
    return await getRecordById('person', userId)
  } else {
    return undefined
  }
}