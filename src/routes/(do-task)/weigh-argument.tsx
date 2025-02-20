import { createResource, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { FormField } from "~/components/FormField"
import { Subtitle } from "~/components/PageTitle"
import { ColumnFilter, RecordDetails } from "~/components/RecordDetails"
import { Task } from "~/components/Task"
import { schema } from "~/schema/schema"
import { BooleanColumn, DataRecord } from "~/schema/type"
import { Button } from "~/components/buttons"
import { getTaskWeighArgument } from "~/api/getTask/weighArgument"
import { submitTaskWeighArgument } from "~/api/submitTask/weighArgument"

export default function WeighArgument() {
  const [diff, setDiff] = createStore<DataRecord>({})
  const [taskData, { refetch }] = createResource(getTaskWeighArgument)
  const displayColumn: ColumnFilter = (colName, column, visible) => visible && colName !== 'judgement_requested'
  const formColumns = schema.tables.argument_weight.columns
  const id = () => taskData()?.argument.id
  const {optionLabels} = schema.tables.argument.columns.pro as BooleanColumn
  const isFirst = () => taskData()!.weightedArguments.length === 0

  const onSubmit = async () => {
    await submitTaskWeighArgument(id()!, diff)
    refetch()
  }

  return (
    <Task resource={taskData}>
      <Show when={!isFirst()}>
        <Subtitle>Weighted Arguments</Subtitle>
        <div class="px-2 pb-2">
          <table>
            <tbody>
              <tr>
                <th>argument</th>
                <th>side</th>
                <th>L</th>
                <th>M</th>
                <th>U</th>
              </tr>
              <For each={taskData()?.weightedArguments}>
                {wArg => (
                  <tr>
                    <td>{wArg.title}</td>
                    <td>{optionLabels![Number(wArg.pro)]}</td>
                    <td>{wArg.weight_lower_limit}</td>
                    <td>{wArg.weight_mode}</td>
                    <td>{wArg.weight_upper_limit}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
      <Subtitle>Read Argument</Subtitle>
      <RecordDetails
        tableName="argument"
        id={id()}
        {...{ displayColumn }}
      />
      <Subtitle>Weigh Argument</Subtitle>
      <div class="px-2 max-w-screen-sm">
        <For each={Object.keys(formColumns)}>
          {colName => (
            <FormField
              tableName="argument_weight"
              {...{ colName, diff, setDiff }}
            />
          )}
        </For>
        <div class="pt-2">
          <Button
            onClick={onSubmit}
            label="Submit"
          />
        </div>
      </div>
    </Task>
  )
}
