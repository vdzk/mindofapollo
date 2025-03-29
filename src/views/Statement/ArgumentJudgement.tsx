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

export const ArgumentJudgement: Component<{
  argumentId: number,
  record?: DataRecordWithId
}> = props => {
  const judgement = createAsync(() => getOneRecordByIdCache('argument_judgement', props.argumentId))
  const canJudge = () => useBelongsTo(whoCanUpdateRecord('argument_judgement'))
  const [wantsToJudge, setWantsToJudge] = createSignal(false)
  const [confirmedPreJudgementCheck, setConfirmedPreJudgementCheck] = createSignal(false)
  const hasUndecided = createAsync(() => hasUndecidedCriticalStatement(props.argumentId))
  const onJudgeArgumentExit = () => {
    setWantsToJudge(false)
    setConfirmedPreJudgementCheck(false)
  }

  const viewName = createMemo(() => {
    if (!props.record) return 'blank'
    if (hasUndecided()) {
      return 'has-undecided'
    } else {
      if (wantsToJudge()) {
        if (confirmedPreJudgementCheck() || judgement()) {
          return 'judge-argument'
        } else {
          return 'pre-judgement-check'
        }
      } else {
        if (judgement()) {
          return 'latest-judgement'
        } else {
          return 'no-judgement'
        }
      }
    }
  })

  return (
    <div class="border-l flex-1">
      <Subtitle>Judgement</Subtitle>
      <Switch>
        <Match when={viewName() === 'has-undecided'}>
          <div class="px-2">
            Certaininty in some of the critical statments has not yet been decided.
          </div>
        </Match>
        <Match when={viewName() === 'no-judgement'}>
          <div class="px-2">
            The argument has not been judged yet.
          </div>
          <Show when={canJudge()}>
            <div class="px-2 pt-2">
              <Button
                label="Judge"
                onClick={() => setWantsToJudge(true)}
              />
            </div>
          </Show>
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
        <Match when={viewName() === 'latest-judgement'}>
          <RecordDetails
            tableName="argument_judgement"
            id={props.argumentId}
            displayColumn={colName => !['label', 'dismissal_explanation'].includes(colName)}
          />
          <div class="px-2">
            <Button
              label="Re-judge"
              onClick={() => setWantsToJudge(true)}
            />
          </div>
        </Match>
      </Switch>
    </div>
  )
}
