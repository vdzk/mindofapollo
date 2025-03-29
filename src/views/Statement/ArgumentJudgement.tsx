import { createAsync } from "@solidjs/router"
import { Component, createMemo, createSignal, Match, Show, Switch } from "solid-js"
import { hasUndecidedCriticalStatement } from "~/api/has/undecidedCriticalStatement"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { Button } from "~/components/buttons"
import { Subtitle } from "~/components/PageTitle"
import { DataRecordWithId } from "~/schema/type"
import { JudgeArgument } from "./JudgeArgument"
import { RecordDetails } from "~/components/RecordDetails"
import { getOneRecordByIdCache } from "~/client-only/query"
import { whoCanUpdateRecord } from "~/api/update/record"
import { ConditionArgument } from "./ConditionArgument"

export const ArgumentJudgement: Component<{
  argumentId: number,
  firstArgOnSide: boolean,
  record?: DataRecordWithId
}> = props => {
  const judgement = createAsync(() => getOneRecordByIdCache('argument_judgement', props.argumentId))
  const conditionalConfidence = createAsync(() => getOneRecordByIdCache('argument_conditional', props.argumentId))
  const canJudge = () => useBelongsTo(whoCanUpdateRecord('argument_judgement'))
  const canCondition = () => useBelongsTo(whoCanUpdateRecord('argument_conditional'))
  const [wantsToJudge, setWantsToJudge] = createSignal(false)
  const [wantsToCondition, setWantsToCondition] = createSignal(false)
  const [confirmedPreJudgementCheck, setConfirmedPreJudgementCheck] = createSignal(false)
  const hasUndecided = createAsync(() => hasUndecidedCriticalStatement(props.argumentId))
  const onJudgeArgumentExit = () => {
    setWantsToJudge(false)
    setConfirmedPreJudgementCheck(false)
  }

  const viewName = createMemo(() => {
    if (!props.record) return 'blank'

    if (wantsToJudge()) {
      if (confirmedPreJudgementCheck() || judgement()) {
        return 'judge-argument'
      } else {
        return 'pre-judgement-check'
      }
    } else if (wantsToCondition()) {
      return 'condition-argument'
    } else {
      if (judgement()) {
        return 'latest-judgement'
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
          disabled={hasUndecided()}
        />
        <Show when={hasUndecided()}>
          <div class="text-sm pt-1">
            Certaininty in some of the critical statments has not yet been decided.
          </div>
        </Show>
      </div>
    </Show>
  )

  return (
    <div class="border-l flex-1">
      <Subtitle>Judgement</Subtitle>
      <Switch>
        <Match when={viewName() === 'no-judgement'}>
          <div class="px-2 pb-2">
            The argument has not been judged yet.
          </div>
          {getJudgeButton()}
        </Match>
        <Match when={viewName() === 'pre-judgement-check'}>
          <div class="px-2">
            Please confirm the following before proceding:
            <ul class="list-disc pl-4">
              <li>I have applied each of the critical questions to the argument.</li>
              <li>I have researched criticisms of this argument.</li>
              <li>Each of the critical questions has all of the relevant and significant critical statements that I can think of listed under.</li>
            </ul>
          </div>
          <div class="px-2 pt-2 flex gap-2">
            <Button
              label="I confirm"
              onClick={() => setConfirmedPreJudgementCheck(true)}
            />
            <Button
              label="Cancel"
              onClick={() => setWantsToJudge(false)}
            />
          </div>
        </Match>
        <Match when={viewName() === 'judge-argument'}>
          <JudgeArgument
            argumentId={props.argumentId}
            onExit={onJudgeArgumentExit}
            currentJudgement={judgement()}
          />
        </Match>
        <Match when={viewName() === 'condition-argument'}>
          <ConditionArgument
            judgement={judgement()!}
            conditionalConfidence={conditionalConfidence()}
            setWantsToCondition={setWantsToCondition}
          />
        </Match>
        <Match when={viewName() === 'latest-judgement'}>
          <RecordDetails
            tableName="argument_judgement"
            id={props.argumentId}
            displayColumn={colName => !['label', 'dismissal_explanation'].includes(colName)}
          />
          {getJudgeButton()}
          <div class="h-2" />
          <Show when={conditionalConfidence()}>
            <RecordDetails
              tableName="argument_conditional"
              id={props.argumentId}
            />
          </Show>
          <Show when={canCondition() && !props.firstArgOnSide}>
          <div class="px-2">
            <Button
              label={`${conditionalConfidence() ? "Edit" : "Apply"} conditional confidence`}
              onClick={() => setWantsToCondition(true)}
            />
          </div>
          </Show>
        </Match>
      </Switch>
    </div>
  )
}
