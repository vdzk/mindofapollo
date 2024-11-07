import { createContext, createResource, createSignal, onMount, ParentComponent, Resource, Setter, Show } from "solid-js";
import { getUser } from "./server/session";
import { DataRecord } from "./schema/type";

export const SessionContext = createContext<{
  user: Resource<DataRecord | undefined>;
  loggedIn: () => boolean;
  refetch: (info?: unknown) => DataRecord | Promise<DataRecord | undefined> | null | undefined;
  mutate: Setter<DataRecord | undefined>;
}>();

export const SessionContextProvider: ParentComponent = (props) => {
  const [user, { mutate, refetch }] = createResource(getUser);
  const loggedIn = () => !!user()

  const session = {user, loggedIn, refetch, mutate}

  const [mounted, setMounted] = createSignal(false)
  // TODO: find a way to remove this hack that avoids hydration mismatch
  onMount(() => setMounted(true))
  // onMount(() => setTimeout(() => setMounted(true), 300))
  
  return (
    <SessionContext.Provider value={session}>
      <Show when={mounted() && user.state === 'ready'}>
        {props.children}
      </Show>
    </SessionContext.Provider>
  )
}
