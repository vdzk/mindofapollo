import { Link } from "~/components/Link"
import { AddExplId, ExplComponent, ExplDiff } from "../types"
import { Subtitle } from "~/components/PageTitle"
import { DataLiteral } from "~/schema/type"
import { ExplLink } from "../ExplLink"
import { Checks } from "../Checks"

export interface ReqAdditiveJudgeExpl {
  statement: AddExplId<{title: DataLiteral}>,
  diff: ExplDiff<{judgement_requested: boolean}>
}

export const ReqAdditiveJudge: ExplComponent<ReqAdditiveJudgeExpl> = props => {
  return (<>
    <Subtitle>Summary</Subtitle>
    <div>
      The user requested judgement for the statement
      "<Link
        label={props.statement.title}
        route="show-record"
        params={{tableName: 'statement', id: props.recordId}}
      />"
      <ExplLink explId={props.statement.title_expl_id} />
    </div>
    
    <Checks items={[
      <>The argument aggregation type of the statement is 'additive'</>
    ]}/>
  </>)
}