import { createResource, For, Show } from "solid-js";
import { parseForm } from "~/components/Form";
import { FormField } from "~/components/FormField";
import { Subtitle } from "~/components/PageTitle";
import { ColumnFilter, RecordDetails } from "~/components/RecordDetails";
import { Task } from "~/components/Task";
import { schema } from "~/schema/schema";
import { BooleanColumn } from "~/schema/type";
import { insertRecord } from "~/server/mutate.db";
import { attemptAggregateArguments, getWeighArgumentTaskData } from "~/server/weighArgument";

export default function WeighArgument() {
  const [taskData, { refetch }] = createResource(getWeighArgumentTaskData)
  const displayColumn: ColumnFilter = (colName, column, visible) => visible && colName !== 'judgement_requested'
  const formColumns = schema.tables.argument_weight.columns
  const id = () => taskData()?.argument.id
  const {optionLabels} = schema.tables.argument.columns.pro as BooleanColumn
  const isFirst = () => taskData()!.weightedArguments.length === 0

  const onSubmit = async (event: SubmitEvent & { target: Element, currentTarget: HTMLFormElement; }) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const record = parseForm(formData, formColumns)
    // TODO: authorazation
    await insertRecord( "argument_weight", {id: id(), ...record})
    await attemptAggregateArguments(taskData()?.argument.question_id)
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
      <form onSubmit={onSubmit} class="px-2 max-w-screen-sm">
        <For each={Object.keys(formColumns)}>
          {colName => (
            <FormField tableName="argument_weight" {...{ colName }} />
          )}
        </For>
        <div class="pt-2">
          <button type="submit" class="text-sky-800">
            [ Submit ]
          </button>
        </div>
      </form>
    </Task>
  )
}