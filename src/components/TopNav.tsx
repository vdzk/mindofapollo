import { revalidate, useLocation, useNavigate } from "@solidjs/router";
import { Component, createSignal, For, Show, useContext } from "solid-js";
import { schema } from "~/schema";
import { logout } from "~/server/session";
import { SessionContext } from "~/SessionContext";
import { firstCap, humanCase } from "~/util";

export const TopNav: Component = () => {
  const session = useContext(SessionContext)
  const navigate = useNavigate();

  const location = useLocation();
  const showTopNav = () => location.pathname !== '/login'
  const tableNames = Object.entries(schema.tables)

  const onLogout = async () => {
    await logout()
    session!.refetch()
    revalidate(['getUser'])
  }

  const onSelectTable = (selectEl: HTMLSelectElement) => {
    if (selectEl.value) {
      navigate(`/list-records?tableName=${selectEl.value}`)
      selectEl.value = ''
    }
  }

  return (
    <Show when={showTopNav()}>
      <nav class="border-b flex justify-between">
        <div class="px-2 py-0.5">
          <select onChange={event => onSelectTable(event.target)}  class="text-gray-500">
            <option value="">Select table...</option>
            <For each={tableNames}>
              {([tableName, tableSchema]) => (
                <option value={tableName} class="text-gray-800" >
                  {firstCap(humanCase(tableSchema.plural))}
                </option>
              )}
            </For>
          </select>
        </div>
        <div class="px-2 py-0.5">
          <Show when={session!.loggedIn()} fallback={
            <a href="/login" class="text-sky-800">[ Login ]</a>
          }>
            {'👤' + session!.user()!.name + ' '}
            <button onClick={onLogout} class="text-sky-800">[ Logout ]</button>
          </Show>
        </div>
      </nav>

    </Show>
  )
}