import { Component, createSignal, For, Match, ParentComponent, Show, Switch } from "solid-js"
import { Button } from "~/components/buttons"
import { Subtitle } from "~/components/PageTitle"
import { firstCap, getToggleLabel } from "~/utils/string"
import { StatementType } from "~/tables/statement/statement_type"
import { Form } from "~/components/form/Form"
import { createAsync, revalidate } from "@solidjs/router"
import { getOneRecordByIdCache, listForeignRecordsCache } from "~/client-only/query"
import { DataRecordWithId } from "~/schema/type"
import { defaultArgumentTypeId } from "~/constant"

const actions = ['attack', 'defend', 'score'] as const
type Action = typeof actions[number]

const Instructions: ParentComponent<{
  setSelectedAction: (action?: Action) => void
  collapsible?: boolean
}> = props => {
  const [visible, setVisible] = createSignal(!props.collapsible)
  return (
    <div class="px-2 pt-2">
      <Show when={props.collapsible}>
        <div class="pb-1">
          <Button
            label={getToggleLabel(visible(), 'instructions')}
            onClick={() => setVisible(x => !x)}
          />
        </div>
      </Show>
      <Show when={visible()}>
        {props.children}
        <div class="pt-1 pb-2">
          <Button
            label="Back"
            onClick={() => props.setSelectedAction()}
          />
        </div>
      </Show>
    </div>
  )
}

