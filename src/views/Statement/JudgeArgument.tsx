import { Component, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { FormField } from "~/components/form/FormField"
import { schema } from "~/schema/schema"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { Button } from "~/components/buttons"
import { action, json, useAction } from "@solidjs/router"
import { getOneRecordByIdCache } from "~/client-only/query"
import { RecordDetails } from "~/components/RecordDetails"
import { H2 } from "~/components/PageTitle"
import { insertRecord } from "~/api/insert/record"
import { updateRecord } from "~/api/update/record"

const judgeArgumentAction = action(async (
  argumentId: number,
  diff: DataRecord,
  exists: boolean
) => {
  if (exists) {
    await updateRecord('argument_judgement', argumentId, diff)
  } else {
    await insertRecord('argument_judgement', { ...diff, id: argumentId })
  }
  return json('ok', {
    revalidate: [
      getOneRecordByIdCache.keyFor('argument_judgement', argumentId)
    ]
  })
})

export const JudgeArgument: Component<{
  argumentId: number,
  onExit: () => void,
  currentJudgement?: DataRecordWithId
}> = props => {
  const [diff, setDiff] = createStore<DataRecord>({})
  const newJudgementColNames = () => Object
    .keys(schema.tables.argument_judgement.columns)
    .filter(colName => !['label', 'dismissal_explanation'].includes(colName))
  const judgeArgument = useAction(judgeArgumentAction)

  const onSubmit = async () => {
    await judgeArgument(props.argumentId, diff, !!props.currentJudgement)
    props.onExit()
  }

  return (
    <>
      <Show when={props.currentJudgement}>
        <div class="border-t"/>
        <H2>Current Judgement</H2>
        <RecordDetails
          tableName="argument_judgement"
          id={props.currentJudgement!.id}
          displayColumn={colName => !['label', 'dismissal_explanation'].includes(colName)}
        />
        <div class="px-2">
          <FormField
            tableName="argument_judgement"
            colName="dismissal_explanation"
            {...{ diff, setDiff }}
          />
        </div>
        <div class="border-t"/>
        <H2>New Judgement</H2>
      </Show>
      <div class="px-2 pb-2">
        <For each={newJudgementColNames()}>
          {colName => (
            <FormField
              tableName="argument_judgement"
              {...{ colName, diff, setDiff }}
            />
          )}
        </For>
        <div class="pt-2 flex gap-2">
          <Button
            label="Submit"
            onClick={onSubmit}
          />
          <Button
            label="Cancel"
            onClick={() => props.onExit()}
          />
        </div>
      </div>
    </>
  )
}

