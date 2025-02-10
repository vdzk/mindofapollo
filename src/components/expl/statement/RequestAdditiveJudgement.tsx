import { Suspense } from "solid-js"
import { ExplanationComponent } from "../actions/actions"
import { Link } from "~/components/Link"

export const RequestAdditiveJudgement:ExplanationComponent = props => {
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
          label={props.historyRecord.title}
          route="show-record"
          params={{tableName: 'statement', id: props.historyRecord.id}}
        />"
      </div>
      <div>
        Check: argument agregation type of the statement is 'additive'
      </div>
      <div>Effect: judgement for the statement was requested</div>
    </Suspense>
  )
}