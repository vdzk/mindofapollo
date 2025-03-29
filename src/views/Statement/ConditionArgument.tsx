import { Component, Setter } from "solid-js";
import { Detail } from "~/components/details";
import { Form } from "~/components/form/Form";
import { DataRecordWithId } from "~/schema/type";

export const ConditionArgument: Component<{
  judgement: DataRecordWithId,
  conditionalConfidence?: DataRecordWithId,
  setWantsToCondition: Setter<boolean>
  refreshStatementConfidence: () => void
}> = props => {
  const onExit = () => {
    props.setWantsToCondition(false)
    props.refreshStatementConfidence()
  }

  return (
    <>
      <Detail
        tableName="argument_judgement"
        colName="isolated_confidence"
        label="Isolated confidence"
        record={props.judgement}
      />
      <div class="px-2 font-bold">Instructions</div>
      <div class="px-2 pb-2">
        Imagine that all of the arguments listed above this one on the same pro/con side have failed. How much confidence in the conclusion will this argument bring in that case?
      </div>
      <Form
        tableName="argument_conditional"
        id={props.conditionalConfidence?.id}
        record={props.conditionalConfidence}
        exitSettings={{ onExit }}
        preset={props.conditionalConfidence ? undefined : {id: props.judgement.id}}
      />
    </>

  )
}