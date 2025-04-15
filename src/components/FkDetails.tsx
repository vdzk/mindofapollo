import { Component, createSignal, Show } from "solid-js"
import { ForeignKey } from "~/schema/type"
import { Button } from "./buttons"
import { getToggleLabel } from "~/utils/string"
import { nestedBgColor } from "./NestPanel"
import { RecordDetails } from "./RecordDetails"

export const FkDetails: Component<{
  fk: ForeignKey['fk']
  fkId: number
  depth?: number
}> = (props) => {
  const [showRecord, setShowRecord] = createSignal(false)
  return (
    <>
      <Button
        label={getToggleLabel(showRecord(), 'details')}
        onClick={() => setShowRecord(x => !x)}
      />
      <Show when={showRecord()}>
        <div
          class="rounded-md my-2 pt-2"
          classList={{ [nestedBgColor(props.depth)]: true }}
        >
          <RecordDetails
            tableName={props.fk.table}
            id={props.fkId}
            showAggregates={false}
            showExplLinks={false}
            displayColumn={(colName) => colName !== props.fk.labelColumn}
          />
        </div>
      </Show>
    </>
  )
}