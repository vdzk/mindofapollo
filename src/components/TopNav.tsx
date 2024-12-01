import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import { Component, For, Show, useContext } from "solid-js";
import { schema } from "~/schema/schema";
import { login, logout } from "~/server/session";
import { SessionContext } from "~/SessionContext";
import { firstCap, pluralTableName, titleColumnName } from "~/util";
import { IoPersonSharp } from 'solid-icons/io'
import { listRecords } from "~/server/select.db";

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
  
  const persons = createAsync(() => listRecords('person'))

  const onPersonChange = async (userId: number) => {
    if (userId) {
      await login(userId)
    } else {
      await logout()
    }
    session!.refetch()
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
          <a href="/home-page"  class="ml-1 text-sky-800">[ Home ]</a>
          <Show when={session!.loggedIn()}>
            <a href="/tasks"  class="ml-1 text-sky-800">[ Tasks ]</a>
          </Show>
        </div>
        <div class="px-2 py-0.5">
          <IoPersonSharp size={15} class="inline mr-1" />
          <select onChange={event => onPersonChange(parseInt(event.target.value))}>
            <option value="0" selected={session!.loggedIn()}>Anonymous</option>
            <For each={persons()}>
              {(person) => (
                <option
                  value={person.id}
                  class="text-gray-800"
                  selected={person.id === session?.user()?.id}
                >
                  {person.name}
                </option>
              )}
            </For>
          </select>
        </div>
      </nav>

    </Show>
  )
}
