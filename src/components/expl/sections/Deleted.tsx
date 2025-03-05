import { Show, Component } from "solid-js"
import { ExplData } from "../types"
import { RecordByTable } from "../RecordByTable"
import { ExplCrossRecord } from "../ExplCrossRecord"

export const Deleted: Component<ExplData> = (props) => {
  return (
    <>
      <RecordByTable records={props.deletedRecords || {}} showExplLink />
      <Show when={props.deletedCrossRecord}>
        <ExplCrossRecord {...props.deletedCrossRecord!} showExplLink />
      </Show>
    </>
  )
}
