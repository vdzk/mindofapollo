import { Component, createResource, For, Match, Switch } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"
import { Detail } from "~/components/details"
import { FormField } from "~/components/FormField"
import { PageTitle, Subtitle } from "~/components/PageTitle"
import { RecordDetails } from "~/components/RecordDetails"
import { Task } from "~/components/Task"
import { schema } from "~/schema/schema"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { getTaskJudgeCorrelations, submitTaskJudgeCorrelations } from "~/api/do-task/judge-correlations"
import { Button } from "~/components/buttons";

const CorrelationForm: Component<{
  argument: DataRecordWithId
  diffs: Record<number, DataRecord>
  setDiffs: SetStoreFunction<Record<number, DataRecord>>
  index: number
}> = props => {
  const id = () => props.argument.id
  props.setDiffs(id(), {})
  const [diff, setDiff] = createStore<DataRecord>(props.diffs[id()])
  const condCols = schema.tables.argument_conditional.columns

  return (
    <>
      <Subtitle>Argument {props.index + 1}</Subtitle>
      <Detail
        tableName="argument"
        colName="title"
        record={props.argument} />
      <RecordDetails
        tableName={['argument', props.argument.argument_type_id].join('_')}
        id={props.argument.id}
        displayColumn={colName => colName !== 'id'} />
      <Detail
        tableName="argument_judgement"
        colName="isolated_confidence"
        label="isolated confidence"
        record={props.argument} />
      <Switch>
        <Match when={props.index === 0}>
          <Detail
            tableName="argument_conditional"
            colName="conditional_confidence"
            record={{ conditional_confidence: props.argument.isolated_confidence }}
          />
          <Detail
            tableName="argument_conditional"
            colName="conditional_explanation"
            record={{ conditional_explanation: "The confidence of the first argument is not conditioned on any previous arguments." }}
          />
        </Match>
        <Match when={props.index > 0}>
          <div class="px-2" data-recordId={props.argument.id}>
            <For each={Object.keys(condCols)}>
              {condColName => <FormField
                tableName="argument_conditional"
                colName={condColName}
                {...{diff, setDiff}}
              />}
            </For>
          </div>
        </Match>
      </Switch>
    </>
  )
}

export default function JudgeCorrelations() {
  const [diffs, setDiffs] = createStore<Record<number, DataRecord>>({})
  const [taskData, { refetch }] = createResource(getTaskJudgeCorrelations)

  const onSubmit = async () => {
    const records = taskData()!.arguments
      .slice(1) // The first argument is not conditional and is not included
      .map(argument => diffs[argument.id])
    await submitTaskJudgeCorrelations(taskData()!.statement.id, records)
    refetch()
  }

  return (
    <Task resource={taskData}>
      <Detail
        tableName="statement"
        colName="text"
        label="statement"
        record={taskData()!.statement}
      />
      <Detail
        tableName="argument"
        colName="pro"
        record={{ pro: taskData()!.pro }}
      />
      <PageTitle>Instructions</PageTitle>
      <div class="px-2">
        Start with the strongest argument (A₁). Imagine if all of the arguments that you have considered so far have failed, how much confidence in the conclusion will the next argument Aₙ give AFₙ? AFₙ can not accede Aₙ.
      </div>
      <For each={taskData()?.arguments}>
        {(argument, index) => <CorrelationForm
          {...{argument, diffs, setDiffs}}
          index={index()}
        />}
      </For>
      <div class="px-2 pt-2">
        <Button
          label="Submit"
          onClick={onSubmit}
        />
      </div>
    </Task>
  )
}
