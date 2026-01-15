import { createMediaQuery } from "@solid-primitives/media"
import { Title } from "@solidjs/meta"
import { createAsync, revalidate, useSearchParams } from "@solidjs/router"
import { createMemo, For, Match, Show, Switch, useContext } from "solid-js"
import { listRecordsCache } from "~/client-only/query"
import { Form } from "~/components/form/Form"
import { Link } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { H2, Subtitle } from "~/components/PageTitle"
import { SessionContext } from "~/SessionContext"
import { ColumnCtx, columns } from "~/views/Debate/columns"
import { getDebateStatus } from "~/views/Debate/Debate"

export type DebateTabId = 'create' | 'invite' | 'ongoing' | 'closed'

export default function Debates() {
  const session = useContext(SessionContext)
  const userId = () => session?.userSession?.()?.userId

  const allDebates = createAsync(() => listRecordsCache('debate', true))
  const [searchParams, setSearchParams] = useSearchParams()

  const tabId = () => (searchParams.tabId as DebateTabId | undefined) ?? 'ongoing'

  const debates = () => {
    const _tabId = tabId()
    const _allDebates = allDebates()
    if (_tabId && _allDebates && ['invite', 'ongoing', 'closed'].includes(_tabId)) {
      return _allDebates.filter(debate => getDebateStatus(debate) === _tabId)
    }
    return []
  }

  const deltas = createMemo(() => {
    const _allDebates = allDebates()
    if (!_allDebates) return {}
    const result: Record<number, number> = {}
    for (const debate of _allDebates) {
      if (getDebateStatus(debate) !== 'ongoing') continue
      result[debate.id] = (debate.current_value as number) - (debate.threshold_value as number)
    }
    return result
  })

  const onFormExit = (savedId?: number) => {
    if (savedId) revalidate(listRecordsCache.keyFor('debate', true))
    setSearchParams({ tabId: 'invite' })
  }

  const visibleColumns = createMemo(() => columns.filter(c => c.showWhen(tabId())))

  const gridColsClass = createMemo(() => {
    const n = Math.max(0, visibleColumns().length - 1)
    return `grid-cols-[minmax(0,1fr)_repeat(${n},minmax(min-content,max-content))]`
  })

  const ctx = createMemo<ColumnCtx>(() => ({
    tabId: tabId(),
    userId: userId(),
    deltas: deltas()
  }))

  const showColumns = createMediaQuery('(min-width: 640px)')

  return (
    <main>
      <Title>Debates</Title>
      <div class="border-b flex flex-wrap items-center justify-between">
        <Subtitle>⚔️ Debates</Subtitle>
        <MasterDetail
          options={[
            { id: 'create', label: '➕ New' },
            { id: 'invite', label: 'Invites' },
            { id: 'ongoing', label: 'Ongoing' },
            { id: 'closed', label: 'Finished' }
          ]}
          class="pr-1 flex-none"
          pills
          selectedId={tabId()}
          onChange={id => setSearchParams({ tabId: id })}
        />
      </div>

      <Switch>
        <Match when={tabId() === 'create'}>
          <H2>Propose a new debate</H2>
          <div>
            <Form tableName="debate" exitSettings={{ onExit: onFormExit }} />
          </div>
        </Match>

        <Match when={['invite', 'ongoing', 'closed'].includes(tabId()!)}>
          <Show when={showColumns()}>
            <div class={`grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(min-content,max-content))] w-full`}>
              <div class="grid gap-x-4 grid-cols-subgrid col-span-full border-b px-2 py-2 font-semibold">
                <For each={visibleColumns()}>
                  {col => <div title={col.description}>{col.label}</div>}
                </For>
              </div>

              <For each={debates()}>
                {debate => (
                  <Link
                    type="unstyled"
                    class="grid grid-cols-subgrid col-span-full
                      gap-x-4
                    hover:bg-orange-200 px-2 py-2 border-b"
                    route="debate"
                    params={{ id: debate.id }}
                  >
                    <For each={visibleColumns()}>
                      {col => (
                        <div>
                          {col.getCell(debate, ctx())}
                        </div>
                      )}
                    </For>
                  </Link>
                )}
              </For>
            </div>
          </Show>
          <Show when={!showColumns()}>
            <For each={debates()}>
              {debate => (
                <Link
                  type="unstyled"
                  class="block hover:bg-orange-200 px-2 py-2 border-b"
                  route="debate"
                  params={{ id: debate.id }}
                >
                  <For each={visibleColumns()}>
                    {col => (
                      <div class="flex">
                        <span
                          class="font-bold inline-block min-w-22 text-right mr-2"
                          title={col.description}
                        >
                          {col.label}:
                        </span>
                        <span>{col.getCell(debate, ctx())}</span>
                      </div>
                    )}
                  </For>
                </Link>
              )}
            </For>
          </Show>
        </Match>
      </Switch>
    </main>
  )
}