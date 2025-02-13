import { Link } from "~/components/Link"
import { AddExplId, ExplComponent, ExplDiff } from "../types"
import { Subtitle } from "~/components/PageTitle"
import { DataLiteral, DataRecord } from "~/schema/type"
import { ExplLink } from "../ExplLink"
import { Checks } from "../Checks"

export interface JudgeArgumentExpl {
  argument: AddExplId<{
    id: DataLiteral,
    title: DataLiteral,
    statement_id: DataLiteral
  }>,
  statement: AddExplId<{
    text: DataLiteral
  }>,
  insert: {
    argument_judgement: DataRecord
  },
  diff: ExplDiff<{judgement_requested: boolean}>
}

export const JudgeArgument: ExplComponent<JudgeArgumentExpl> = props => {
  return (<>
    <Subtitle>Summary</Subtitle>
    <div class="px-2">
      The user judged the argument 
      "<Link
        label={props.argument.title}
        route="show-record"
        params={{tableName: 'argument', id: props.argument.id}}
      />"{' '}
      <ExplLink explId={props.argument.title_expl_id} />
      <br/>for/against the statement "
      <Link
        label={props.statement.text}
        route="show-record"
        params={{tableName: 'statement', id: props.argument.statement_id}}
      />"{' '}
      <ExplLink explId={props.statement.text_expl_id} />
    </div>
    
    <Checks items={[
      <>The argument was not created by the user themself</>,
      <>The argument was in the pool of arguments pending judgment</>,
      <>The argument was randomly selected from the pending pool to ensure fair processing order</>,
    ]}/>
  </>)
}