import { useNavigate } from "@solidjs/router";
import { Component, For, Match, Show, Switch, useContext } from "solid-js";
import { schema } from "~/schema/schema";
import { logout } from "~/api/shared/session";
import { SessionContext } from "~/SessionContext";
import { firstCap, pluralTableName, titleColumnName, useIsPublicRoute } from "~/util";
import { IoPersonSharp } from 'solid-icons/io'

export const TopNav: Component = () => {
  const session = useContext(SessionContext)
  const navigate = useNavigate()
  const isPublicRoute = useIsPublicRoute()

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
    navigate('/')
  }

  const onSelectTable = (selectEl: HTMLSelectElement) => {
    if (selectEl.value) {
      navigate(`/list-records?tableName=${selectEl.value}`)
      selectEl.value = ''
    }
  }

  return (
    <Show when={!isPublicRoute()}>
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
          <a href="/home-page"  class="ml-1 text-sky-800">[ Home ]</a>
          <Show when={session!.loggedIn()}>
            <a href="/list-tasks"  class="ml-1 text-sky-800">[ Tasks ]</a>
            <a href="/show-directive"  class="ml-1 text-sky-800">[ Directives ]</a>
            <a href="/list-records?tableName=invite" class="ml-1 text-sky-800">[ Invites ]</a>
          </Show>
        </div>
        <div class="px-2 py-0.5">
          <Switch>
            <Match when={session!.loggedIn()}>
              <IoPersonSharp size={15} class="inline mr-1" />
              {session!.user()?.name}
              <button
                class="text-sky-800 pl-2"
                onClick={onLogout}
              >
                [ Logout ]
              </button>
            </Match>
            <Match when>
              <a class="text-sky-800" href="/login">[ Login ]</a>
            </Match>
          </Switch>
        </div>
      </nav>
    </Show>
  )
}
