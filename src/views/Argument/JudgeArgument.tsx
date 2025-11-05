import { Component, createSignal, For, Show } from "solid-js"
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
import { UserExplField } from "~/components/form/UserExplField"
import { getErrorResponse } from "~/components/form/saveAction"

const judgeArgumentAction = action(async (
  argumentId: number,
  diff: DataRecord,
  exists: boolean,
  userExpl: string
) => {
  try {
    if (exists) {
      await updateRecord('argument_judgement', argumentId, diff, userExpl)
    } else {
      await insertRecord('argument_judgement', { ...diff, id: argumentId })
    }
  } catch (error) {
    return getErrorResponse(error)
  }
  return json({ ok: true }, {
    revalidate: [
      getOneRecordByIdCache.keyFor('argument_judgement', argumentId)
    ]
  })
})

export const JudgeArgument: Component<{
  argumentId: number
  argumentTypeId: number
  onExit: () => void
  judgement?: DataRecordWithId
}> = props => {
  const [diff, setDiff] = createStore<DataRecord>({})
  const [userExpl, setUserExpl] = createSignal('')
  const [saving, setSaving] = createSignal(false)
  const [saveError, setSaveError] = createSignal('')

  const newJudgementColNames = () => Object
    .keys(schema.tables.argument_judgement.columns)
    .filter(colName => colName !== 'label')
  const judgeArgument = useAction(judgeArgumentAction)
  const exists = () => !!props.judgement

  const onSubmit = async () => {
    setSaveError('')
    setSaving(true)
    const response = await judgeArgument(props.argumentId, diff, exists(), userExpl())
    if ('error' in response) {
      setSaveError(response.error)
      setSaving(false)
    } else {
      props.onExit()
    }
  }

  return (
    <>
      <Show when={exists()}>
        <H2>Current Judgement</H2>
        <RecordDetails
          tableName="argument_judgement"
          id={props.judgement!.id}
          displayColumn={colName => colName !== 'label'}
        />
        <div class="border-t" />
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
        <Show when={exists()}>
          <UserExplField value={userExpl()} onChange={setUserExpl} />
        </Show>
        <div class="pb-2 text-yellow-600">
          {saveError()}
        </div>
        <div class="flex gap-2">
          <Button
            label={saving() ? 'Saving…' : "Submit"}
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

