import { Link } from "~/components/Link";
import { AddExplId, ExplComponent, ExplDiff } from "../types";
import { Subtitle } from "~/components/PageTitle";
import { DataLiteral } from "~/schema/type";
import { ExplLink } from "../ExplLink";
import { Checks } from "../Checks";

export interface ReqArgJudgeExpl {
  argument: AddExplId<{title: DataLiteral}>
  statement: AddExplId<{argument_aggregation_type_id: DataLiteral}>
  critical_statement: AddExplId<{id: DataLiteral}>
  diff: ExplDiff<{judgement_requested: boolean}>
}

export const ReqArgJudge: ExplComponent<ReqArgJudgeExpl> = props => {
  return (<>
    <Subtitle>Summary</Subtitle>
    <div class="px-2">
      An authorised user requested judgement for the argument
      "<Link
        label={props.argument.title}
        route="show-record"
        params={{ tableName: 'argument', id: props.record_id }}
      />" <ExplLink explId={props.argument.title_expl_id} />
    </div>
    
    <Checks items={[
      <>Arguments for/against the target statment are evidential{' '}
      <ExplLink explId={props.statement.argument_aggregation_type_id_expl_id} />
      , so initially they can be assesed independently of each other.</>,

      <>The user has added a critical statement against the argument{' '}
      <ExplLink explId={props.critical_statement.id_expl_id} />.{' '}
      <br/>Hence the user is less likely to be very biased for the argument.
      <br/>Hence it's less likely that the user was trying to protect the argument against criticism by requesting judgement before others had a chance to criticise it.</>
    ]}/>
  </>)
}