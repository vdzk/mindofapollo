import { createAsync } from "@solidjs/router"
import { Component } from "solid-js"
import { ArgumentDetails } from "./ArgumentDetails"
import { getOneExtRecordByIdCache } from "~/client-only/query"
import { ShowRecord } from "../ShowRecord"

export const Argument: Component<{ id: number }> = props => {
  const record = createAsync(() => getOneExtRecordByIdCache('argument', props.id))
  return (
    <section class="pl-2 flex flex-1">
      <ArgumentDetails record={record()} />
      <div class="flex-1 border-l">
        <div class="h-2" />
        <ShowRecord
          tableName="argument"
          id={props.id}
          hideSections={['details']}
          horizontalSections
        />
      </div>
    </section>
  )
}