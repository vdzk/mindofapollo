import { createResource, For, Match, Switch } from "solid-js"
import { Detail } from "~/components/Detail"
import { parseForm } from "~/components/Form"
import { FormField } from "~/components/FormField"
import { PageTitle, Subtitle } from "~/components/PageTitle"
import { RecordDetails } from "~/components/RecordDetails"
import { Task } from "~/components/Task"
import { schema } from "~/schema/schema"
import { attemptJudgeQuestion, getJudgeCorrelationsData } from "~/server/judge"
import { insertRecordsOneByOne } from "~/server/mutate.db"

export default function JudgeCorrelations() {
  const [taskData, { refetch }] = createResource(getJudgeCorrelationsData)
  const condCols = schema.tables.argument_conditional.columns

  const onSubmit = async () => {
    const records = taskData()!.arguments
      .slice(1) // The first argument is not conditional and is not included
      .map(argument => {
        const formEl = document.querySelector(`form[data-recordId="${argument.id}"]`) as HTMLFormElement
        const formData = new FormData(formEl)
        const record = { id: argument.id, ...parseForm(formData, condCols)}
        return record
      })
    
    // TODO: authorize insertion of the correct records
    await insertRecordsOneByOne('argument_conditional', records)
    await attemptJudgeQuestion(taskData()!.question.id)
    refetch()
  }

  return (
    <Task resource={taskData}>
      <Detail
        tableName="question"
        colName="text"
        label="question"
        record={taskData()!.question}
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
        {(argument, index) => <>
          <Subtitle>Argument {index() + 1}</Subtitle>
          <Detail
            tableName="argument"
            colName="title"
            record={argument} />
          <RecordDetails
            tableName={['argument', argument.argument_type_id].join('_')}
            id={argument.id}
            displayColumn={colName => colName !== 'id'} />
          <Detail
            tableName="argument_judgement"
            colName="isolated_confidence"
            label="isolated confidence"
            record={argument} />
          <Switch>
            <Match when={index() === 0}>
              <Detail
                tableName="argument_conditional"
                colName="conditional_confidence"
                record={{conditional_confidence: argument.isolated_confidence}}
              />
              <Detail
                tableName="argument_conditional"
                colName="conditional_explanation"
                record={{conditional_explanation: "The confidence of the first argument is not conditioned on any previous arguments."}}
              />
            </Match>
            <Match when={index() > 0}>
              <form class="px-2" data-recordId={argument.id}>
                <For each={Object.keys(condCols)}>
                  {condColName => <FormField
                    tableName="argument_conditional"
                    colName={condColName}
                  />}
                </For>
              </form>
            </Match>
          </Switch>
        </>}
      </For>
      <div class="px-2 pt-2">
        <button type="button" class="text-sky-800" onClick={onSubmit}>
          [ Submit ]
        </button>
      </div>
    </Task>
  )
}