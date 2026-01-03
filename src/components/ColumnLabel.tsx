import { Component, createSignal, Show } from "solid-js"
import { schema } from "~/schema/schema"
import { getToggleLabel, humanCase } from "~/utils/string"
import { Button } from "./buttons"

export const ColumnLabel: Component<{
  tableName: string
  colName: string
  label?: string
  suffix?: string
  ofInput?: boolean
}> = (props) => {
  const [showInstructions, setShowInstructions] = createSignal(false)

  const labelText = () => {
    const table = schema.tables[props.tableName]
    if (props.label) return props.label
    if (props.colName === 'id') {
      if (table.extendsTable) {
        return humanCase(table.extendsTable)
      } else {
        return 'ID'
      }
    }
    const column = table.columns[props.colName]
    if (!column) return props.colName
    if (column.label) return column.label
    if (column.type === 'fk') return column.fk.table
    return props.colName
  }
  const instructions = () => schema.tables[props.tableName].columns[props.colName]?.instructions

  return (
    <>
      <div class="flex justify-between">
        <div class="font-bold first-letter:uppercase">
          {humanCase(labelText())}{props.suffix}
        </div>
        <Show when={props.ofInput && instructions()}>
          <Button
            label={showInstructions()
              ? <img class="w-4 h-4" src="/icons/minus.svg" />
              : <img class="w-4 h-4" src="/icons/info.svg" />
            }
            tooltip="instructions"
            class="relative bottom-1 ml-2"
            onClick={() => setShowInstructions(x => !x)}
          />
        </Show>
      </div>
      <Show when={showInstructions()}>
        <div>{instructions()}</div>
      </Show>
    </>
  )
}
