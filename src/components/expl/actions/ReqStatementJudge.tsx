import { Link } from "~/components/Link"
import { AddExplId, ExplComponent, ExplDiff } from "../types"
import { Subtitle } from "~/components/PageTitle"
import { DataLiteral } from "~/schema/type"
import { ExplLink } from "../ExplLink"
import { Checks } from "../Checks"

export interface ReqStatementJudgeExpl {
  statement: AddExplId<{text: DataLiteral}>,
  judged_expl_id?: number,
  diff?: ExplDiff<{judgement_requested: boolean}>
}

export const ReqStatementJudge: ExplComponent<ReqStatementJudgeExpl> = props => {
  return (<>
    <Subtitle>Summary</Subtitle>
    <div class="px-2">
      The user requested judgement for the statement
      "<Link
        label={props.statement.text}
        route="show-record"
        params={{tableName: 'statement', id: props.record_id}}
      />"{' '}
      <ExplLink explId={props.statement.text_expl_id} />.
      <br/>
      {props.judged_expl_id ? 
        <>The statement was judged automatically <ExplLink explId={props.judged_expl_id} />.</> :
        "Arguments still need to be checked for correlations before the statement can be judged."}
    </div>
    
    <Checks items={[
      <>Statement has at least one argument</>,
      <>All of the statement arguments were judged</>
    ]}/>
  </>)
}