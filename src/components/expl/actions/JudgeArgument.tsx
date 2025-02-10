import { Suspense } from "solid-js"
import { TraceBtn } from "~/components/buttons"
import { ExplComponent } from "../types"

export interface JudgeArgumentExpl {

}

export const JudgeArgument: ExplComponent<JudgeArgumentExpl> = props => {
  return (
    <Suspense>
      <div>Action 1: the user goes to "judge arguments" tasks</div>
      <div>
        Action 2: system randomly selectes among arguments for which judgment was requested
        <TraceBtn onClick={() => props.trace({
          tableName: 'argument',
          id: props.historyRecord.id as number,
          colName: 'judgement_requested'
        })} />
        but not yet given
      </div>
      <div>Action 3: the user judges argument</div>
      <div>TODO: add details of the argument and the judgement?</div>
    </Suspense>
  )
}