import { Suspense } from "solid-js"
import { ExplanationComponent } from "../actions/actions"
import { Link } from "~/components/Link"

export const RequestJudgement:ExplanationComponent = props => {
  return (
    <Suspense>
      <div>
        Person:
        <Link
          label={props.opUser.name}
          route="show-record"
          params={{tableName: 'person', id: props.opUser.id}}
        />
      </div>
      <div>Action: request judgement</div>
      <div>
        Target: statement
        "<Link
          label={props.historyRecord.text}
          route="show-record"
          params={{tableName: 'statement', id: props.historyRecord.id}}
        />"
      </div>
      <div>
        Check 1: statement has at least one argument
      </div>
      <div>
        Check 2: all of the statement arguments were judged
      </div>
      <div>
        Check 3: Statement can not be judged without further input. (Most likely because arguments still need to be checked for correlations.)
      </div>
      <div>Effect: judgement for the statement was requested</div>
    </Suspense>
  )
}