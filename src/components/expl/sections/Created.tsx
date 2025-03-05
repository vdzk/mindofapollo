import { Show, Component } from "solid-js"
import { ExplData } from "../types"
import { RecordByTable } from "../RecordByTable"
import { ExplCrossRecord } from "../ExplCrossRecord"

export const Created: Component<ExplData> = (props) => {
  return (
    <>
      <RecordByTable records={props.insertedRecords || {}} showExplLink={false} />
      <Show when={props.insertedCrossRecord}>
        <ExplCrossRecord {...props.insertedCrossRecord!} />
      </Show>
    </>
  )
}
