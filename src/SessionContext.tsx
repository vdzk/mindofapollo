import { createContext, createEffect, createResource, createSignal, onMount, ParentComponent, Resource, Setter, Show } from "solid-js";
import { getUser } from "./api/shared/session";
import { DataRecordWithId } from "./schema/type";
import { useNavigate } from "@solidjs/router";
import { useIsPublicRoute } from "./util";

export const SessionContext = createContext<{
  user: Resource<DataRecordWithId | undefined>;
  loggedIn: () => boolean;
  refetch: (info?: unknown) => DataRecordWithId | Promise<DataRecordWithId | undefined> | null | undefined;
  mutate: Setter<DataRecordWithId | undefined>;
}>();

export const SessionContextProvider: ParentComponent = (props) => {
  const isPublicRoute = useIsPublicRoute()
  const navigate = useNavigate()
  const [user, { mutate, refetch }] = createResource(getUser);
  const loggedIn = () => !!user()

  const session = {user, loggedIn, refetch, mutate}

  const [mounted, setMounted] = createSignal(false)
  // TODO: find a way to remove this hack that avoids hydration mismatch
  // onMount(() => setMounted(true))
  onMount(() => setTimeout(() => setMounted(true), 300))

  createEffect(() => {
    if (user.state == 'ready') {
      if (!user() && !isPublicRoute()) {
        navigate('/login', { replace: true })
      }
    }
  })

  return (
    <SessionContext.Provider value={session}>
      <Show when={mounted() && user.state === 'ready'}>
        {props.children}
      </Show>
    </SessionContext.Provider>
  )
}
