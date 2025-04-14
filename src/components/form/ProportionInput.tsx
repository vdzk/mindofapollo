import { debounce } from "@solid-primitives/scheduled"
import { Component, createMemo } from "solid-js"
import { proportionDecimals } from "~/util-no-circle"
import { GenericInputEvent } from "~/types"


export const percentageDecimals = proportionDecimals - Math.log10(100);

export const ProportionInput: Component<{
  value: string | undefined
  onChange: (event: GenericInputEvent) => void
  tableName: string
  colName: string
  min?: number
  max?: number
}> = (props) => {
  const proportion = () => props.value ? parseFloat(props.value) : NaN
  const displayValue = createMemo(() => isNaN(proportion())
    ? ''
    : String(Number((proportion() * 100).toFixed(percentageDecimals)))
  )
  const onUpdate = (e: GenericInputEvent) => {
    const parsedValue = parseFloat(e.target.value)
    let value
    if (isNaN(parsedValue)) {
      value = ''
    } else {
      let proportion = parsedValue / 100
      const min = props.min ?? 0
      const max = props.max ?? 1
      if (proportion < min) {
        proportion = min
      }
      if (proportion > max) {
        proportion = max
      }
      value = (proportion).toFixed(proportionDecimals)
    }
    props.onChange({ target: { name: props.colName, value } })
  }
  const onInput = debounce(onUpdate, 500)

  return (
    <>
      <input
        name={props.colName}
        type="text"
        value={displayValue()}
        onInput={onInput}
        onChange={onUpdate}
        class="pl-1 w-16 border"
        autocomplete="off"
      />
      <span class="ml-1">%</span>
    </>
  )
}