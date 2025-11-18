import { Title } from "@solidjs/meta"
import { createAsync, revalidate } from "@solidjs/router"
import { createSignal, For, Show } from "solid-js"
import { listRecordsCache } from "~/client-only/query"
import { Button } from "~/components/buttons"
import { Form } from "~/components/form/Form"
import { Link } from "~/components/Link"
import { PageTitle, Subtitle } from "~/components/PageTitle"
import { tableStyle } from "~/components/table"

export default function CompeteToConvince() {
  const bets = createAsync(() => listRecordsCache('bet'))
  const [showForm, setShowForm] = createSignal(false)

  const onFormExit = async (savedId?: number) => {
    setShowForm(false)
    if (savedId) {
      await revalidate(listRecordsCache.keyFor('bet'))
    }
  }

  return (
    <main>
      <Title>Compete to convince</Title>
      <PageTitle>Compete to convince</PageTitle>
      <Subtitle>Bets</Subtitle>
      <table class="mb-4">
        <thead>
          <tr class={tableStyle.tHeadTr}>
            <th class={tableStyle.th + ' pl-2'}>Statement</th>
            <th class={tableStyle.th}>Stake</th>
            <th class={tableStyle.th}>Creator</th>
          </tr>
        </thead>
        <tbody>
          <For each={bets()}>
            {bet => (
              <tr>
                <td class={tableStyle.td + ' pl-2'}>
                  <Link
                    route="show-record"
                    params={{
                      tableName: 'statement',
                      id: bet.statement_id
                    }}
                    label={bet.statement_label}
                  />
                </td>
                <td class={tableStyle.td}>
                  {bet.stake} CC
                </td>
                <td class={tableStyle.td}>
                  <Link
                    route="show-record"
                    params={{
                      tableName: 'person',
                      id: bet.creator_id
                    }}
                    label={bet.creator_name}
                  />
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <div class="max-w-lg">
        <Show when={!showForm()}>
          <div class="px-2">
            <Button
              label={showForm() ? "Cancel" : "Create a bet"}
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
    </main>
  )
}