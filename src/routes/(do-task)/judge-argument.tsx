import { createResource, For } from "solid-js";
import { parseForm } from "~/components/Form";
import { FormField } from "~/components/FormField";
import { PageTitle } from "~/components/PageTitle";
import { ColumnFilter, RecordDetails } from "~/components/RecordDetails";
import { Task } from "~/components/Task";
import { schema } from "~/schema/schema";
import { getJudgeArgument } from "~/server/judge";
import { insertRecord, updateRecord } from "~/server/mutate.db";

export default function JudgeArgument() {
  const [argument, { refetch }] = createResource(getJudgeArgument)
  const displayColumn: ColumnFilter = (colName, column, visible) => visible && colName !== 'judgement_requested'
  const formColumns = schema.tables.argument_judgement.columns

  const onSubmit = async (event: SubmitEvent & { target: Element, currentTarget: HTMLFormElement; }) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const record = parseForm(formData, formColumns)
    // TODO: authorazation
    await insertRecord("argument_judgement", {id: argument()!.id, ...record})
    await updateRecord("argument", argument()!.id, {judgement_requested: false})
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
      <form onSubmit={onSubmit} class="px-2 max-w-screen-sm">
        <For each={Object.keys(formColumns)}>
          { colName => (
            <FormField tableName="argument_judgement" {...{colName}} />
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
