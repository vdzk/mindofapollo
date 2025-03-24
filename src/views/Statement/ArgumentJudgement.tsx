import { createAsync } from "@solidjs/router"
import { Component, Match, Show, Switch } from "solid-js"
import { hasUndecidedCriticalStatement } from "~/api/has/undecidedCriticalStatement"
import { Subtitle } from "~/components/PageTitle"
import { DataRecordWithId } from "~/schema/type"

export const ArgumentJudgement: Component<{
  argumentId: number,
  record?: DataRecordWithId
}> = props => {
  const hasUndecided = createAsync(() => hasUndecidedCriticalStatement( props.argumentId))
  return (
    <div class="border-l flex-1">
      <Subtitle>Judgement</Subtitle>
      <Switch>
        <Match when={!props.record?.open_for_judgement && hasUndecided()}>
          <div class="px-2">Certaininty in some of the critical statments has not yet been decided.</div>
        </Match>
      </Switch>
    </div>
  )
}