export const HowTo: Component<{
  id: number,
  statementType?: StatementType
  record?: DataRecordWithId
}> = props => {
  const [selectedAction, setSelectedAction] = createSignal<Action>()
  const argumentWeightRecord = createAsync(async () =>
    (props.statementType === 'threshold')
      ? getOneRecordByIdCache('argument_weight', props.id, true)
      : undefined
  )
  const typeQuestions = createAsync(async () => props.record
    ? await listForeignRecordsCache(
      'critical_question', 'argument_type_id', props.record!.argument_type_id as number
    ) : undefined
  )
  const onWeightUpdate = (savedId?: number) => {
    if (savedId) {
      revalidate(getOneRecordByIdCache.keyFor('argument_weight', props.id, true))
    }
    setSelectedAction()
  }
  return (
    <div class="flex-2 border-l">
      <div class='border-b'>
        <Subtitle>How To</Subtitle>
      </div>
      <Switch>
        <Match when={selectedAction() === 'attack'}>
          <Instructions {...{setSelectedAction}}>
            Please ask yourself the following questions:
            <div class="h-1" />
            1) Is there any unadded premise that, if false, would weaken the argument? If so then add it to the list of premises. If it's a hidden premise, edit the argument to make the premise more obvious.
            <div class="h-1" />
            2) Is the confidence value for a premise too high? If so, open the premise and try adding or supporting a con argument, or attacking a pro argument.
            <div class="h-1" />
            3) Does the argument use an ambiguous term that might change its meaning? If so, please edit the text of the argument and / or add a definition for the term to remove the ambiguity.
            <div class="h-1" />
            4) Does the argument address the right statement? If not, please either change the text of the argument or recreate the argument under the appropriate statement.
            <div class="h-1" />
            5) Would the argument be more clear if divided into multiple arguments? If so, please create new arguments and split the original argument's text between them.
            <div class="h-1" />
            <Show when={props.record?.argument_type_id === defaultArgumentTypeId}>
            6) What type of argument is this? Please click on the "Type" tab in the first column to specify the type. Once this is done, critical questions that are specific to this type of argument will be added to this list.
            </Show>
            <Show when={props.record?.argument_type_id !== defaultArgumentTypeId}>
            6) Was the type of this argument identified correctly? If not, please select the correct type.
            <For each={typeQuestions()}>
              {(question, index) => (
                <>
                  <div class="h-1" />
                  {7 + index()}) {question.text}
                </>
              )}
            </For>
            </Show>

            <div class="h-2" />
            Please research criticisms of this argument.

            <div class="h-2" />
            You might lack permissions to perform some of the actions suggested above. If that's the case, please ask someone on our Discord to help you with that.

          </Instructions>
        </Match>
        <Match when={selectedAction() === 'defend'}>
          <Instructions {...{setSelectedAction}}>
            You can defend the argument in several ways.
            <div class="h-1" />
            1) Increase the platform's confidence in the premises of this argument. You can do that by opening a premise and adding arguments in its favour or attacking arguments against the premise.
            <div class="h-1" />
            Please note that you don't have to justify things all the way down, just far enough that others would agree, or if they disagree it's their responsibility to break it down further.
            <div class="h-1" />
            2) If the argument doesn't actually rely on one of the premises that are listed, then your should remove that premise and explain why.
            <div class="h-1" />
            3) Examine the weak sides of this argument by reading the instructions on how to attack it. Edit the text of the argument to create a stronger version that would stand better against the attacks.
          </Instructions>
        </Match>
        <Match when={selectedAction() === 'score'}>
          <Switch>
            <Match when={props.statementType === 'descriptive'}>
              <Instructions {...{setSelectedAction}}>
                The % strength score of the argument is calculated automatically. This is done by multiplying % confidences of its premises listed in the middle column. For example if the argument relies on two premises with certainties 90% and 75%, the argument strength will be calculated to be 0.9 * 0.75 = 0.675 = 67.5%.
                <div class="h-2" />
                If you disagree with the score please think of the reason the score is wrong.
                <div class="h-1" />
                1) If you think that the certainties in one or more of the premises are wrong, please open that premise to see why the certainty was calculated that way and what you can do about it.
                <div class="h-1" />
                2) If you think that some of the premises are missing please add them to the list and score their certainties as you see fit.
                <div class="h-1" />
                3) If you think that the argument doesn't actually rely on one of the premises that are listed, please remove it and explain your reason for doing so. If you don't have permission to do that, please ask in our Discord server for someone who does.
                <div class="h-1" />
                4) If you think that the method of multiplying certainties of premises together to get the strength of the argument results in the incorrect score in for this argument please raise this issue in our Discord server.
              </Instructions>
            </Match>
            <Match when={props.statementType === 'threshold'}>
              <Show when={props.record?.canUpdate}>
                <Instructions {...{setSelectedAction}} collapsible>
                  The claim of this argument is about whether the positive factors will outweigh the negative factors. This argument describes one or more of such factors. Please score the weight of this factor by specifying a range of weights and the most likely weight. If premises specify information about the weights, the weight should reflect that information. All arguments have to use the same unit of weight. The unit might have a well established meaning or an improvised one. The important thing is that the ratio of the weights between the different arguments reflect their relative influence on the claim.
                </Instructions>
                <div class="h-2" />
                <Form
                  tableName="argument_weight"
                  id={argumentWeightRecord()?.id}
                  record={argumentWeightRecord()}
                  preset={argumentWeightRecord()
                    ? undefined : { id: props.id }}
                  exitSettings={{ onExit: onWeightUpdate }}
                />
              </Show>
              <Show when={!props.record?.canUpdate}>
                <Instructions {...{setSelectedAction}}>
                  You don't have permission to edit this argument. Sorry.
                </Instructions>
              </Show>
            </Match>
            <Match when={props.statementType === 'prescriptive'}>
              <Instructions {...{setSelectedAction}}>
                This argument makes a claim about what should be done. It doesn't have a single strength score. Instead the argument lists some consequences of the proposed action. Please list the values of those consequences at the bottom of the middle column in order to influence the platform's verdict on the correctness of the claim.
              </Instructions>
            </Match>
          </Switch>
        </Match>
        <Match when>
          <div class="px-2 pt-2">
            What would you like to do with this argument?
          </div>
          <div class="px-2 py-2 flex gap-2 items-start">
            <For each={actions}>
              { action => (
                <Button
                  label={firstCap(action)}
                  onClick={() => setSelectedAction(action)}
                />
              )}
            </For>
          </div>
        </Match>
      </Switch>
    </div>
  )
}