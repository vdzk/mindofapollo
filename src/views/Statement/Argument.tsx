import { createAsync } from "@solidjs/router"
import { Component } from "solid-js"
import { ArgumentDetails } from "./ArgumentDetails"
import { getOneExtRecordByIdCache } from "~/client-only/query"
import { ShowRecord } from "../ShowRecord"
import { ArgumentJudgement } from "./ArgumentJudgement"

export const Argument: Component<{ id: number }> = props => {
  const record = createAsync(() => getOneExtRecordByIdCache('argument', props.id))
  return (
    <section class="flex flex-2">
      <ArgumentDetails record={record()} />
      <div class="flex-2 border-l">
        <div class="h-2" />
        <ShowRecord
          tableName="argument"
          id={props.id}
          hideSections={['details']}
          horizontalSections
        />
      </div>
      <ArgumentJudgement argumentId={props.id} record={record()} />
    </section>
  )
}