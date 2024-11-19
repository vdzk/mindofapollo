import { revalidate, useLocation, useNavigate } from "@solidjs/router";
import { Component, For, Show, useContext } from "solid-js";
import { schema } from "~/schema/schema";
import { logout } from "~/server/session";
import { SessionContext } from "~/SessionContext";
import { firstCap, pluralTableName, titleColumnName } from "~/util";
import { IoPersonSharp } from 'solid-icons/io'

export const TopNav: Component = () => {
  const session = useContext(SessionContext)
  const navigate = useNavigate();

  const location = useLocation();
  const showTopNav = () => location.pathname !== '/login'
  const tableNames = Object.entries(schema.tables)
    .filter(([tableName, tableSchema]) =>
      tableSchema.columns[titleColumnName(tableName)].type !== 'fk'
      && !tableSchema.extendsTable
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tableName]) => tableName)

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
              {(tableName) => (
                <option value={tableName} class="text-gray-800" >
                  {firstCap(pluralTableName(tableName))}
                </option>
              )}
            </For>
          </select>
          <Show when={session!.loggedIn()}>
            <a href="/tasks"  class="ml-1 text-sky-800">[ Tasks ]</a>
          </Show>
        </div>
        <div class="px-2 py-0.5">
          <Show when={session!.loggedIn()} fallback={
            <a href="/login" class="text-sky-800">[ Login ]</a>
          }>
            <IoPersonSharp size={15} class="inline mr-1" />
            {session!.user()!.name}
            <button onClick={onLogout} class="ml-1 text-sky-800">[ Logout ]</button>
          </Show>
        </div>
      </nav>

    </Show>
  )
}
