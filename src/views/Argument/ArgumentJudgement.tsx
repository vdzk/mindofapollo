import { createAsync } from "@solidjs/router"
import { Component, createEffect, createMemo, createSignal, Match, Setter, Show, Switch } from "solid-js"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { Button } from "~/components/buttons"
import { JudgeArgument } from "./JudgeArgument"
import { RecordDetails } from "~/components/RecordDetails"
import { getOneRecordByIdCache } from "~/client-only/query"
import { ConditionArgument } from "./ConditionArgument"
import { Form } from "~/components/form/Form"
import { whoCanInsertRecord } from "~/api/insert/record"

const judgementTableName = {
  'descriptive': 'argument_judgement',
  'threshold': 'argument_weight'
}

export const ArgumentJudgement: Component<{
  argumentId: number,
  argumentTypeId: number,
  statementType: 'descriptive' | 'threshold'
}> = props => {
  const judgement = createAsync(() => getOneRecordByIdCache(
    judgementTableName[props.statementType], props.argumentId, true
  ))
  const conditionalConfidence = createAsync(() => getOneRecordByIdCache(
    'argument_conditional', props.argumentId, true
  ))
  const canJudge = () => judgement()
    ? judgement()!.canUpdate
    : useBelongsTo(whoCanInsertRecord('argument_judgement'))
  const canCondition = () => conditionalConfidence()
    ? conditionalConfidence()!.canUpdate
    : useBelongsTo(whoCanInsertRecord('argument_conditional'))
  const [wantsToJudge, setWantsToJudge] = createSignal(false)
  const [wantsToCondition, setWantsToCondition] = createSignal(false)
  const onJudgeArgumentExit = () => {
    setWantsToJudge(false)
  }

  createEffect(() => {
    props.argumentId
    setWantsToJudge(false)
    setWantsToCondition(false)
  })

  const viewName = createMemo(() => {
    if (wantsToJudge()) {
      return 'judge-argument'
    } else if (wantsToCondition()) {
      return 'condition-argument'
    } else {
      if (judgement()) {
        return 'judgement'
      } else {
        return 'no-judgement'
      }
    }
  })

  const getJudgeButton = () => (
    <Show when={canJudge()}>
      <div class="px-2">
        <Button
          label={judgement() ? "Re-judge" : "Judge"}
          onClick={() => setWantsToJudge(true)}
        />
      </div>
    </Show>
  )

  return (
    <Switch>
      <Match when={viewName() === 'no-judgement'}>
        <div class="px-2 py-2">
          The argument has not been judged yet.
        </div>
        {getJudgeButton()}
      </Match>
      <Match when={
        viewName() === 'judge-argument' && props.statementType === 'descriptive'
      }>
        <JudgeArgument
          argumentId={props.argumentId}
          argumentTypeId={props.argumentTypeId}
          onExit={onJudgeArgumentExit}
          judgement={judgement()}
        />
      </Match>
      <Match when={viewName() === 'judge-argument'}>
        <Form
          tableName={judgementTableName[props.statementType]}
          id={judgement()?.id}
          record={judgement()}
          preset={judgement() ? undefined : { id: props.argumentId }}
          exitSettings={{ onExit: onJudgeArgumentExit }}
        />
      </Match>
      <Match when={viewName() === 'condition-argument'}>
        <ConditionArgument
          judgement={judgement()!}
          conditionalConfidence={conditionalConfidence()}
          setWantsToCondition={setWantsToCondition}
        />
      </Match>
      <Match when={viewName() === 'judgement' && props.statementType === 'descriptive'}>
        <div class="h-2" />
        <RecordDetails
          tableName="argument_judgement"
          id={props.argumentId}
          displayColumn={colName => colName !== 'label'}
        />
        {getJudgeButton()}
        <div class="h-2" />
        <Show when={conditionalConfidence()}>
          <RecordDetails
            tableName="argument_conditional"
            id={props.argumentId}
          />
        </Show>
        <Show when={canCondition()}>
          <div class="px-2">
            <Button
              label={`${conditionalConfidence() ? "Edit" : "Apply"} conditional confidence`}
              onClick={() => setWantsToCondition(true)}
            />
          </div>
        </Show>
      </Match>
      <Match when={viewName() === 'judgement'}>
        <div class="h-2" />
        <RecordDetails
          tableName={judgementTableName[props.statementType]}
          id={props.argumentId}
        />
        {getJudgeButton()}
      </Match>
    </Switch>
  )
}
