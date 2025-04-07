import { createContext, createEffect, createResource, ParentComponent, Resource, Setter } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { useIsPublicRoute } from "./client-only/util"
import { UserSession } from "./types"
import { getOneUserSession } from "./api/getOne/userSession";

export interface SessionContextType {
  userSession: Resource<UserSession | undefined>
  refetch: (info?: unknown) => UserSession | Promise<UserSession | undefined> | null | undefined
  mutate: Setter<UserSession | undefined>
}

export const SessionContext = createContext<SessionContextType>();

export const SessionContextProvider: ParentComponent = (props) => {
  const isPublicRoute = useIsPublicRoute()
  const navigate = useNavigate()
  const [userSession, { mutate, refetch }] = createResource(getOneUserSession)

  const session = {userSession, refetch, mutate}

  createEffect(() => {
    if (userSession.state == 'ready') {
      if (!userSession()?.authenticated && !isPublicRoute()) {
        navigate('/login', { replace: true })
      }
    }
  })
  return (
    <SessionContext.Provider value={session}>
      {props.children}
    </SessionContext.Provider>
  )
}
