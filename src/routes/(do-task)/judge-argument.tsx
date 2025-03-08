import { createResource, For } from "solid-js"
import { createStore } from "solid-js/store"
import { FormField } from "~/components/form/FormField"
import { PageTitle } from "~/components/PageTitle"
import { ColumnFilter, RecordDetails } from "~/components/RecordDetails"
import { Task } from "~/components/Task"
import { schema } from "~/schema/schema"
import { DataRecord } from "~/schema/type"
import { Button } from "~/components/buttons"
import { getTaskJudgeArgument } from "~/api/getTask/judgeArgument"
import { submitTaskJudgeArgument } from "~/api/submitTask/judgeArgument"

export default function JudgeArgument() {
  const [diff, setDiff] = createStore<DataRecord>({})
  const [argument, { refetch }] = createResource(getTaskJudgeArgument)
  const displayColumn: ColumnFilter = (colName, column, visible) => visible && colName !== 'judgement_requested'
  const formColumns = schema.tables.argument_judgement.columns

  const onSubmit = async () => {
    await submitTaskJudgeArgument(argument()!.id, diff)
    refetch()
  }

  return (
    <Task resource={argument}>
      <PageTitle>Read argument</PageTitle>
      <RecordDetails
        tableName="argument"
        id={argument()!.id}
        {...{ displayColumn }}
      />
      <PageTitle>Make judgement</PageTitle>
      <div class="px-2 max-w-screen-sm">
        <For each={Object.keys(formColumns)}>
          { colName => (
            <FormField
              tableName="argument_judgement"
              {...{colName, diff, setDiff}}
            />
          )}
        </For>
        <div class="pt-2">
          <Button
            label="Submit"
            onClick={onSubmit}
          />
        </div>
      </div>
    </Task>
  )
}
