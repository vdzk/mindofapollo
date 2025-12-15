import { revalidate } from "@solidjs/router"
import { Component } from "solid-js"
import { listForeignRecordsCache } from "~/client-only/query"
import { Form } from "~/components/form/Form"
import { defaultArgumentTypeId } from "~/constant"

export const CreateArgument: Component<{
  id: number,
  setSectionId: (sectionId?: string) => void
}> = props => {

  const onFormExit = (id?: number) => {
    if (id) {
      revalidate(listForeignRecordsCache.keyFor('argument', 'statement_id', props.id))
    }
    props.setSectionId('arguments')
  }
  return (
    <div class="flex-1 flex">
      <Form
        tableName="argument"
        preset={{
          statement_id: props.id,
          argument_type_id: defaultArgumentTypeId
        }}
        preserveDiffOnPresetChange
        exitSettings={{ onExit: onFormExit }}
        hideColumns={['statement_id', 'argument_type_id']}
      />
    </div>
  )
}