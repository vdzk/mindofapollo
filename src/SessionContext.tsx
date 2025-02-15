import { createContext, createEffect, createResource, ParentComponent, Resource, Setter } from "solid-js"
import { getUserSession } from "./api/shared/session"
import { useNavigate } from "@solidjs/router"
import { useIsPublicRoute } from "./client-only/util"
import { UserSession } from "./types"

export const SessionContext = createContext<{
  userSession: Resource<UserSession | undefined>;
  refetch: (info?: unknown) => UserSession | Promise<UserSession | undefined> | null | undefined;
  mutate: Setter<UserSession | undefined>;
}>();

export const SessionContextProvider: ParentComponent = (props) => {
  const isPublicRoute = useIsPublicRoute()
  const navigate = useNavigate()
  const [userSession, { mutate, refetch }] = createResource(getUserSession);

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
