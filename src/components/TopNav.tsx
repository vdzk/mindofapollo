import { revalidate, useLocation } from "@solidjs/router";
import { Component, For, Show, useContext } from "solid-js";
import { schema } from "~/schema";
import { logout } from "~/server/session";
import { SessionContext } from "~/SessionContext";

export const TopNav: Component = () => {
  const session = useContext(SessionContext)

  const location = useLocation();
  const showTopNav = () => location.pathname !== '/login'
  const tableNames = Object.entries(schema.tables)

  const onLogout = async () => {
    await logout()
    session!.refetch()
    revalidate(['getUser'])
  }

  return (
    <Show when={showTopNav()}>
      <nav class="flex justify-between">
        <div class="px-2 py-0.5">
          <For each={tableNames}>
            {([tableName, tableSchema], index) => <>
              <Show when={index() > 0}> | </Show>
              <a href={`/table/list/${tableName}`} class="text-sky-800">
                {tableSchema.title?.toLocaleLowerCase() ?? tableName}
              </a>
            </>}
          </For>
        </div>
        <div class="px-2 py-0.5">
          <Show when={session!.loggedIn()} fallback={
            <a href="/login" class="text-sky-800">login</a>
          }>
            {'👤' + session!.user()!.name + ' '}
            <button onClick={onLogout} class="text-sky-800">logout</button>
          </Show>
        </div>
      </nav>

    </Show>
  )
}