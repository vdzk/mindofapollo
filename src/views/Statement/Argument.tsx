import { createAsync } from "@solidjs/router"
import { Component, createSignal, Match, Switch } from "solid-js"
import { ArgumentDetails } from "./ArgumentDetails"
import { getOneExtRecordByIdCache } from "~/client-only/query"
import { ShowRecord } from "../ShowRecord"
import { ArgumentJudgement } from "./ArgumentJudgement"
import { Subtitle } from "~/components/PageTitle"
import { Aggregate } from "~/components/aggregate/Aggregate"

export const Argument: Component<{
  id: number,
  firstArgOnSide: boolean,
}> = props => {
  const record = createAsync(() => getOneExtRecordByIdCache('argument', props.id))
  const [showMoreDetails, setShowMoreDetails] = createSignal(false)
  return (
    <section class="flex flex-2">
      <ArgumentDetails
        record={record()}
        showMoreDetails={showMoreDetails()}
        setShowMoreDetails={setShowMoreDetails}
      />
      <Switch>
        <Match when={showMoreDetails()}>
          <div class="flex-3 border-l">
            <div class="h-2" />
            <ShowRecord
              tableName="argument"
              id={props.id}
              hideSections={['details', 'criticism']}
              horizontalSections
            />
          </div>
        </Match>
        <Match when={!showMoreDetails()}>
          <>
            <div class="flex-2 border-l">
              <Subtitle>Crtical Questions</Subtitle>
              <Aggregate
                tableName="argument"
                id={props.id}
                aggregateName="critical_statements"
              />
            </div>
            <ArgumentJudgement
              argumentId={props.id}
              record={record()}
              firstArgOnSide={props.firstArgOnSide}
            />
          </>
        </Match>
      </Switch>
    </section >
  )
}