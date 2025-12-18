import { Component, createSignal, For, Match, Switch } from "solid-js"
import { Button } from "~/components/buttons"
import { Subtitle } from "~/components/PageTitle"
import { firstCap } from "~/utils/string"
import { StatementType } from "~/tables/statement/statement_type"
import { Form } from "~/components/form/Form"
import { createAsync } from "@solidjs/router"
import { getOneRecordByIdCache } from "~/client-only/query"

const actions = ['attack', 'support', 'critique', 'improve', 'score'] as const
type Action = typeof actions[number]

export const HowTo: Component<{
  id: number,
  statementType?: StatementType
}> = props => {
  const [selectedAction, setSelectedAction] = createSignal<Action>()
  const argumentWeightRecord = createAsync(async () =>
    (props.statementType === 'threshold')
      ? getOneRecordByIdCache('argument_weight', props.id, true)
      : undefined
  )
  return (
    <div class="flex-2 border-l">
      <div class='border-b'>
        <Subtitle>How To</Subtitle>
      </div>
      <Switch>
        <Match when={selectedAction() === 'score'}>
          <Switch>
            <Match when={props.statementType === 'threshold'}>
              <div class="h-2" />
              <Form
                tableName="argument_weight"
                id={argumentWeightRecord()?.id}
                record={argumentWeightRecord()}
                preset={argumentWeightRecord()
                  ? undefined : { id: props.id }}
                exitSettings={{ onExit: () => setSelectedAction() }}
              />
            </Match>
          </Switch>
        </Match>
        <Match when>
          <div class="px-2 pt-2">
            What would you like to do with this argument?
          </div>
          <div class="px-2 py-2 flex flex-col gap-2 items-start">
            <For each={actions}>
              { action => (
                <Button
                  label={firstCap(action)}
                  onClick={() => setSelectedAction(action)}
                />
              )}
            </For>
          </div>
        </Match>
      </Switch>
    </div>
  )
}