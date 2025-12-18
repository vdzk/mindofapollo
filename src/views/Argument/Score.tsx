import { createAsync } from "@solidjs/router";
import { Component } from "solid-js";
import { getOneRecordByIdCache } from "~/client-only/query";
import { DataRecordWithId } from "~/schema/type";
import { StatementType } from "~/tables/statement/statement_type";
import { getPercent } from "~/utils/string";

export const Score: Component<{
  id: number,
  statementType?: StatementType,
  record?: DataRecordWithId
}> = props => {
  const argumentWeightRecord = createAsync(async () =>
    (props.statementType === 'threshold')
      ? getOneRecordByIdCache('argument_weight', props.id, true)
      : undefined
  )
  const strengthStr = () => {
    let valueStr
    if (props.statementType === 'threshold') {
      const awr = argumentWeightRecord()
      if (awr) {
        valueStr = [
          awr.weight_lower_limit,
          awr.weight_mode,
          awr.weight_upper_limit
        ].join('/')
      } else {
        valueStr = '?'
      }
    } else if (props.statementType === 'descriptive') {
      valueStr = getPercent(props.record?.strength as number | undefined)
    } else {
      return null
    }
    return `[${valueStr}]`
  }
  const tooltip = () => {
    if (props.statementType === 'threshold') {
      return "lower limit, mode and upper limit weights"
    } else {
      return "argument strength score"
    }
  }
  return (
    <div
      class="text-xl font-bold px-2 py-2"
      title={tooltip()}
    >
      {strengthStr()}
    </div>
  )
}