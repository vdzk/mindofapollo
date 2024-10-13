import postgres from "postgres";
import { createContext, createResource, createSignal, onMount, ParentComponent, Resource, Setter, Show } from "solid-js";
import { getUser } from "./server/session";

export const SessionContext = createContext<{
  user: Resource<postgres.Row | undefined>;
  loggedIn: () => boolean;
  refetch: (info?: unknown) => postgres.Row | Promise<postgres.Row | undefined> | null | undefined;
  mutate: Setter<postgres.Row | undefined>;
}>();

export const SessionContextProvider: ParentComponent = (props) => {
  const [user, { mutate, refetch }] = createResource(getUser);
  const loggedIn = () => !!user()

  const session = {user, loggedIn, refetch, mutate}

  const [mounted, setMounted] = createSignal(false)
  // TODO: find a way to remove this hack that avoids hydration mismatch
  onMount(() => setMounted(true))
  
  return (
    <SessionContext.Provider value={session}>
      <Show when={mounted() && user.state === 'ready'}>
        {props.children}
      </Show>
    </SessionContext.Provider>
  )
}
