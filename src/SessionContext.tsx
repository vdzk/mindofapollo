import { createContext, createResource, ParentComponent, Resource, Setter } from "solid-js"
import { UserSession } from "./types"
import { getOneUserSession } from "./api/getOne/userSession";

export interface SessionContextType {
  userSession: Resource<UserSession | undefined>
  refetch: (info?: unknown) => UserSession | Promise<UserSession | undefined> | null | undefined
  mutate: Setter<UserSession | undefined>
}

export const SessionContext = createContext<SessionContextType>();

export const SessionContextProvider: ParentComponent = (props) => {
  const [userSession, { mutate, refetch }] = createResource(getOneUserSession)

  const session = {userSession, refetch, mutate}

  return (
    <SessionContext.Provider value={session}>
      {props.children}
    </SessionContext.Provider>
  )
}
