import { createAsync, revalidate } from "@solidjs/router"
import { Component, createMemo, createSignal, For, Show, useContext } from "solid-js"
import { deleteBet } from "~/api/delete/bet"
import { opposeBet } from "~/api/execute/opposeBet"
import { listRecordsCache } from "~/client-only/query"
import { Button } from "~/components/buttons"
import { Form } from "~/components/form/Form"
import { Subtitle } from "~/components/PageTitle"
import { tableStyle } from "~/components/table"
import { SessionContext } from "~/SessionContext"
import { BetRow } from "./BetRow"
import { MasterDetail } from "~/components/MasterDetail"

export type BetStatus = 'open' | 'matched'

export const Bets: Component = () => {
  const session = useContext(SessionContext)
  const authenticated = () => !!session?.userSession?.()?.authenticated
  const userId = () => session?.userSession?.()?.userId
  const bets = createAsync(() => listRecordsCache('bet', true))
  const [showForm, setShowForm] = createSignal(false)
  const [status, setStatus] = createSignal<BetStatus>('open')
  const filteredBets = createMemo(() => (bets() ?? []).filter(
    bet => (status() === 'open' && !bet.taker_id)
     || (status() === 'matched' && !!bet.taker_id)
  ))

  const refreshBets = () => revalidate(listRecordsCache.keyFor('bet', true))

  const onFormExit = async (savedId?: number) => {
    setShowForm(false)
    if (savedId) {
      await refreshBets()
    }
  }

  const onOppose = async (betId: number) => {
    await opposeBet(betId)
    await refreshBets()
  }

  const onDelete = async (betId: number) => {
    await deleteBet(betId)
    await refreshBets()
  }

  return (
    <div class="pt-2 pl-2 w-4xl">
      <div class="flex py-3 justify-between">
        <Subtitle>⚔️ Bets</Subtitle>
        <MasterDetail
          options={[
            { id: 'open', label: 'open' },
            { id: 'matched', label: 'matched' },
          ]}
          selectedId={status()}
          onChange={setStatus}
          optionsClass="p-0 mb-0"
          class="pl-2 flex-initial"
          horizontal
        />
      </div>
      <table class="mb-4 w-full">
        <thead>
          <tr class={tableStyle.tHeadTr}>
            <For each={[
              {
                text: 'Statement'
              },
              {
                text: 'Position',
                tooltip: "Condition under which the creator will win the bet"
              },
              {
                text: 'Duration',
                tooltip: "The competion starts when somebody takes the bet. At the end of this period Apollo's opinion about the statement will determine the outcome of the bet."
              },
              {
                text: 'Stake',
                tooltip: "CC = competition credits"
              },
              { text: 'Creator' },
              ...(status() === 'matched' ? [
                { text: 'Taker' },
                { text: 'Start date'}
              ] : []),
              ...(authenticated() && status() === 'open' ? [
                { text: 'Action' }
              ] : [])
            ]}>
              {(header, index) => (
                <th
                  class={tableStyle.th + (index() === 0 ? ' pl-2' : '')}
                  title={header.tooltip}
                >
                  {header.text}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={filteredBets()}>
            {bet => <BetRow
              {...{ bet, onOppose, onDelete }}
              userId={userId()}
              authenticated={authenticated()}
              status={status()}
            />}
          </For>
        </tbody>
      </table>
      <Show when={authenticated()}>
        <div class="max-w-lg">
          <Show when={!showForm()}>
            <div class="px-2">
              <Button
                label={showForm() ? "Cancel" : "+ Create a bet"}
                onClick={() => setShowForm(x => !x)}
              />
            </div>
          </Show>
          <Show when={showForm()}>
            <div class="bg-orange-100 rounded-md p-2 pt-4 mx-2">
              <Form
                tableName="bet"
                exitSettings={{ onExit: onFormExit }}
                depth={1}
              />
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}