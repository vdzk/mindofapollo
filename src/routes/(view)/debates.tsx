import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { createSignal, For, Match, Switch } from "solid-js"
import { listRecordsCache } from "~/client-only/query"
import { Form } from "~/components/form/Form"
import { Link } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { H2, Subtitle } from "~/components/PageTitle"
import { getTextFromLabel, getConfidenceFromLabel } from "~/tables/statement/statement"
import { getPercent } from "~/utils/string";

export default function Debates() {
  const debates = createAsync(() => listRecordsCache('debate', true))
  const [tabId, setTabId] = createSignal<string | undefined>('ongoing')
  const onFormExit = (savedId?: number) => {
    setTabId('open')
  }

  return (
    <main>
      <Title>Debate</Title>
      <div class="border-b flex  items-center justify-between">
        <Subtitle>⚔️ Debates</Subtitle>
        <MasterDetail
          options={[
            { id: 'create', label: '➕ New' },
            { id: 'open', label: 'Open' },
            { id: 'ongoing', label: 'Ongoing' },
            { id: 'closed', label: 'Closed' },
            { id: 'about', label: 'About' }
          ]}
          class="pr-1 flex-none"
          pills
          selectedId={tabId()}
          onChange={setTabId}
        />
      </div>
      <Switch>
        <Match when={tabId() === 'create'}>
          <H2>
            Propose a new debate
          </H2>
          <div>
            <Form
              tableName="debate"
              exitSettings={{ onExit: onFormExit }}
            />
          </div>
        </Match>
        <Match when={['open', 'ongoing', 'closed'].includes(tabId()!)}>
          <div class="grid grid-cols-[minmax(max-content,5fr)_repeat(3,minmax(max-content,1fr))] w-full">
            <div class="grid grid-cols-subgrid col-span-full border-b px-2 py-2 font-semibold">
                <div>Claim</div>
                <div>Now</div>
                <div>Goal</div>
                <div>Opponent</div>
            </div>
              <For each={debates()}>
                {debate => (
                  <Link
                    type="unstyled"
                    class="grid grid-flow-col grid-cols-subgrid col-span-full hover:bg-orange-200 px-2 py-2 border-b"
                    route="debate"
                    params={{id: debate.id}}
                  >
                    <div>
                      {getTextFromLabel(debate.statement_label as string)}
                    </div>
                    <div>
                      {debate.extTableName === 'debate_confidence'
                        ? getConfidenceFromLabel(debate.statement_label as string)
                        : 'calculating...'
                      }
                    </div>
                    <div>
                      {debate.creator_above ? '< ' : '> '}
                      {debate.extTableName === 'debate_confidence'
                        ? getPercent(debate.threshold_value as number)
                        : debate.threshold_value
                      }
                    </div>
                    <div>
                      {debate.creator_name}
                    </div>
                  </Link>
                )}
              </For>
          </div>
        </Match>
      </Switch>
    </main>
  )
}